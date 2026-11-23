// The bounds Streamdown has none of, taken from the system's parse.ts and applied to the answer
// before Streamdown reads it. Two: a quote or a list nested deeper than MAX_DEPTH on a line is words
// from there (the parser recurses into each and a few thousand `- ` or `>` exhaust the stack), and
// a paragraph whose marks would cost the parser more than the budget is its own characters (its
// marks escaped): the parser weighs every mark against the marks before it, `m` squared.

const isFence = (line: string) => /^\s{0,3}(?:`{3,}|~{3,})/u.test(line);
const isBlank = (char: string | undefined) =>
  char === undefined ||
  char === " " ||
  char === "\t" ||
  char === "\n" ||
  char === "\r";

/** The deepest quote or list a line opens. */
const MAX_DEPTH = 32;

const FOOTNOTE_START = /^\[\^[^\]\s]+\]:/u;
const ORDERED = /^\d{1,9}[.)](?:[ \t]|$)/u;

/**
 * Where a backslash undoes the first container mark past MAX_DEPTH that opens `line` (quotes, list
 * items, footnotes), or -1. Indentation counts as a level for every two columns, as a nested list
 * needs at least that.
 */
const depthOver = (line: string): number => {
  let at = 0;
  let depth = 0;
  let columns = 0;
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
    if (
      line[at] === ">" ||
      ("-*+".includes(line[at] ?? "x") && isBlank(line[at + 1]))
    ) {
      width = 1;
    } else if (ordered === undefined) {
      width = FOOTNOTE_START.exec(rest)?.[0].length ?? 0;
    } else {
      width = ordered.length;
      undo = at + width - 1;
    }
    if (width === 0) {
      return -1;
    }
    if (depth + Math.floor(columns / 2) >= MAX_DEPTH) {
      return undo;
    }
    depth += 1;
    at += width;
  }
};

/** `source` within the bounds above: the same answer, its quotes and lists past MAX_DEPTH words. */
const deepBounded = (source: string): string => {
  let fenced = false;
  return source
    .split("\n")
    .map((line) => {
      if (isFence(line)) {
        fenced = !fenced;
        return line;
      }
      const over = fenced ? -1 : depthOver(line);
      return over === -1 ? line : `${line.slice(0, over)}\\${line.slice(over)}`;
    })
    .join("\n");
};

/** The longest paragraph read for its marks. */
const MAX_INLINE = 8000;
/** The most marks a paragraph holds and is read for them whatever came before. */
const FREE_MARKS = 128;
/** What the paragraphs with more marks may cost in one read, each its marks squared. */
const MAX_COST = 6_000_000;
const MARK = /[[\]*_<&\\!~`]/gu;

/** A paragraph past the budget as its own characters: each mark escaped. */
const costBounded = (source: string): string => {
  let left = MAX_COST;
  let fenced = false;
  return source
    .split(/(?<gap>\n[ \t]*\n)/u)
    .map((block) => {
      for (const line of block.split("\n")) {
        if (isFence(line)) {
          fenced = !fenced;
        }
      }
      if (
        fenced ||
        block.trim() === "" ||
        /^\s{0,3}(?:`{3,}|~{3,})/mu.test(block)
      ) {
        return block;
      }
      const marks = block.match(MARK)?.length ?? 0;
      if (block.length <= MAX_INLINE && marks <= FREE_MARKS) {
        return block;
      }
      if (block.length <= MAX_INLINE && marks * marks <= left) {
        left -= marks * marks;
        return block;
      }
      return block.replaceAll(MARK, (mark) => `\\${mark}`);
    })
    .join("");
};

/** `source` within the bounds above. */
export const bounded = (source: string): string =>
  costBounded(deepBounded(source));
