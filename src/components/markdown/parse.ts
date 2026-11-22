// Markdown's pure half (markdown.tsx draws what this reads): the parse to a syntax tree, with
// GitHub's additions (tables, task lists, strikethrough, autolinks, footnotes); which links may lead
// anywhere; the repair of an answer still being written, and the tidy of one cut off; the blocks of
// a long answer read a block at a time; and the one HTML form drawn as a section that folds. Never
// HTML: raw HTML in the source stays a text node, drawn as text. No React here, so all of it is
// tested as plain functions (scripts/markdown-parse.test.ts).
//
// Pinned as the product resolves them: mdast-util-from-markdown 2.0.3, micromark-extension-gfm
// 3.0.0, mdast-util-gfm 3.1.0.
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";

// ---- The tree -----------------------------------------------------------------------------------

/** A Markdown syntax tree (mdast). */
export type MarkdownRoot = ReturnType<typeof fromMarkdown>;

/**
 * The tree of `source`. Each node keeps its offsets in the source. Should the parser fail all the
 * same, the source is one paragraph of its own words: an answer is always drawn.
 */
export const parseMarkdown = (source: string): MarkdownRoot => {
  try {
    return fromMarkdown(source, {
      extensions: [gfm()],
      mdastExtensions: [gfmFromMarkdown()],
    });
  } catch {
    return {
      type: "root",
      children: [
        { type: "paragraph", children: [{ type: "text", value: source }] },
      ],
    };
  }
};

// The tree's node types, read from the parser's own return type, so nothing beyond the parser is
// needed. Markdown's own: they never leave the folder.
export type RootContent = MarkdownRoot["children"][number];
type Of<Type extends RootContent["type"]> = Extract<
  RootContent,
  { type: Type }
>;
export type FootnoteDefinition = Of<"footnoteDefinition">;
export type List = Of<"list">;
export type ListItem = List["children"][number];
export type TableNode = Of<"table">;
export type Paragraph = Of<"paragraph">;
export type PhrasingContent = Paragraph["children"][number];

// ---- Links --------------------------------------------------------------------------------------

/**
 * A link's scheme as a browser reads it, in lower case, for a host's allow-list: what leads the
 * address once the spaces and control characters round it, and any tab or line break in it, are
 * dropped (so `JaVa\tScript:` is `javascript`). Empty for an address with no scheme (a relative
 * path, `#…`).
 */
export const schemeOf = (url: string): string => {
  // A browser drops the spaces and control characters (code 32 and under) round an address.
  let start = 0;
  let end = url.length;
  while (start < end && (url.codePointAt(start) ?? 0) <= 32) {
    start += 1;
  }
  while (end > start && (url.codePointAt(end - 1) ?? 0) <= 32) {
    end -= 1;
  }
  const cleaned = url.slice(start, end).replaceAll(/[\t\n\r]/gu, "");
  const scheme = /^(?<scheme>[a-z][a-z\d+.-]*):/iu.exec(cleaned)?.groups
    ?.scheme;
  return scheme === undefined ? "" : scheme.toLowerCase();
};

// ---- Repair: an answer still being written, made whole --------------------------------------------
//
// Half-written Markdown flips the layout when its closing mark arrives: `**bol` is stars and then
// bold, a table is a paragraph of pipes and then a table. So while an answer streams, what is open
// at its end is treated as closed (bold, emphasis, strike-through, code in a sentence, a link), a
// table is a table from its first whole row, and a last line that is only the start of something
// (a `#`, a fence, a list mark, half a table row) waits for its words. A body row that ends with its
// last pipe is whole before its line ends. The shape is right from the first character, and nothing
// re-flows.
//
// Only the end is touched: the result is the source up to `kept`, then what closes it. So a place in
// the source before `kept` is the same place in the result.

/** The source made whole: `text` is `source.slice(0, kept)` and then the marks that close it. */
export interface Repaired {
  text: string;
  kept: number;
}

