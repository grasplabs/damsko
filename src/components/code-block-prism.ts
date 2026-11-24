// Prism for CodeBlock (code-block.tsx), read in a worker (code-block-worker.ts), never on the page.
// Prism's grammars take time that grows faster than the code on some text: one match of
// TypeScript's over a string of 50,000 characters takes seconds, and no part of it can be cut
// short or paused. Code in a block is often a model's, so whatever it is, Prism reads it in the
// worker, whole, as Prism reads any text; the page draws it plain until the worker answers, and
// keeps it plain when the worker takes too long (code-block.tsx). This file is what both sides
// share (the languages, Prism's tokens turned into runs) and how the page turns runs into lines;
// it loads no Prism: the worker passes its own.
import type * as PrismTypes from "prismjs";

type PrismModule = typeof PrismTypes;
type PrismToken = PrismTypes.Token;

/**
 * The languages a block can name, by the names people write: the name shown over the code, and
 * Prism's grammar for it. The worker loads every one of these grammars.
 */
export const languages: Record<string, { name: string; grammar: string }> = {
  ts: { name: "TypeScript", grammar: "typescript" },
  typescript: { name: "TypeScript", grammar: "typescript" },
  tsx: { name: "TSX", grammar: "tsx" },
  jsx: { name: "JSX", grammar: "jsx" },
  js: { name: "JavaScript", grammar: "javascript" },
  javascript: { name: "JavaScript", grammar: "javascript" },
  html: { name: "HTML", grammar: "markup" },
  markup: { name: "HTML", grammar: "markup" },
  xml: { name: "XML", grammar: "markup" },
  svg: { name: "SVG", grammar: "markup" },
  css: { name: "CSS", grammar: "css" },
  json: { name: "JSON", grammar: "json" },
  bash: { name: "Bash", grammar: "bash" },
  sh: { name: "Shell", grammar: "bash" },
  shell: { name: "Shell", grammar: "bash" },
  python: { name: "Python", grammar: "python" },
  py: { name: "Python", grammar: "python" },
  markdown: { name: "Markdown", grammar: "markdown" },
  md: { name: "Markdown", grammar: "markdown" },
  yaml: { name: "YAML", grammar: "yaml" },
  yml: { name: "YAML", grammar: "yaml" },
  sql: { name: "SQL", grammar: "sql" },
  diff: { name: "Diff", grammar: "diff" },
  go: { name: "Go", grammar: "go" },
  rust: { name: "Rust", grammar: "rust" },
};

/**
 * Code as Prism reads it, in runs: where each ends in the code, and which of `kinds` it is. A kind
 * is Prism's names for a run ("keyword", "string"), outermost first, joined by spaces; a run Prism
 * names nothing is "". Two runs side by side of one kind are one.
 */
export interface Runs {
  ends: Uint32Array;
  kinds: Uint32Array;
  names: string[];
}

/**
 * The most runs code may have and be coloured: code Prism reads as more (minified code, generated
 * data, a file of a thousand lines and more) stays plain, all of it. Every run is a node the page
 * draws, all in one frame when the block opens; 5,000 is what Chromium, Firefox and WebKit draw in
 * that frame with room to spare, at any density: about 900 lines of ordinary code, at 5 or 6 runs
 * a line, or a screen of minified code.
 */
export const MOST_RUNS = 5000;

/** A run of code and what Prism says it is, outermost first. */
export interface Segment {
  text: string;
  types: string[];
}

/** One line of code: its runs, in order. */
export type Line = Segment[];

/** Whether `value` is Prism itself. */
export const isPrism = (value: unknown): value is PrismModule =>
  typeof value === "object" &&
  value !== null &&
  "tokenize" in value &&
  "languages" in value;

const aliasesOf = (alias: string | string[]): string[] => {
  if (Array.isArray(alias)) {
    return alias;
  }
  return alias ? [alias] : [];
};

/**
 * `code` read whole by Prism in `grammar` (a value of `languages`), as runs; null when Prism has no
 * such grammar.
 */
