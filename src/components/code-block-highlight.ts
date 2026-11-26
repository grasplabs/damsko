// CodeBlock's highlighting (code-block.tsx), by @pierre/highlights: hand-written lexers compiled to
// WebAssembly, with no regular expressions, so a lexer reads a line in time that grows with the
// line and nothing else (3,000 lines of TypeScript in about a millisecond; a string of 50,000
// characters with no end, which held Prism for seconds, in less than one). It reads on the page.
//
// What loads, and when: never anything with the page. The first time a block in a coloured
// language is drawn, the package's core and its emitter (22 KB gzipped) and that language's lexer
// (2 to 11 KB); then each other language's lexer the first time a block in it is drawn. Each is a
// script of its own with its WebAssembly inside. Until then the code is plain; where
// WebAssembly is refused (a Content Security Policy without 'wasm-unsafe-eval', a browser without
// it), or the core or a lexer does not load, those blocks stay plain, and nothing is said.
//
// It gives each run of code the name of what it is (`keyword-import`, `string`), as a CSS variable
// of a theme that has no colours of its own (`cssVariables: true`); those names are turned here
// into Damsko's syntax colours, and the page draws them as text in spans, never as HTML.
import type * as Highlights from "@pierre/highlights/core";

import { ownValue } from "../lib/utils";

/** Loads one language's lexer. */
type Lexer = () => Promise<{ default: Highlights.Language }>;

// Each lexer by its own name: written out, so a bundler makes each a script of its own.
const typescript: Lexer = async () =>
  await import("@pierre/highlights/langs/typescript");
const html: Lexer = async () => await import("@pierre/highlights/langs/html");
const xml: Lexer = async () => await import("@pierre/highlights/langs/xml");
const css: Lexer = async () => await import("@pierre/highlights/langs/css");
const json: Lexer = async () => await import("@pierre/highlights/langs/json");
const shellscript: Lexer = async () =>
  await import("@pierre/highlights/langs/shellscript");
const python: Lexer = async () =>
  await import("@pierre/highlights/langs/python");
const markdown: Lexer = async () =>
  await import("@pierre/highlights/langs/markdown");
const yaml: Lexer = async () => await import("@pierre/highlights/langs/yaml");
const sql: Lexer = async () => await import("@pierre/highlights/langs/sql");
const diff: Lexer = async () => await import("@pierre/highlights/langs/diff");
const go: Lexer = async () => await import("@pierre/highlights/langs/go");
const rust: Lexer = async () => await import("@pierre/highlights/langs/rust");
const java: Lexer = async () => await import("@pierre/highlights/langs/java");
const c: Lexer = async () => await import("@pierre/highlights/langs/c");
const cpp: Lexer = async () => await import("@pierre/highlights/langs/cpp");
const csharp: Lexer = async () =>
  await import("@pierre/highlights/langs/csharp");
const php: Lexer = async () => await import("@pierre/highlights/langs/php");
const ruby: Lexer = async () => await import("@pierre/highlights/langs/ruby");
const kotlin: Lexer = async () =>
  await import("@pierre/highlights/langs/kotlin");
const swift: Lexer = async () => await import("@pierre/highlights/langs/swift");
const toml: Lexer = async () => await import("@pierre/highlights/langs/toml");
const docker: Lexer = async () =>
  await import("@pierre/highlights/langs/docker");

/**
 * The languages a block names, by the names people write: the name shown over the code, the
 * lexer's name for it, the extension its file is saved with, and the lexer that reads it. Another
 * language is plain text.
 */
export const languages: Record<
  string,
  { name: string; lang: string; extension: string; lexer: Lexer }