const isFence = (line: string) => /^\s{0,3}(?:`{3,}|~{3,})/u.test(line);

/** Whether `source` ends inside a fence that has not been closed. */
export const openFence = (source: string): boolean =>
  source.split("\n").filter(isFence).length % 2 === 1;

// A last line still being typed that so far is only a mark: a heading's hashes, a list's bullet or
// number, a quote's angle, a rule or a heading's underline, the start of a fence.
const ONLY_A_MARK = /^\s{0,3}(?:#{1,6}|[-=*_+]+|\d{1,9}[.)]?|>+|`+|~+)\s*$/u;
const FENCE_START = /^\s{0,3}(?:`{3,}|~{3,})[^\n]*$/u;
// A table's row: it starts with a pipe. (An answer's tables do; a pipe inside a sentence is not one.)
const ROW = /^\s{0,3}\|/u;
const DELIMITER_CELL = /^:?-+:?$/u;

/** Whether a line is a table's row of dashes (`| --- | :-: |`): read cell by cell, in one pass. */
const isDelimiter = (line: string): boolean => {
  const inner = line.trim().replace(/^\|/u, "").replace(/\|$/u, "");
  return (
    inner !== "" &&
    inner.split("|").every((cell) => DELIMITER_CELL.test(cell.trim()))
  );
};

/** How many cells a row has. */
const cellsOf = (row: string): number => {
  const inner = row.trim().replace(/^\|/u, "").replace(/\|$/u, "");
  return inner.split(/(?<!\\)\|/u).length;
};

/** Where the last line starts, and the line. */
const lastLineOf = (text: string) => {
  const start = text.lastIndexOf("\n") + 1;
  return { start, line: text.slice(start) };
};

/**
 * Whether a last row not yet ended is whole all the same: a body row (the table's head and its row
 * of dashes above it) that ends with a pipe after as many cells as its head has. It is drawn at
 * once, rather than waiting for its line to end through a pause in the stream.
 */
const isWholeRow = (before: string, line: string) => {
  const end = line.trimEnd();
  if (!end.endsWith("|") || end.endsWith("\\|")) {
    return false;
  }
  const lines = before.split("\n").slice(0, -1);
  let first = lines.length;
  while (first > 0 && ROW.test(lines[first - 1] ?? "")) {
    first -= 1;
  }
  const head = lines[first] ?? "";
  return (
    lines.length - first >= 2 &&
    isDelimiter(lines[first + 1] ?? "") &&
    cellsOf(end) === cellsOf(head)
  );
};

/**
 * The end of the source with a half-typed last line taken off where it would show as marks: a
 * line that is only a mark, the first line of a fence, a table row not yet ended.
 */
const withoutHalfLine = (source: string): number => {
  const { start, line } = lastLineOf(source);
  if (line === "") {
    return source.length;
  }
  if (openFence(source.slice(0, start))) {
    // Inside a fence every line is code, but backticks or tildes alone may be the fence closing.
    return /^\s{0,3}(?:`+|~+)\s*$/u.test(line) ? start : source.length;
  }
  if (ROW.test(line) && isWholeRow(source.slice(0, start), line)) {
    return source.length;
  }
  if (ONLY_A_MARK.test(line) || FENCE_START.test(line) || ROW.test(line)) {
    return start;
  }
  return source.length;
};

/**
 * A table whose row of dashes has not arrived (or not all of it): the row of dashes it will have,
 * so its head is a table's head from the moment it is whole. What to add, or null.
 */
const tableHead = (text: string): string | null => {
  const lines = text.split("\n");
  // The text ends with whole lines only (withoutHalfLine): the last entry is "".
  const whole = lines.at(-1) === "" ? lines.slice(0, -1) : lines;
  const last = whole.at(-1) ?? "";
  const before = whole.at(-2) ?? "";
  // A head: a row with no row above it.
  if (!ROW.test(last) || isDelimiter(last) || ROW.test(before)) {
    return null;
  }
  return `${text.endsWith("\n") ? "" : "\n"}|${" --- |".repeat(cellsOf(last))}\n`;
};

interface Open {
  mark: string;
  at: number;
}

const isWord = (char: string | undefined) =>
  char !== undefined && /[\p{L}\p{N}]/u.test(char);
const isSpace = (char: string | undefined) =>
  char === undefined || /\s/u.test(char);

/** Whether only spaces stand before `at` on its line. */
const startsLine = (block: string, at: number): boolean => {
  let back = at - 1;
  while (block[back] === " " || block[back] === "\t") {
    back -= 1;
  }
  return back < 0 || block[back] === "\n";
};

/** Whether a run of stars, underscores or tildes at `at` is words, not a mark. */
const isLiteral = (block: string, at: number, run: number): boolean => {
  const char = block[at] ?? "";
  const before = block[at - 1];
  const after = block[at + run];
  // An underscore inside a word (snake_case) is a letter, and so is one star (5*3).
  if ((char === "_" || run === 1) && isWord(before) && isWord(after)) {
    return true;
  }
  // A lone tilde is a tilde; a mark with space on both sides is not one.
  if ((char === "~" && run < 2) || (isSpace(before) && isSpace(after))) {
    return true;
  }
  // A star or a line at the start of a line, with a space after it, is a list's bullet.
  return char !== "~" && run === 1 && isSpace(after) && startsLine(block, at);
};

/** `block` without the marks at its very end (stars, underscores, tildes, backticks). */
const withoutEndMarks = (block: string): string => {
  let end = block.length;
  while (end > 0 && "*_~`".includes(block[end - 1] ?? "x")) {
    end -= 1;
  }
  return block.slice(0, end);
};