export const runsOf = (
  Prism: PrismModule,
  code: string,
  grammar: string
): Runs | null => {
  // Only a grammar's own entry: Prism keeps its methods (`extend`, `DFS`) beside them.
  const found: unknown = Object.hasOwn(Prism.languages, grammar)
    ? Prism.languages[grammar]
    : undefined;
  if (typeof found !== "object" || found === null) {
    return null;
  }
  const ends: number[] = [];
  const kinds: number[] = [];
  const names: string[] = [];
  const kindOf = new Map<string, number>();
  let at = 0;
  const add = (text: string, types: string[]) => {
    if (!text) {
      return;
    }
    const name = types.join(" ");
    let kind = kindOf.get(name);
    if (kind === undefined) {
      kind = names.length;
      names.push(name);
      kindOf.set(name, kind);
    }
    at += text.length;
    if (kinds.at(-1) === kind) {
      ends[ends.length - 1] = at;
    } else {
      ends.push(at);
      kinds.push(kind);
    }
  };
  const walk = (token: string | PrismToken, types: string[]) => {
    if (typeof token === "string") {
      add(token, types);
      return;
    }
    const inner = [...types, token.type, ...aliasesOf(token.alias)];
    const { content } = token;
    if (Array.isArray(content)) {
      for (const part of content) {
        walk(part, inner);
      }
    } else {
      walk(content, inner);
    }
  };
  for (const token of Prism.tokenize(code, found)) {
    walk(token, []);
  }
  return {
    ends: Uint32Array.from(ends),
    kinds: Uint32Array.from(kinds),
    names,
  };
};

/** `code` up to its `count`th line's end: all of it when it has no more lines than that. */
const firstLines = (code: string, count: number): string => {
  let at = -1;
  for (let line = 0; line < count; line += 1) {
    at = code.indexOf("\n", at + 1);
    if (at === -1) {
      return code;
    }
  }
  return code.slice(0, Math.max(at, 0));
};

/** Splits code into its lines: a last newline ends a line, it does not start one. */
const split = (code: string): string[] => {
  const lines = code.split("\n");
  if (lines.length > 1 && lines.at(-1) === "") {
    lines.pop();
  }
  return lines;
};

/** The first `most` lines of `code`, as text. */
export const plainLines = (code: string, most: number): string[] =>
  split(firstLines(code, most)).slice(0, most);

/** The first `most` lines of `code`, coloured by `runs`, Prism's runs for it. */
export const linesOf = (code: string, runs: Runs, most: number): Line[] => {
  const lines: Line[] = [[]];
  const add = (text: string, types: string[]) => {
    for (const [index, part] of text.split("\n").entries()) {
      if (index > 0) {
        lines.push([]);
      }
      if (part) {
        lines.at(-1)?.push({ text: part, types });
      }
    }
  };
  const { ends, kinds, names } = runs;
  const types = names.map((name) => (name ? name.split(" ") : []));
  let start = 0;
  for (const [index, end] of ends.entries()) {
    if (lines.length > most) {
      break;
    }
    add(code.slice(start, end), types[kinds[index] ?? 0] ?? []);
    start = end;
  }
  // A last empty line from a trailing newline is not a line of code.
  if (lines.length > 1 && lines.at(-1)?.length === 0) {
    lines.pop();
  }
  return lines.slice(0, most);
};

const sameRuns = (one: Line, other: Line) =>
  one.length === other.length &&
  one.every((run, index) => {
    const that = other[index];
    return (
      that !== undefined &&
      run.text === that.text &&
      run.types.join(" ") === that.types.join(" ")
    );
  });

/**
 * `lines`, with each line that is the same as the one at its place in `before` (the same text in the
 * same runs) taken from `before`: one object for one line, from one read to the next, so the page
 * draws again only the lines that changed.
 */
export const keepSame = (before: Line[], lines: Line[]): Line[] =>
  lines.map((line, index) => {
    const was = before[index];
    return was !== undefined && sameRuns(was, line) ? was : line;
  });

/**
 * What a read gave the page: the code read; its first lines, coloured; how many of them a newline
 * ends, and where the line after those starts; and whether they are all of the code.
 */
export interface Coloured {
  code: string;
  lines: Line[];
  ended: number;
  after: number;
  whole: boolean;
}

/** `code`'s first `most` lines coloured by `runs`, each line the same as in `before` kept from it. */
export const colouredOf = (
  code: string,
  runs: Runs,
  most: number,
  before: Line[] = []
): Coloured => {
  const lines = keepSame(before, linesOf(code, runs, most));
  let ended = 0;
  let after = 0;
  for (
    let at = code.indexOf("\n");
    at !== -1 && ended < lines.length;
    at = code.indexOf("\n", at + 1)
  ) {
    ended += 1;
    after = at + 1;
  }
  return {
    code,
    lines,
    ended,
    after,
    whole: ended < lines.length || after === code.length,
  };
};

/**
 * The first `most` lines of `code`, coloured by `read` where it can be: all it coloured when it is
 * for this code, and while the code is still being written and has grown past it, the lines a
 * newline ended in it. The rest is text, each line a string.
 */
export const colouredLines = (
  code: string,
  read: Coloured | null,
  most: number
): (Line | string)[] => {
  if (read === null || !code.startsWith(read.code)) {
    return plainLines(code, most);
  }
  if (read.whole && read.code.length === code.length) {
    return read.lines.slice(0, most);
  }
  const kept = read.lines.slice(0, Math.min(read.ended, most));
  return [...kept, ...plainLines(code.slice(read.after), most - kept.length)];
};