> = {
  ts: {
    name: "TypeScript",
    lang: "typescript",
    extension: "ts",
    lexer: typescript,
  },
  typescript: {
    name: "TypeScript",
    lang: "typescript",
    extension: "ts",
    lexer: typescript,
  },
  tsx: { name: "TSX", lang: "tsx", extension: "tsx", lexer: typescript },
  jsx: { name: "JSX", lang: "jsx", extension: "jsx", lexer: typescript },
  js: {
    name: "JavaScript",
    lang: "javascript",
    extension: "js",
    lexer: typescript,
  },
  javascript: {
    name: "JavaScript",
    lang: "javascript",
    extension: "js",
    lexer: typescript,
  },
  html: { name: "HTML", lang: "html", extension: "html", lexer: html },
  markup: { name: "HTML", lang: "html", extension: "html", lexer: html },
  xml: { name: "XML", lang: "xml", extension: "xml", lexer: xml },
  svg: { name: "SVG", lang: "xml", extension: "svg", lexer: xml },
  css: { name: "CSS", lang: "css", extension: "css", lexer: css },
  json: { name: "JSON", lang: "json", extension: "json", lexer: json },
  bash: { name: "Bash", lang: "bash", extension: "sh", lexer: shellscript },
  sh: { name: "Shell", lang: "bash", extension: "sh", lexer: shellscript },
  shell: { name: "Shell", lang: "bash", extension: "sh", lexer: shellscript },
  python: { name: "Python", lang: "python", extension: "py", lexer: python },
  py: { name: "Python", lang: "python", extension: "py", lexer: python },
  markdown: {
    name: "Markdown",
    lang: "markdown",
    extension: "md",
    lexer: markdown,
  },
  md: { name: "Markdown", lang: "markdown", extension: "md", lexer: markdown },
  yaml: { name: "YAML", lang: "yaml", extension: "yaml", lexer: yaml },
  yml: { name: "YAML", lang: "yaml", extension: "yml", lexer: yaml },
  sql: { name: "SQL", lang: "sql", extension: "sql", lexer: sql },
  diff: { name: "Diff", lang: "diff", extension: "diff", lexer: diff },
  go: { name: "Go", lang: "go", extension: "go", lexer: go },
  rust: { name: "Rust", lang: "rust", extension: "rs", lexer: rust },
  rs: { name: "Rust", lang: "rust", extension: "rs", lexer: rust },
  java: { name: "Java", lang: "java", extension: "java", lexer: java },
  c: { name: "C", lang: "c", extension: "c", lexer: c },
  cpp: { name: "C++", lang: "cpp", extension: "cpp", lexer: cpp },
  "c++": { name: "C++", lang: "cpp", extension: "cpp", lexer: cpp },
  csharp: { name: "C#", lang: "csharp", extension: "cs", lexer: csharp },
  cs: { name: "C#", lang: "csharp", extension: "cs", lexer: csharp },
  "c#": { name: "C#", lang: "csharp", extension: "cs", lexer: csharp },
  php: { name: "PHP", lang: "php", extension: "php", lexer: php },
  ruby: { name: "Ruby", lang: "ruby", extension: "rb", lexer: ruby },
  rb: { name: "Ruby", lang: "ruby", extension: "rb", lexer: ruby },
  kotlin: { name: "Kotlin", lang: "kotlin", extension: "kt", lexer: kotlin },
  kt: { name: "Kotlin", lang: "kotlin", extension: "kt", lexer: kotlin },
  swift: { name: "Swift", lang: "swift", extension: "swift", lexer: swift },
  toml: { name: "TOML", lang: "toml", extension: "toml", lexer: toml },
  docker: {
    name: "Dockerfile",
    lang: "dockerfile",
    extension: "dockerfile",
    lexer: docker,
  },
  dockerfile: {
    name: "Dockerfile",
    lang: "dockerfile",
    extension: "dockerfile",
    lexer: docker,
  },
};

/** Damsko's syntax colours, one for each kind of run (code-block.tsx draws each in its token). */
export type Tone =
  | "keyword"
  | "string"
  | "constant"
  | "comment"
  | "function"
  | "punctuation"
  | "attribute"
  | "inserted"
  | "deleted";

/**
 * Which colour a run takes, by the lexer's name for it: the longest name here that the run's name
 * starts with, part by part (`keyword-import` is a keyword, `punctuation-bracket-jsx` punctuation).
 * A run with none, such as a variable's name, is in the code's own colour.
 */