/** A run opens its mark, or closes it and whatever was opened inside it. */
const toggle = (open: Open[], mark: string, at: number) => {
  const index = open.findLastIndex((entry) => entry.mark === mark);
  if (index === -1) {
    open.push({ mark, at });
  } else {
    open.splice(index);
  }
};

/** The length of the run of one character at `at`. */
const runAt = (block: string, at: number): number => {
  let run = 1;
  while (block[at + run] === block[at]) {
    run += 1;
  }
  return run;
};

/** How a link's tail (`(address "title")`) read from its parenthesis ends. */
type Tail =
  // Whole: the place after its closing parenthesis.
  | { end: number }
  // Running to the end of the block: what closes it.
  | { close: string }
  // Not a link's tail after all (`[a](b c)` is words).
  | null;

const isGap = (char: string | undefined) =>
  char === " " || char === "\t" || char === "\n";

/** The first place from `at` on that is not a space or a line break. */
const gapsFrom = (block: string, at: number): number => {
  let next = at;
  while (isGap(block[next])) {
    next += 1;
  }
  return next;
};

/**
 * Where a link's address that starts at `start` ends, and what closes the link should the block
 * end there: in angle brackets (`<a b>`), or with its parentheses balanced, as `wiki/Foo_(bar)`
 * has. Null when it is words: a line break in angle brackets, or parentheses left open before a
 * space.
 */
const addressEnd = (
  block: string,
  start: number
): { at: number; close: string } | null => {
  let at = start;
  if (block[at] === "<") {
    at += 1;
    while (at < block.length && block[at] !== ">") {
      if (block[at] === "\n" || block[at] === "<") {
        return null;
      }
      at += block[at] === "\\" ? 2 : 1;
    }
    return at < block.length ? { at: at + 1, close: ")" } : { at, close: ">)" };
  }
  let depth = 0;
  while (at < block.length && (block.codePointAt(at) ?? 0) > 32) {
    const char = block[at];
    if (char === ")" && depth === 0) {
      break;
    }
    depth += char === "(" ? 1 : 0;
    depth -= char === ")" ? 1 : 0;
    at += char === "\\" ? 2 : 1;
  }
  // Still coming, its own parentheses close before the link's.
  return depth > 0 && at < block.length
    ? null
    : { at, close: ")".repeat(depth + 1) };
};

/** What closes a title that opens with `mark`. */
const TITLE_ENDS: Record<string, string> = { '"': '"', "'": "'", "(": ")" };

/** The rest of a link's tail from its title's opening mark at `start`, which `end` closes. */
const titleTail = (block: string, start: number, end: string): Tail => {
  let at = start + 1;
  while (at < block.length && block[at] !== end) {
    at += block[at] === "\\" ? 2 : 1;
  }
  if (at >= block.length) {
    return { close: `${end})` };
  }
  at = gapsFrom(block, at + 1);
  if (at >= block.length) {
    return { close: ")" };
  }
  return block[at] === ")" ? { end: at + 1 } : null;
};

/**
 * A link's tail, read as CommonMark reads it from the character after `](`: spaces, the address,
 * spaces, a title in quotes or parentheses, spaces, and the closing parenthesis.
 */
const tailAt = (block: string, from: number): Tail => {
  const address = addressEnd(block, gapsFrom(block, from));
  if (address === null) {
    return null;
  }
  const gap = gapsFrom(block, address.at);
  if (gap >= block.length) {
    return { close: address.close };
  }
  if (block[gap] === ")") {
    return { end: gap + 1 };
  }
  const end = TITLE_ENDS[block[gap] ?? ""];
  // A title needs a space before it.
  return end === undefined || gap === address.at
    ? null
    : titleTail(block, gap, end);
};

/** Past how many `](` that open no link's tail a block's links are no longer read: no answer has that many. */
const MAX_NOT_LINKS = 32;

/**
 * The links in `block`, outside code: the one cut off at its end (where its `[` is, and what closes
 * it), and the block with every link's address and title masked, so nothing in them is read as a
 * mark. A bracket with no `](` after it is words, as a range's `[0, 1)` is.
 */
const linksIn = (
  block: string
): { open: { at: number; close: string } | null; masked: string } => {
  const parts: string[] = [];
  let done = 0;
  let bracket = -1;
  let code = 0;
  let misses = 0;
  let at = 0;
  const mask = (to: number) => {
    parts.push(block.slice(done, at + 2), "x".repeat(to - at - 2));
    done = to;
  };
  while (at < block.length) {
    const char = block[at];
    if (char === "\\") {
      at += 2;
    } else if (char === "`") {
      const run = runAt(block, at);
      // Code in a sentence opens with a run of backticks and closes with a run as long.
      if (code === 0) {
        code = run;
      } else if (code === run) {
        code = 0;
      }
      at += run;
    } else if (code === 0 && char === "[") {
      bracket = at;
      at += 1;
    } else if (
      code === 0 &&
      char === "]" &&
      block[at + 1] === "(" &&
      misses < MAX_NOT_LINKS
    ) {
      const tail = tailAt(block, at + 2);
      if (tail === null) {
        misses += 1;
        at += 1;
      } else if ("end" in tail) {
        // Everything between the parentheses; the closing one stays.
        mask(tail.end - 1);
        at = tail.end;
      } else {
        mask(block.length);
        const open =
          bracket === -1 || block[bracket + 1] === "^"
            ? null
            : { at: bracket, close: tail.close };
        return { open, masked: parts.join("") };
      }
    } else {
      at += 1;
    }
  }
  parts.push(block.slice(done));
  return { open: null, masked: parts.join("") };
};

