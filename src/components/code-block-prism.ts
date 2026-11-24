// Prism for CodeBlock (code-block.tsx), read in a worker (code-block-worker.ts), never on the page.
// Prism's grammars take time that grows faster than the code on some text: one match of
// TypeScript's over a string of 50,000 characters takes seconds, and no part of it can be cut
// short or paused. Code in a block is often a model's, so whatever it is, Prism reads it in the
// worker, whole, as Prism reads any text; the page draws it plain until the worker answers, and
// keeps it plain when the worker takes too long (code-block.tsx). This file is what both sides
// share, and loads no Prism: the worker passes its own.
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
 * The most runs a line may have, and the most the page draws coloured in one frame. Code a line of
 * which has more (minified code, a line of thousands of punctuation marks) stays plain: drawn
 * coloured, that one line would hold the page.
 */
export const MOST_RUNS = 2000;

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
 * such grammar, and when a line has more than MOST_RUNS.
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
  // The runs in the line read last, and whether a line had too many.
  let inLine = 0;
  let tooMany = false;
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
    const lineEnd = text.lastIndexOf("\n");
    if (kinds.at(-1) === kind) {
      ends[ends.length - 1] = at;
    } else {
      ends.push(at);
      kinds.push(kind);
      inLine += 1;
    }
    if (lineEnd !== -1) {
      inLine = lineEnd < text.length - 1 ? 1 : 0;
    }
    tooMany ||= inLine > MOST_RUNS;
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
  if (tooMany) {
    return null;
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

/**
 * The first `most` lines of `code`, coloured by `read`, Prism's runs for `read.code`: all of them
 * when that is the code, and while the code is still being written and has grown past it, the
 * lines `read.code` ended. Past what the runs colour, and with no runs, each line is one plain run.
 */
export const linesOf = (
  code: string,
  read: { code: string; runs: Runs } | null,
  most = Number.POSITIVE_INFINITY
): Line[] => {
  const lines: Line[] = [[]];
  const add = (text: string, types: string[]) => {
    const parts = text.split("\n");
    for (const [index, part] of parts.entries()) {
      if (index > 0) {
        lines.push([]);
      }
      if (part) {
        lines.at(-1)?.push({ text: part, types });
      }
    }
  };
  let coloured = 0;
  if (read !== null && code.startsWith(read.code)) {
    coloured =
      read.code.length === code.length
        ? code.length
        : read.code.lastIndexOf("\n") + 1;
  }
  let start = 0;
  if (read !== null && coloured > 0) {
    const { ends, kinds, names } = read.runs;
    const types = names.map((name) => (name ? name.split(" ") : []));
    for (const [index, runEnd] of ends.entries()) {
      if (start >= coloured || lines.length > most) {
        break;
      }
      const end = Math.min(runEnd, coloured);
      add(code.slice(start, end), types[kinds[index] ?? 0] ?? []);
      start = end;
    }
  }
  // The rest, plain, as far as the lines asked for reach.
  add(firstLines(code.slice(start), most - lines.length + 1), []);
  // A last empty line from a trailing newline is not a line of code.
  if (lines.length > 1 && lines.at(-1)?.length === 0) {
    lines.pop();
  }
  return lines.slice(0, most);
};