const toneOfName = new Map<string, Tone>([
  ["keyword", "keyword"],
  ["preproc", "keyword"],
  ["variable-special", "keyword"],
  ["string", "string"],
  ["text-literal", "string"],
  ["link_uri", "string"],
  ["string-special-symbol", "constant"],
  ["number", "constant"],
  ["boolean", "constant"],
  ["constant", "constant"],
  ["enum", "constant"],
  ["comment", "comment"],
  ["tag-doctype", "comment"],
  ["keyword-jsdoc", "comment"],
  ["type-jsdoc", "comment"],
  ["variable-jsdoc", "comment"],
  ["function", "function"],
  ["constructor", "function"],
  ["type-builtin", "keyword"],
  ["type", "function"],
  ["tag", "function"],
  ["selector", "function"],
  ["title", "function"],
  ["punctuation", "punctuation"],
  ["operator", "punctuation"],
  ["attribute", "attribute"],
  ["property", "attribute"],
  ["diff-plus", "inserted"],
  ["diff-minus", "deleted"],
]);

const PREFIX = "var(--hls-";

const tones = new Map<string, Tone | null>();

/** The colour of a run the lexer gave `color` (`var(--hls-keyword-import)`). */
const toneOf = (color: string | undefined): Tone | null => {
  if (color === undefined) {
    return null;
  }
  const known = tones.get(color);
  if (known !== undefined) {
    return known;
  }
  let name = color.startsWith(PREFIX) ? color.slice(PREFIX.length, -1) : "";
  let found: Tone | null = null;
  while (name !== "" && found === null) {
    found = toneOfName.get(name) ?? null;
    name = name.slice(0, Math.max(name.lastIndexOf("-"), 0));
  }
  tones.set(color, found);
  return found;
};

/** A run of code and its colour; null for the code's own. */
export interface Run {
  text: string;
  tone: Tone | null;
}

/** One line of code: its runs, in order, two side by side never of one colour. */
export type Line = Run[];

/**
 * The most coloured runs the lines a block draws may have: past it, they are all plain. Each
 * coloured run is an element, and drawing them is what takes time now, not reading them (3,000
 * lines are read in about a millisecond): all in one frame when the block opens or its code is
 * given. Measured in Chromium against the same lines drawn as text, each run adds some 3.5 µs, and
 * 10 µs at a 3x slower processor: 5,000, some 1,500 lines of ordinary TypeScript, adds 20 ms to
 * that frame, and 50 ms slowed down; 11,000 (3,000 lines) added 40 ms and 120 ms.
 */
export const MOST_RUNS = 5000;

/**
 * The longest line the lexers colour: a line this long or longer is drawn as its text, one run.
 * Ordinary code has few so long; minified code and generated data have many, and a line of them
 * can be a coloured run at every character (`1,1,1,…`). At this length the 18 lines a block shows
 * folded are at most 4,500 runs, under MOST_RUNS, so a folded block is always coloured: 4,500 such
 * runs add 25 ms to drawing the same lines as text, 75 ms slowed down. Lines of 2,000 characters
 * could be 36,000 runs folded.
 */
export const MOST_LINE = 250;

// The theme: no colours, each run named by a CSS variable.
const theme: Highlights.Theme = {
  name: "damsko",
  appearance: "light",
  style: {},
  cssVariables: true,
};

/** The lexer's runs for some lines, as lines of runs in Damsko's colours. */
const linesOf = (lines: Highlights.ThemedToken[][]): Line[] =>
  lines.map((tokens) => {
    const line: Line = [];
    for (const { content, color } of tokens) {
      const tone = toneOf(color);
      const last = line.at(-1);
      if (last?.tone === tone) {
        last.text += content;
      } else if (content !== "") {
        line.push({ text: content, tone });
      }
    }
    return line;
  });

/** How many runs of the lines are drawn in a colour of their own: each is an element. */
export const colouredRuns = (lines: Line[]) => {
  let count = 0;
  for (const line of lines) {
    for (const run of line) {
      if (run.tone !== null) {
        count += 1;
      }
    }
  }
  return count;
};