/** The marks left open in a block's words, outermost first, and where code in a sentence is open (or -1). */
const openMarks = (block: string): { open: Open[]; code: number } => {
  // A link's address and title are its own: an underscore or star in them is no mark.
  const words = linksIn(block).masked;
  const open: Open[] = [];
  let code = -1;
  let at = 0;
  while (at < words.length) {
    const char = words[at] ?? "";
    if (char === "\\") {
      at += 2;
    } else if (char === "`") {
      code = code === -1 ? at : -1;
      at += 1;
    } else if (code !== -1 || !"*_~".includes(char)) {
      at += 1;
    } else {
      const run = runAt(words, at);
      if (!isLiteral(words, at, run)) {
        // A run of three is bold and emphasis; of two, bold (or struck through); of one, emphasis.
        if (run >= 2) {
          toggle(open, char.repeat(2), at);
        }
        if (char !== "~" && run % 2 === 1) {
          toggle(open, char, at);
        }
      }
      at += run;
    }
  }
  return { open, code };
};

// A bracket at the very end that may yet open a link, held back while it is written so its marks
// never show: short, on its line, no parenthesis or code in it (`[2`, `[the weekly report]`). Once
// it has run on past that, it is words, shown as they are (`[0, 1) is half-open`).
const PENDING = /!?\[[^[\]()`\n]{0,40}\]?$/u;
// What a stopped answer may end with that goes: a citation cut before its address (`[2`, `[12]`).
const CUT_CITATION = /!?\[[^\s[\]()`]{0,12}\]?$/u;
// A list item's mark, then the start of a task's box: `- [ `, `1. [x]`.
const TASK_MARK = /^[ \t]*(?:[-*+]|\d{1,9}[.)])[ \t]+$/u;
const TASK_BOX = /^\[[ xX]?\]?$/u;

/**
 * Where a bracket `pattern` finds at the end of `block` starts (its `!` with it), or -1: never an
 * escaped one, a note's (`[^1`), or a task's box.
 */
const endingBracket = (block: string, pattern: RegExp): number => {
  const offset = Math.max(0, block.length - 64);
  const found = pattern.exec(block.slice(offset));
  if (found === null) {
    return -1;
  }
  const at = offset + found.index;
  const bracket = block[at] === "!" ? at + 1 : at;
  const line = block.slice(block.lastIndexOf("\n", at - 1) + 1, at);
  const task = TASK_BOX.test(found[0]) && TASK_MARK.test(line);
  return block[bracket - 1] === "\\" || block[bracket + 1] === "^" || task
    ? -1
    : at;
};

/**
 * `source`, as much as has arrived of an answer, made whole (see above). Inside an open fence it is
 * all code still coming in, and is left as it is but for a half-typed closing.
 */
export const repair = (source: string): Repaired => {
  const kept = withoutHalfLine(source);
  const text = source.slice(0, kept);
  if (openFence(text)) {
    return { text, kept };
  }
  const head = tableHead(text);
  if (head !== null) {
    return { text: text + head, kept };
  }
  // The block being written: what follows the last blank line.
  const blank = text.lastIndexOf("\n\n");
  const from = blank === -1 ? 0 : blank + 2;
  // Marks at the very end (a star that may become two, a mark with no words yet) wait, and so does
  // a bracket that may yet open a link.
  let body = withoutEndMarks(text.slice(from));
  const link = openMarks(body).code === -1 ? linksIn(body).open : null;
  const pending =
    link === null && openMarks(body).code === -1
      ? endingBracket(body, PENDING)
      : -1;
  if (pending !== -1) {
    body = withoutEndMarks(body.slice(0, pending).trimEnd());
  }
  const { open, code } = openMarks(body);
  const close =
    (code === -1 ? "" : "`") +
    (link === null ? "" : link.close) +
    open
      .toReversed()
      .map((entry) => entry.mark)
      .join("");
  if (close === "") {
    const end = from + body.length;
    return { text: text.slice(0, end), kept: Math.min(kept, end) };
  }
  // A closing mark closes only right after a word, so the space before it goes.
  const end = from + body.trimEnd().length;
  return { text: text.slice(0, end) + close, kept: Math.min(kept, end) };
};

// A last line that is a rule of stars or underlines: words, not marks left open.
const RULE = /^\s{0,3}(?<mark>[*_])(?:\s*\k<mark>){2,}\s*$/u;

/**
 * An answer cut off part way (stopped), tidied once it will not be written further: a link still
 * being written at its end goes, its words with it (`[2`, `[the report](https://ex`), and bold,
 * emphasis, strike-through or code left open are closed. Nothing else is touched, so an answer
 * that ended whole comes back as it was; inside an open fence the code simply ends.
 */
export const tidy = (source: string): string => {
  if (openFence(source)) {
    return source;
  }
  const blank = source.lastIndexOf("\n\n");
  const from = blank === -1 ? 0 : blank + 2;
  if (RULE.test(source.slice(source.lastIndexOf("\n") + 1))) {
    return source;
  }
  let text = source;
  let body = text.slice(from);
  const inCode = openMarks(body).code !== -1;
  const link = inCode ? null : linksIn(body).open;
  let cut = inCode || link !== null ? -1 : endingBracket(body, CUT_CITATION);
  if (link !== null) {
    // The link from its bracket on, and the bang of an image before it.
    cut = body[link.at - 1] === "!" ? link.at - 1 : link.at;
  }
  if (cut !== -1) {
    text = text.slice(0, from + cut).trimEnd();
    body = text.slice(from);
  }
  // Marks at the very end close nothing yet: they go, and what they would close is closed below.
  const bare = withoutEndMarks(body);
  const { open, code } = openMarks(bare);
  const close =
    (code === -1 ? "" : "`") +
    open
      .toReversed()
      .map((entry) => entry.mark)
      .join("");
  if (close === "") {
    return text;
  }
  // A closing mark closes only right after a word, so the space before it goes.
  return text.slice(0, from) + bare.trimEnd() + close;
};

// ---- Bounds: what no answer needs, taken out before the parse ------------------------------------
//
// The parser recurses into every quote and list it opens, weighs every mark of emphasis in a
// paragraph against the marks before it, looks back from every `]` for the `[` it closes and from
// every word for a `[` still open, and its work on one paragraph grows faster than the paragraph.
// So a hostile answer, or a model's runaway, could exhaust the stack with a few thousand `- ` or `>`
// on a line, or take seconds over a paragraph of stars or brackets. None of that is in a real
// answer, so past bounds far beyond one the marks are escaped: they show as the characters they
// are. A quote or a list deeper than MAX_DEPTH on a line is words from there. In one stretch (the
// lines a paragraph may run over: up to a blank line, a list item, a heading, a table's row), stars,
// underscores and tildes past MAX_EMPHASIS are words, a `[` while MAX_OPEN are open is, a `]` that
// closes nothing past MAX_STRAY of them is, and a stretch that went past those bounds is drawn as
// paragraphs of at most MAX_PARAGRAPH characters. A `[` nothing closes within MAX_LABEL characters,
// with more than that after it, is words anyway: it is escaped, which changes nothing that shows.
// So is a `<!--`, `<?` or `<!` (a declaration) whose end nothing brings within MAX_LABEL: the
// parser looks for that end from each one to the end of the paragraph. Past MAX_STRAY of those in
// a stretch, it went past the bounds too: each backslash parts the paragraph's words, which GitHub's
// bare web addresses cut into runs, and the parser joins each backslash's runs again by moving the
// rest of the paragraph (micromark's resolveAllText), so thousands in a paragraph cost as their
// square. Code in a fence is left as it is.

/** The deepest quote or list a line opens. */
const MAX_DEPTH = 32;
/** The most stars, underscores and tildes in one stretch. */
const MAX_EMPHASIS = 500;
/** The most brackets open at once. */
const MAX_OPEN = 16;
/** The most brackets in one stretch that close nothing, and the most raw HTML openings that do not end. */
const MAX_STRAY = 32;
/** The most characters between a bracket and the one that closes it: a link's words, at most. */
const MAX_LABEL = 1000;
/** The longest paragraph a stretch past the bounds is drawn in. */
const MAX_PARAGRAPH = 2000;

const HEADING = /^#{1,6}(?:[ \t]|$)/u;
const FOOTNOTE_START = /^\[\^[^\]\s]+\]:/u;
const ORDERED = /^\d{1,9}[.)](?:[ \t]|$)/u;

/** What ends the raw HTML a `<` opens at `at`, where the parser looks for it to the paragraph's end. */
const htmlEndAt = (text: string, at: number): string | null => {
  if (text.startsWith("<!--", at)) {
    return "-->";
  }
  if (text[at + 1] === "?") {
    return "?>";
  }
  return text[at + 1] === "!" && /[a-z]/iu.test(text[at + 2] ?? "")
    ? ">"
    : null;
};

const isBlank = (char: string | undefined) =>
  char === undefined || char === " " || char === "\t";