/**
 * `code` up to its `count`th line's end, the newline that ends it kept (so a blank last line is a
 * line): all of it when it has no more lines than that.
 */
const firstLines = (code: string, count: number): string => {
  let at = -1;
  for (let line = 0; line < count; line += 1) {
    at = code.indexOf("\n", at + 1);
    if (at === -1) {
      return code;
    }
  }
  return code.slice(0, at + 1);
};

/** The first `most` lines of `code`, as text: a last newline ends a line, it does not start one. */
export const plainLines = (code: string, most: number): string[] => {
  const lines = firstLines(code, most).split("\n");
  if (lines.length > 1 && lines.at(-1) === "") {
    lines.pop();
  }
  return lines.slice(0, most);
};

// The package's core, once asked for; each language's highlighter, by its lexer, as it loads.
let core: Promise<typeof Highlights | null> | undefined;
const loading = new Map<Lexer, Promise<void>>();
let loaded: Engine = { highlighters: new Map() };
const waiting = new Set<() => void>();

/**
 * Loads the core, and with it the emitter every highlighter shares (a highlighter of no language
 * compiles it), while the first lexer is still coming: null where either cannot load or
 * WebAssembly is refused, which the page then reports once, and no lexer is tried.
 */
const loadCore = async () => {
  try {
    const found = await import("@pierre/highlights/core");
    await found.createHighlighter({ langs: [], themes: [theme] });
    return found;
  } catch {
    return null;
  }
};

/** Loads a language's lexer and makes its highlighter, then tells every block waiting. */
const loadOnce = async (lexer: Lexer) => {
  let highlighter: Highlights.RegisteredHighlighter | null = null;
  try {
    core ??= loadCore();
    const [found, { default: language }] = await Promise.all([core, lexer()]);
    highlighter =
      found === null
        ? null
        : await found.createHighlighter({ langs: [language], themes: [theme] });
  } catch {
    // The lexer did not load, or WebAssembly was refused it: this language stays plain.
  }
  loaded = {
    highlighters: new Map(loaded.highlighters).set(lexer, highlighter),
  };
  for (const each of waiting) {
    each();
  }
};

/** Loads a language's lexer, once. */
const load = async (lexer: Lexer) => {
  let once = loading.get(lexer);
  if (once === undefined) {
    once = loadOnce(lexer);
    loading.set(lexer, once);
  }
  await once;
};

/**
 * One block's reading of its code: while it is written, the lines a newline has ended, coloured,
 * and the text they were read from (none once past MOST_RUNS: it has given up); once it is done,
 * the lines of the code as read last, kept while the code is the same, `whole` when they are all
 * its lines.
 */
export interface Reading {
  stream: {
    language: string;
    fed: string;
    lines: Line[];
    runs: number;
  } | null;
  done: {
    code: string;
    language: string;
    lines: Line[];
    whole: boolean;
  } | null;
}

export const newReading = (): Reading => ({ stream: null, done: null });

/**
 * The lexers loaded so far, as a block reads them: each language's highlighter once its lexer has
 * loaded, null where it cannot. A new object each time one loads, so a block that waits for one
 * draws again.
 */
export interface Engine {
  highlighters: ReadonlyMap<Lexer, Highlights.RegisteredHighlighter | null>;
}

/**
 * The highlighter for a block's language and the lexer's name for it; null for a language that is
 * not coloured, while its lexer loads (the first ask starts it) and where it cannot.
 */
const highlighterOf = (engine: Engine, language: string) => {
  const found = ownValue(languages, language.toLowerCase());
  if (found === undefined) {
    return null;
  }
  if (!engine.highlighters.has(found.lexer)) {
    void load(found.lexer);
  }
  const highlighter = engine.highlighters.get(found.lexer) ?? null;
  return highlighter === null ? null : { highlighter, lang: found.lang };
};