/**
 * The container marks that open a line (quotes, list items, footnotes): where they end, whether a
 * list item is among them, and where a backslash undoes the first past MAX_DEPTH (or -1).
 * Indentation counts as a level for every two columns, as a nested list needs at least that.
 */
const containersOf = (line: string) => {
  let at = 0;
  let depth = 0;
  let columns = 0;
  let item = false;
  for (;;) {
    while (line[at] === " " || line[at] === "\t") {
      columns += line[at] === "\t" ? 4 : 1;
      at += 1;
    }
    const rest = line.slice(at, at + 1024);
    const ordered = ORDERED.exec(rest)?.[0].trimEnd();
    let width = 0;
    // Where a backslash undoes the mark: before it, or before an ordered item's dot.
    let undo = at;
    if (line[at] === ">") {
      width = 1;
    } else if ("-*+".includes(line[at] ?? "x") && isBlank(line[at + 1])) {
      width = 1;
      item = true;
    } else if (ordered === undefined) {
      width = FOOTNOTE_START.exec(rest)?.[0].length ?? 0;
    } else {
      width = ordered.length;
      undo = at + width - 1;
      item = true;
    }
    if (width === 0) {
      return { end: at, item, over: -1 };
    }
    if (depth + Math.floor(columns / 2) >= MAX_DEPTH) {
      return { end: at, item, over: undo };
    }
    depth += 1;
    at += width;
  }
};

/** Where code in a sentence is in `text`: each place inside a pair of equal runs of backticks. */
const codeIn = (text: string): Uint8Array => {
  const inside = new Uint8Array(text.length);
  const runs: { at: number; length: number }[] = [];
  let at = 0;
  while (at < text.length) {
    if (text[at] === "\\") {
      at += 2;
    } else if (text[at] === "`") {
      const length = runAt(text, at);
      runs.push({ at, length });
      at += length;
    } else {
      at += 1;
    }
  }
  // Each run's next run of the same length: where the code it opens closes.
  const next: number[] = [];
  const seen = new Map<number, number>();
  for (let index = runs.length - 1; index >= 0; index -= 1) {
    const { length } = runs[index] ?? { length: 0 };
    next[index] = seen.get(length) ?? -1;
    seen.set(length, index);
  }
  let index = 0;
  while (index < runs.length) {
    const close = next[index] ?? -1;
    const open = runs[index];
    const end = runs[close];
    if (open === undefined || end === undefined) {
      index += 1;
    } else {
      inside.fill(1, open.at, end.at + end.length);
      index = close + 1;
    }
  }
  return inside;
};

/**
 * Where in a stretch's words a backslash goes (before each mark past the bounds, and before a
 * bracket that nothing closes within MAX_LABEL, which is words all the same), and whether it went
 * past the bounds.
 */
const escapesIn = (text: string): { escapes: Set<number>; over: boolean } => {
  const code = codeIn(text);
  const escapes = new Set<number>();
  const open: number[] = [];
  let emphasis = 0;
  let stray = 0;
  let unended = 0;
  let over = false;
  // Where each end of raw HTML next stands, as the openings move on: one search for each, at most.
  const ends = new Map<string, number>();
  const endsNear = (end: string, from: number) => {
    let next = ends.get(end);
    if (next === undefined || (next !== -1 && next < from)) {
      next = text.indexOf(end, from);
      ends.set(end, next);
    }
    return next !== -1 && next - from <= MAX_LABEL;
  };
  const strayAt = (at: number) => {
    stray += 1;
    if (stray > MAX_STRAY) {
      escapes.add(at);
      over = true;
    }
  };
  let at = 0;
  while (at < text.length) {
    const char = text[at];
    if (char === "\\") {
      at += 2;
      continue;
    }
    if (code[at] === 1) {
      at += 1;
      continue;
    }
    if (char === "*" || char === "_" || char === "~") {
      emphasis += 1;
      if (emphasis > MAX_EMPHASIS) {
        escapes.add(at);
        over = true;
      }
    } else if (char === "[") {
      if (open.length >= MAX_OPEN) {
        escapes.add(at);
        over = true;
      } else {
        open.push(at);
      }
    } else if (char === "<") {
      const end = htmlEndAt(text, at);
      if (end !== null && !endsNear(end, at + 2)) {
        escapes.add(at);
        unended += 1;
        if (unended > MAX_STRAY) {
          over = true;
        }
      }
    } else if (char === "]") {
      const from = open.pop();
      if (from === undefined) {
        strayAt(at);
      } else if (at - from > MAX_LABEL) {
        escapes.add(from);
        strayAt(at);
      }
    }
    at += 1;
  }
  // A bracket nothing closes costs only when much follows it.
  for (const from of open) {
    if (text.length - from > MAX_LABEL) {
      escapes.add(from);
    }
  }
  return { escapes, over };
};

/**
 * Text past the bounds in paragraphs of at most MAX_PARAGRAPH characters, cut at a space where
 * there is one: the parser's work on a paragraph grows faster than its length.
 */
const inParagraphs = (text: string): string => {
  const parts: string[] = [];
  let at = 0;
  while (text.length - at > MAX_PARAGRAPH) {
    let cut = text.lastIndexOf(" ", at + MAX_PARAGRAPH);
    if (cut <= at) {
      cut = at + MAX_PARAGRAPH;
      // Never between a backslash and what it escapes, nor inside a character of two units.
      while (
        text[cut - 1] === "\\" ||
        /[\uD800-\uDBFF]/u.test(text[cut - 1] ?? "")
      ) {
        cut -= 1;
      }
    }
    parts.push(text.slice(at, cut));
    at = cut;
  }
  parts.push(text.slice(at));
  return parts.join("\n\n");
};

/** A stretch: its lines one after another, each with where its words start (after its marks). */
type Stretch = { line: number; from: number }[];

/** The stretches of `lines`, each line's marks past MAX_DEPTH escaped in `lines` as they are read. */
const stretchesOf = (lines: string[]): Stretch[] => {
  const stretches: Stretch[] = [];
  let stretch: Stretch = [];
  const end = () => {
    if (stretch.length > 0) {
      stretches.push(stretch);
    }
    stretch = [];
  };
  let fenced = false;
  let inTable = false;
  for (const [index, line] of lines.entries()) {
    if (isFence(line)) {
      fenced = !fenced;
      end();
    } else if (fenced || line.trim() === "" || RULE.test(line)) {
      end();
      inTable = false;
    } else {
      const { end: from, item, over } = containersOf(line);
      inTable =
        ROW.test(line) &&
        (inTable || (ROW.test(lines[index - 1] ?? "") && isDelimiter(line)));
      // A heading or a table's row is a stretch of its own; a list item starts one.
      const single = inTable || HEADING.test(line.slice(from));
      if (item || single) {
        end();
      }
      if (over === -1) {
        stretch.push({ line: index, from });
      } else {
        lines[index] = `${line.slice(0, over)}\\${line.slice(over)}`;
        stretch.push({ line: index, from: over + 2 });
      }
      if (single) {
        end();
      }
    }
  }
  end();
  return stretches;
};

/** Puts a backslash in `lines` before each place in the stretch's words that `escapes` names. */
const escapeStretch = (
  lines: string[],
  stretch: Stretch,
  escapes: Set<number>
) => {
  let offset = 0;
  for (const { line, from } of stretch) {
    const whole = lines[line] ?? "";
    const words = whole.slice(from);
    const parts = [whole.slice(0, from)];
    for (let at = 0; at < words.length; at += 1) {
      parts.push(escapes.has(offset + at) ? "\\" : "", words[at] ?? "");
    }
    lines[line] = parts.join("");
    offset += words.length + 1;
  }
};

/** `source` within the bounds above: the same answer, its pathological marks escaped. */
export const bounded = (source: string): string => {
  const lines = source.split("\n");
  // The lines of a stretch cut into paragraphs, after its first: they are in the first now.
  const merged = new Set<number>();
  for (const stretch of stretchesOf(lines)) {
    const text = stretch
      .map(({ line, from }) => (lines[line] ?? "").slice(from))
      .join("\n");
    const { escapes, over } = escapesIn(text);
    if (escapes.size > 0) {
      escapeStretch(lines, stretch, escapes);
    }
    const first = stretch[0]?.line ?? 0;
    const last = stretch.at(-1)?.line ?? first;
    if (over && text.length > MAX_PARAGRAPH) {
      lines[first] = inParagraphs(lines.slice(first, last + 1).join("\n"));
      for (let line = first + 1; line <= last; line += 1) {
        merged.add(line);
      }
    }
  }
  return lines.filter((_, line) => !merged.has(line)).join("\n");
};

// ---- Blocks: a long answer read a block at a time ---------------------------------------------------
//
// Reading the whole answer again for every few words that arrive costs more the longer it gets. But
// only its last block can still change: the blocks before it are finished. So they are kept as they
// were read, with the source they were read from, and only what follows them is read again. A link
// or a note defined further down the answer is words until the answer is whole (then it is read
// whole, once), as it was before its definition had arrived.

/** A block of the answer, and where it starts in the source: its nodes' places count from there. */
export interface Placed {
  node: RootContent;
  base: number;
}

/** The blocks that are finished, and the source they were read from. */
export interface Kept {
  text: string;
  blocks: Placed[];
}

export const NOTHING: Kept = { text: "", blocks: [] };

/**
 * The blocks of `shown`, given what was kept from reading less of it, and what to keep now. `kept`
 * comes back as it was given when nothing more is finished.
 */