/** `code`'s lines as the lexer reads them, a last empty line from a trailing newline left out. */
const readLines = (
  highlighter: Highlights.RegisteredHighlighter,
  lang: string,
  code: string
) => {
  const { tokens } = highlighter.codeToTokens(code, {
    lang,
    theme,
    tokenizeMaxLineLength: MOST_LINE,
  });
  if (tokens.length > 1 && tokens.at(-1)?.length === 0) {
    tokens.pop();
  }
  return tokens;
};

/**
 * While `code` is written: its first `most` lines a newline has ended, coloured; null while they
 * are past MOST_RUNS, its lexer has not loaded, or the language is not coloured. When a newline
 * ends another line, the lines ended are read again and only the new ones made: the lexers never
 * change a line once its newline has come, so each line already given stays the same object and
 * is never drawn again. Reading again costs about a millisecond for 2,000 lines; the package's
 * stream, which reads only what is new, needs its 400 KB module with every language. A render that
 * gives the same code again reads nothing.
 */
export const writtenLines = (
  reading: Reading,
  engine: Engine,
  code: string,
  language: string,
  most: number
): Line[] | null => {
  const found = highlighterOf(engine, language);
  if (found === null) {
    reading.stream = null;
    return null;
  }
  let { stream } = reading;
  if (
    stream === null ||
    stream.language !== language ||
    !code.startsWith(stream.fed)
  ) {
    stream = { language, fed: "", lines: [], runs: 0 };
    reading.stream = stream;
  }
  const ended = code.slice(0, code.lastIndexOf("\n") + 1);
  if (
    stream.runs <= MOST_RUNS &&
    ended.length > stream.fed.length &&
    stream.lines.length < most
  ) {
    const more = linesOf(
      readLines(found.highlighter, found.lang, firstLines(ended, most)).slice(
        stream.lines.length
      )
    );
    stream.fed = ended;
    stream.runs += colouredRuns(more);
    stream.lines = [...stream.lines, ...more];
  }
  return stream.runs > MOST_RUNS ? null : stream.lines.slice(0, most);
};

/**
 * `code` done: its first `most` lines, coloured; null when it is not coloured or its lexer has not
 * loaded. When it was written in this block and is what was read while it was written and more,
 * each line read then stays the same object, so no line already drawn is drawn again.
 */
export const doneLines = (
  reading: Reading,
  engine: Engine,
  code: string,
  language: string,
  most: number
): Line[] | null => {
  const { done, stream } = reading;
  if (
    done !== null &&
    done.code === code &&
    done.language === language &&
    (done.whole || most <= done.lines.length)
  ) {
    return most < done.lines.length ? done.lines.slice(0, most) : done.lines;
  }
  const found = highlighterOf(engine, language);
  if (found === null) {
    return null;
  }
  const read = firstLines(code, most);
  const tokens = readLines(found.highlighter, found.lang, read);
  const kept =
    stream !== null &&
    stream.runs <= MOST_RUNS &&
    stream.language === language &&
    code.startsWith(stream.fed)
      ? stream.lines.slice(0, tokens.length)
      : [];
  const lines = [...kept, ...linesOf(tokens.slice(kept.length))];
  reading.stream = null;
  // Every line read is kept, so Show more and Show less give the same objects.
  reading.done = { code, language, lines, whole: read.length === code.length };
  return most < lines.length ? lines.slice(0, most) : lines;
};

/**
 * Hears when a language's lexer has loaded, or cannot. For `useSyncExternalStore`, by a block as
 * it is first drawn; a block reading its code asks for its language's lexer, and the first ask
 * loads the core with it.
 */
export const watchEngine = (heard: () => void) => {
  waiting.add(heard);
  return () => {
    waiting.delete(heard);
  };
};

/** The lexers loaded so far. */
export const currentEngine = (): Engine | null => loaded;

/** Before the page is live there are no lexers: the code is drawn plain. */
export const noEngine = (): Engine | null => null;

/** Loads `language`'s lexer, for a reading outside the page (the unit tests). */
export const loadLanguage = async (language: string) => {
  const found = ownValue(languages, language.toLowerCase());
  if (found !== undefined) {
    await load(found.lexer);
  }
};