export const readBlocks = (
  shown: string,
  kept: Kept
): { blocks: Placed[]; kept: Kept } => {
  // Other words than those kept (a new answer in the same place): start again.
  const held = shown.startsWith(kept.text) ? kept : NOTHING;
  const base = held.text.length;
  const tail = shown.slice(base);
  const read = parseMarkdown(tail).children.map((node) => ({ node, base }));
  const blocks = [...held.blocks, ...read];
  const cut = read.at(-1)?.node.position?.start.offset;
  // Every block but the last is finished: kept, with the source up to where the last starts.
  if (read.length > 1 && cut !== undefined && cut > 0) {
    return {
      blocks,
      kept: {
        text: held.text + tail.slice(0, cut),
        blocks: [...held.blocks, ...read.slice(0, -1)],
      },
    };
  }
  return { blocks, kept: held };
};

// ---- Sections: the one HTML form drawn as what it means ----------------------------------------------
//
// A collapsible section in the one form GitHub renders:
//
//   <details>                                (or with attributes: `<details open>` stands open)
//   <summary>The policy's limits</summary>
//
//   - Meals: €40 a day.
//
//   </details>
//
// CommonMark reads that as three things: an HTML block holding the opening and the summary, the
// Markdown blocks of its body, and an HTML block holding the closing. Only this form is read again,
// as a section with its summary and the blocks between; any other HTML stays text. An opening with
// no closing yet (an answer still being written) stays text too, until its closing arrives, so
// nothing is drawn as a section and then taken back. Sections may hold sections.

/** An opening: `<details>`, then its `<summary>` on the next line or the same one, and nothing after. */
const OPENING =
  /^<details(?<attributes>(?:\s+[a-z][a-z-]*(?:="[^"\n]*")?)*)\s*>[ \t]*\n?[ \t]*<summary>(?<summary>[^\n]*?)<\/summary>[ \t]*$/u;
const CLOSING = /^<\/details>[ \t]*$/u;

/** One block of the answer, or a section holding its own. */
export type Grouped =
  | { type: "block"; placed: Placed }
  | {
      type: "section";
      summary: PhrasingContent[];
      summaryText: string;
      open: boolean;
      children: Grouped[];
      key: Placed;
    };

const htmlOf = (placed: Placed): string | null =>
  placed.node.type === "html" ? placed.node.value.trim() : null;

/** The summary's words, read as Markdown's inline text (bold, code, links), as GitHub reads them. */
const summaryOf = (text: string): PhrasingContent[] => {
  const [first] = parseMarkdown(text).children;
  return first?.type === "paragraph" ? first.children : [];
};

interface Frame {
  opening: RegExpExecArray;
  key: Placed;
  children: Grouped[];
}

const sectionOf = ({ opening, key, children }: Frame): Grouped => {
  const summaryText = (opening.groups?.summary ?? "").trim();
  return {
    type: "section",
    summary: summaryOf(summaryText),
    summaryText,
    // `<details open>` stands open at first, as GitHub draws it.
    open: /(?:^|\s)open(?:\s|=|$)/u.test(opening.groups?.attributes ?? ""),
    children,
    key,
  };
};

/**
 * The answer's blocks, with every whole section read as one: each closing closes the latest opening
 * still open, in one pass. Sections nest at most MAX_DEPTH deep; an opening past that is text, and
 * so is the closing that answers it.
 */
export const groupSections = (blocks: readonly Placed[]): Grouped[] => {
  const root: Grouped[] = [];
  const open: Frame[] = [];
  let past = 0;
  const into = () => open.at(-1)?.children ?? root;
  for (const block of blocks) {
    const html = htmlOf(block);
    const opening = html === null ? null : OPENING.exec(html);
    const frame = open.length > 0 && past === 0 ? open.at(-1) : undefined;
    if (opening !== null && open.length < MAX_DEPTH) {
      open.push({ opening, key: block, children: [] });
    } else if (html !== null && CLOSING.test(html) && frame !== undefined) {
      open.pop();
      into().push(sectionOf(frame));
    } else {
      if (opening !== null) {
        past += 1;
      } else if (html !== null && CLOSING.test(html) && past > 0) {
        past -= 1;
      }
      into().push({ type: "block", placed: block });
    }
  }
  // An opening nothing closed is text, and its blocks stand where they are.
  for (let frame = open.pop(); frame !== undefined; frame = open.pop()) {
    into().push({ type: "block", placed: frame.key }, ...frame.children);
  }
  return root;
};

/** What a section's opening or closing says as it arrives: its summary, or nothing; other HTML its text. */
export const sectionSaid = (value: string): string => {
  const [grouped] = groupSections([
    { node: { type: "html", value }, base: 0 },
    { node: { type: "html", value: "</details>" }, base: 0 },
  ]);
  if (grouped?.type === "section") {
    return grouped.summaryText;
  }
  return CLOSING.test(value.trim()) ? "" : value;
};
