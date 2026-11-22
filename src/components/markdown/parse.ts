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

// The parser's work grows faster than what it reads in two ways, and each is bounded here.
//
// Inside a paragraph (or heading, or table cell) it weighs every mark of emphasis against the marks
// before it, looks back from every `]` for the `[` it closes and from every word after a `[` left
// open, and moves the rest of the paragraph for every mark it reads (micromark's resolveAllText).
// Measured on a laptop: what is not a mark takes under a microsecond a character, whatever the
// length; `m` marks take up to 80 ns times `m` squared, which for the 2,700 a paragraph of 8,000
// characters can hold is half a second, and for the 128 of a paragraph dense with links, bold and
// code a millisecond. So a paragraph of at most FREE_MARKS marks is always read for them, however
// long the answer. One with more spends its marks squared from MAX_COST (what half a second reads),
// and once that is spent such paragraphs are their own characters, as plain text, in their place
// (in their list item, quote or cell). So is a paragraph longer than MAX_INLINE (some 1,300 words),
// which no real answer has.
//
// Across blocks: every item of a list moves every event after it in what is read (mdast's
// prepareList, 19 s for a list of 400 KB), every line of a paragraph the rest of its paragraph,
// every line given to a quote or an item without its mark looks through the lines before it
// (micromark's document), and every underlined heading is looked for from the start again. So an
// answer of more than PIECE lines is read in pieces, each by itself, and their blocks are put
// together. A piece ends where a block starts at the margin after a blank line, or failing that
// for twice PIECE lines, at any line. What is still open where a piece starts (a list and its item,
// a quote, a note, and in them a paragraph, a table, code or HTML) is opened again by a line of its
// own before the piece, so the parser reads the piece as it would in its place; what it read from
// those lines is dropped, and the rest is put in the blocks they stand for. So a list of any length
// is one list, code in a list item is code to its end, and only a paragraph of more than twice
// PIECE lines is read in parts: a mark that opens in one and closes in the next is its characters.
//
// To find the costly blocks, a piece is read first for its blocks alone, with nothing inline. Then
// it is read with each plain block's characters stood in for by one that starts no mark (every
// mark of the quotes, lists and tables round it kept, so its blocks are the same), and they are
// given back.

/** The longest paragraph, heading or table cell read for its marks. */
const MAX_INLINE = 8000;
/** The most marks a paragraph, heading or table cell holds and is read for them whatever came before. */
const FREE_MARKS = 128;
/** What the paragraphs with more marks may cost in one read, each its marks squared. */
const MAX_COST = 6_000_000;
/** How many lines a piece holds before it ends at the next block. */
const PIECE = 64;

/** Every construct the parser reads inside a paragraph, by name: off while the blocks are found. */
const INLINE = [
  "attention",
  "autolink",
  "characterEscape",
  "characterReference",
  "codeText",
  "emailAutolink",
  "gfmFootnoteCall",
  "gfmPotentialFootnoteCall",
  "hardBreakEscape",
  "htmlText",
  "labelEnd",
  "labelStartImage",
  "labelStartLink",
  "protocolAutolink",
  "strikethrough",
  "tasklistCheck",
  "wwwAutolink",
];

// With nothing inline, bare web addresses are left as words too: they are found in the words after
// the parse (mdast-util-gfm's transform), which would take the words' places away.
const parsed = (source: string, inline = true): MarkdownRoot =>
  inline
    ? fromMarkdown(source, {
        extensions: [gfm()],
        mdastExtensions: [gfmFromMarkdown()],
      })
    : fromMarkdown(source, {
        extensions: [gfm(), { disable: { null: INLINE } }],
        mdastExtensions: gfmFromMarkdown().map((extension) => ({
          ...extension,
          transforms: [],
        })),
      });

/** A place in the source. */
interface Point {
  line: number;
  column: number;
  offset?: number;
}

/** A node of the tree, as far as the bounds read it. */
interface Node {
  type: string;
  value?: string;
  children?: Node[];
  position?: { start: Point; end: Point };
  spread?: boolean | null;
  depth?: number;
  align?: unknown[] | null;
  identifier?: string;
  label?: string | null;
}

const each = (node: Node, visit: (node: Node) => void) => {
  visit(node);
  for (const child of node.children ?? []) {
    each(child, visit);
  }
};

const startOf = (node: Node) => node.position?.start.offset ?? 0;
const endOf = (node: Node) => node.position?.end.offset ?? 0;

const isBlank = (char: string | undefined) =>
  char === undefined || char === " " || char === "\t";

/**
 * Where the characters of `text`, a text node read with nothing inline, are in `source`: each of its
 * lines is the end of its line there, before the line's trailing spaces (the marks of the quotes and
 * lists round it come before). Null if a line is not found so.
 */
const placesOf = (source: string, text: Node): [number, number][] | null => {
  let at = startOf(text);
  const end = text.position?.end.offset ?? at;
  const places: [number, number][] = [];
  for (const line of (text.value ?? "").split(/\r\n|\r|\n/u)) {
    let stop = at;
    while (stop < end && source[stop] !== "\n" && source[stop] !== "\r") {
      stop += 1;
    }
    let last = stop;
    while (last > at && isBlank(source[last - 1])) {
      last -= 1;
    }
    const from = last - line.length;
    if (from < at || source.slice(from, last) !== line) {
      return null;
    }
    places.push([from, last]);
    at = stop + (source.startsWith("\r\n", stop) ? 2 : 1);
  }
  return places;
};

/** The characters a mark starts or ends with. */
const MARKS = "[]*_<&\\!~`";
/** What a comment, an instruction or a declaration left open counts for: it is read on to its paragraph's end. */
const READ_ON = 16;

/**
 * How many marks `text` holds: each character of MARKS, each space inside a bracket left open (every
 * word there looks back for the bracket), and READ_ON more for each `<!` and `<?`.
 */
const marksOf = (text: string): number => {
  let marks = 0;
  let open = 0;
  for (let at = 0; at < text.length; at += 1) {
    const char = text[at] ?? "";
    if (char === "[") {
      open += 1;
    } else if (char === "]" && open > 0) {
      open -= 1;
    }
    if (MARKS.includes(char) || (open > 0 && char <= " ")) {
      marks += 1;
    }
    if (char === "<" && (text[at + 1] === "!" || text[at + 1] === "?")) {
      marks += READ_ON;
    }
  }
  return marks;
};

/** A blank line. */
const BLANK_LINE = /\n[ \t\r]*\n/u;

/**
 * Whether some lines with no blank line between them, as a block's are, run over MAX_INLINE or
 * hold more than FREE_MARKS marks: only then are the blocks found first.
 */
const mayCost = (source: string): boolean =>
  source
    .split(BLANK_LINE)
    .some((run) => run.length > MAX_INLINE || marksOf(run) > FREE_MARKS);

/** What one read may still spend on paragraphs with more than FREE_MARKS marks. */
interface Budget {
  left: number;
  /** Whether the piece read last ended in a paragraph that is plain text: what carries it on is too. */
  plain: boolean;
}

/**
 * Where the characters of each paragraph, heading or table cell of `source` from `own` on are that
 * is not read for its marks (over MAX_INLINE, or costing more than the budget has left), or null.
 */
const longInline = (
  source: string,
  budget: Budget,
  own: number
): Uint8Array | null => {
  // The first block with words carries on the plain paragraph the piece before ended in.
  let carries = budget.plain;
  budget.plain = false;
  if (!(carries || mayCost(source))) {
    return null;
  }
  const long = new Uint8Array(source.length);
  let any = false;
  each(parsed(source, false), (node) => {
    const texts = (node.children ?? []).filter(({ type }) => type === "text");
    if (texts.length === 0 || endOf(node) <= own) {
      return;
    }
    let length = 0;
    let marks = 0;
    for (const { value = "" } of texts) {
      length += value.length;
      marks += marksOf(value);
    }
    const cost = marks > FREE_MARKS ? marks * marks : 0;
    const short = length <= MAX_INLINE && !carries;
    carries = false;
    budget.plain = !(short && cost <= budget.left);
    if (!budget.plain) {
      budget.left -= cost;
      return;
    }
    if (short) {
      // Nothing after it is read for more than FREE_MARKS either: plain text does not turn back.
      budget.left = 0;
    }
    const places = texts.map((text) => placesOf(source, text));
    if (places.every((place) => place !== null)) {
      any = true;
      for (const [from, to] of places.flat()) {
        long.fill(1, from, to);
      }
    }
  });
  return any ? long : null;
};

/** What stands in for each character of a long block: no mark starts with it. */
const STAND_IN = "§";

/** `tree`, read from `source` with its long characters stood in for, with them given back. */
const givenBack = (tree: MarkdownRoot, source: string, long: Uint8Array) => {
  each(tree, (node) => {
    const from = node.position?.start.offset ?? -1;
    const to = node.position?.end.offset ?? -1;
    if (node.type !== "text" || long[from] !== 1) {
      return;
    }
    const originals: string[] = [];
    for (let at = from; at < to; at += 1) {
      if (long[at] === 1) {
        originals.push(source[at] ?? "");
      }
    }
    let index = 0;
    node.value = (node.value ?? "").replaceAll(STAND_IN, () => {
      index += 1;
      return originals[index - 1] ?? "";
    });
  });
  return tree;
};

/** The tree of `source` read in one piece, its long and its costly blocks from `own` on plain text. */
const treeOf = (source: string, budget: Budget, own = 0): MarkdownRoot => {
  const long = longInline(source, budget, own);
  if (long === null) {
    return parsed(source);
  }
  const stood = Array.from(long, (on, at) =>
    on === 1 ? STAND_IN : (source[at] ?? "")
  ).join("");
  return givenBack(parsed(stood), source, long);
};

/** Where the line that starts at `at` ends, and the next starts. */
const lineAt = (source: string, at: number) => {
  const end = source.indexOf("\n", at);
  return end === -1
    ? { end: source.length, next: source.length }
    : { end, next: end + 1 };
};

/** How many lines end in `text`. */
const linesIn = (text: string) => text.split("\n").length - 1;

/** A table's row of dashes, or a heading's underline. */
const DASHES =
  /^[ \t>]*\|?[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)*\|?[ \t\r]*$/u;

/**
 * Where the piece that starts at `from` ends (see above): never between a table's head and its row
 * of dashes.
 */
const pieceEnd = (source: string, from: number): number => {
  let blank = false;
  let before = from;
  let at = from;
  for (let lines = 0; at < source.length; lines += 1) {
    const { end, next } = lineAt(source, at);
    const line = source.slice(at, end);
    const empty = !/\S/u.test(line);
    const starts = blank && !(empty || isBlank(line[0]));
    if (lines >= 2 * PIECE || (starts && lines >= PIECE)) {
      return DASHES.test(line) && before > from ? before : at;
    }
    blank = empty;
    before = at;
    at = next;
  }
  return source.length;
};

/**
 * The blank lines that stand right before a piece: how many, counting those that hold a quote's
 * marks and nothing else, whether one of them holds nothing at all, and where the first starts.
 */
interface Blank {
  lines: number;
  plain: boolean;
  at: number;
}

/**
 * The blank lines at the end of `text`, a piece that starts at `from` with the blank lines
 * `before` before it: they are counted on from those where the piece holds nothing else.
 */
const blankAfter = (text: string, from: number, before: Blank): Blank => {
  let lines = 0;
  let plain = false;
  for (let end = text.length; end > 0; lines += 1) {
    const start = end < 2 ? 0 : text.lastIndexOf("\n", end - 2) + 1;
    const line = text.slice(start, end);
    if (/[^\s>]/u.test(line)) {
      return { lines, plain, at: from + end };
    }
    plain ||= !line.includes(">");
    end = start;
  }
  return {
    lines: before.lines + lines,
    plain: before.plain || plain,
    at: before.at,
  };
};

/**
 * A piece as it is put with the blocks before it: the source, where the piece starts in it, the
 * blank lines before it, and the code and HTML that go on from piece to piece, each with what it
 * holds, part by part.
 */
interface Piece {
  source: string;
  from: number;
  blank: Blank;
  parts: Map<Node, string[]>;
}

/**
 * Whether a blank line stands between `node` and `piece`, or in a quote a line of its marks alone.
 * Such a line may be the node's own (HTML's at the margin): then one after its end.
 */
const isApart = ({ source, from, blank }: Piece, node: Node) =>
  endOf(node) <= blank.at
    ? blank.lines > 0
    : lineAt(source, endOf(node)).next < from;

/** How HTML that a blank line does not end starts, and what its last line holds. */
const RAW_HTML: [RegExp, RegExp][] = [
  [
    /^<(?:script|pre|style|textarea)(?:[ \t>]|$)/iu,
    /<\/(?:script|pre|style|textarea)>/iu,
  ],
  [/^<!--/u, /-->/u],
  [/^<\?/u, /\?>/u],
  [/^<![a-z]/iu, />/u],
  [/^<!\[CDATA\[/u, /\]\]>/u],
];
/** The run of backticks or tildes a fence opens with. */
const FENCE_RUN = /^(?:`{3,}|~{3,})/u;

/** Whether code is indented code: no fence opens it. */
const isIndented = (source: string, code: Node) =>
  !FENCE_RUN.test(source.slice(startOf(code), startOf(code) + 3));

/** The first line of `node`, from where it starts. */
const firstLine = (source: string, node: Node) =>
  source.slice(startOf(node), lineAt(source, startOf(node)).end);

/** How far in from the margin `node` starts, in columns. */
const columnOf = (node: Node) => (node.position?.start.column ?? 1) - 1;

/** A line that may close a fence: how far in it is, and its run of backticks or tildes. */
const FENCE_END = /^(?<lead>[ \t>]*)(?<run>`{3,}|~{3,})[ \t\r]*$/u;

/**
 * Whether a line at `from` would still be the code in the fence `code` opens: its last line does
 * not close it, with a run of its own character as long at least, no more than three columns
 * further in.
 */
const isOpenFence = (source: string, code: Node) => {
  const run = FENCE_RUN.exec(firstLine(source, code))?.[0] ?? "";
  const last = source.lastIndexOf("\n", endOf(code) - 1) + 1;
  const end = FENCE_END.exec(source.slice(last, endOf(code)))?.groups;
  const closed =
    last > startOf(code) &&
    end?.run?.startsWith(run) === true &&
    (end.lead?.length ?? 0) <= columnOf(code) + 3;
  return run !== "" && !closed;
};

/** Whether a line after `html` would still be that HTML: nothing ended it, nor a blank line. */
const isOpenHtml = (piece: Piece, html: Node) => {
  const { source } = piece;
  const ends = RAW_HTML.find(([opening]) =>
    opening.test(firstLine(source, html).trimStart())
  )?.[1];
  const last = source.lastIndexOf("\n", endOf(html) - 1) + 1;
  return ends === undefined
    ? !isApart(piece, html)
    : !ends.test(source.slice(last, endOf(html)));
};

/** The blocks that hold blocks. */
const HOLDS = new Set(["blockquote", "footnoteDefinition", "list", "listItem"]);

/** Whether a line of `piece` could still go on in `node`, the last block read before it. */
const isOpen = (piece: Piece, node: Node): boolean => {
  switch (node.type) {
    case "list":
    case "listItem":
    case "footnoteDefinition": {
      return true;
    }
    case "blockquote": {
      return !piece.blank.plain;
    }
    // A line after the line that defines a link is read as one after a paragraph's is.
    case "definition":
    case "paragraph":
    case "table": {
      return !isApart(piece, node);
    }
    case "code": {
      // Indented code goes on after blank lines, where a line is indented as far again.
      return isIndented(piece.source, node) || isOpenFence(piece.source, node);
    }
    case "html": {
      return isOpenHtml(piece, node);
    }
    default: {
      return false;
    }
  }
};

/**
 * What is still open where `piece` starts: the last of `blocks`, the last block in it, and so on
 * down, as far as a line there could still go on in them.
 */
const openAt = (piece: Piece, blocks: Node[]): Node[] => {
  const open: Node[] = [];
  for (
    let node = blocks.at(-1);
    node !== undefined && isOpen(piece, node);
    node = HOLDS.has(node.type) ? node.children?.at(-1) : undefined
  ) {
    open.push(node);
  }
  return open;
};

/** A list item's mark: a bullet, or a number and what follows it. */
const ITEM_MARK = /^(?:[-*+]|\d{1,9}[.)])/u;

/**
 * How far in from the margin the words of the list item `item` start, whose mark is `mark`: where
 * its first block starts, or one past the mark when that is on a later line or more than four
 * spaces on, as code is.
 */
const wordsColumn = (item: Node, mark: string) => {
  const [first] = item.children ?? [];
  const after = columnOf(item) + mark.length;
  const space =
    first !== undefined &&
    first.position?.start.line === item.position?.start.line
      ? columnOf(first) - after
      : 0;
  return after + (space >= 1 && space <= 4 ? space : 1);
};

/**
 * The line that opens `node` again, a block that was open where a piece starts at `from`, and what
 * a line in it starts with, given `prefix`, what a line in the blocks round it starts with: a
 * quote's or a list item's mark with an empty heading in it (a block that is over, as the item's
 * own was), a note's name, a paragraph's `x`, a fence's or HTML's own first line, and for a table a
 * head of as many columns.
 */
const openerOf = (
  source: string,
  node: Node,
  prefix: string,
  from: number
): { lines: string[]; prefix: string } => {
  const start = prefix.padEnd(columnOf(node));
  const held = (node.children ?? []).length > 0 ? "#" : "";
  switch (node.type) {
    case "list": {
      return { lines: [], prefix };
    }
    case "blockquote": {
      return { lines: [`${start}>#`], prefix: `${start}>` };
    }
    case "listItem": {
      const mark = ITEM_MARK.exec(firstLine(source, node))?.[0] ?? "-";
      const inner = prefix.padEnd(wordsColumn(node, mark));
      return {
        lines: [`${start}${mark}`.padEnd(inner.length) + held],
        prefix: inner,
      };
    }
    case "footnoteDefinition": {
      return {
        lines: [`${start}[^${node.label}]: ${held}`],
        prefix: `${start}    `,
      };
    }
    case "paragraph": {
      // Two spaces at a line's end break the line, and so does a backslash.
      const end = /(?<breaks> {2}|\\)\r?\n$/u.exec(
        source.slice(from - 4, from)
      );
      return { lines: [`${prefix}x${end?.groups?.breaks ?? ""}`], prefix };
    }
    case "table": {
      const columns = node.align?.length ?? 0;
      return {
        lines: [
          `${prefix}${"|x".repeat(columns)}|`,
          `${prefix}${"|-".repeat(columns)}|`,
        ],
        prefix,
      };
    }
    default: {
      return { lines: [`${start}${firstLine(source, node)}`], prefix };
    }
  }
};

/**
 * The lines that open `open` again before `piece`, so the parser reads the piece as it would in its
 * place. A blank line stands before the piece too where one did, the last of them as it was: but
 * not in a fence or in HTML, whose own they are.
 */
const leadFor = (piece: Piece, open: Node[]): string => {
  const { source, from } = piece;
  const last = open.at(-1);
  if (last === undefined) {
    return "";
  }
  const lines: string[] = [];
  let prefix = "";
  for (const node of open) {
    const opener = openerOf(source, node, prefix, from);
    lines.push(...opener.lines);
    ({ prefix } = opener);
  }
  const own =
    last.type === "html" || (last.type === "code" && !isIndented(source, last));
  const before =
    own || !isApart(piece, last)
      ? ""
      : source.slice(source.lastIndexOf("\n", from - 2) + 1, from);
  return `${lines.join("\n")}\n${before}`;
};

/**
 * `text`, the last words of a paragraph, without the backslash at their end when `next`, what was
 * read after them, is the line break a backslash makes: it broke the line, and was read as words
 * while it was the paragraph's last character.
 */
const unslashed = (text: Node, next: Node | undefined) => {
  if (next?.type === "break" && endOf(next) - startOf(next) === 2) {
    text.value = text.value?.slice(0, -1);
    for (const { end } of text.position ? [text.position] : []) {
      end.column -= 1;
      end.offset = (end.offset ?? 0) - 1;
    }
  }
};

/** `node` made to start where `last`, the node now before it, ends. */
const startAfter = (node: Node | undefined, last: Node | undefined) => {
  if (node?.position !== undefined && last?.position !== undefined) {
    node.position.start = { ...last.position.end };
  }
};

/**
 * The words read after a paragraph's `x`, put in `real`, the paragraph it stood for, after `eol`,
 * the line break that stands before the piece: they start where the paragraph's own ended.
 */
const graftWords = (real: Node, stub: Node, eol: string) => {
  const [first, ...rest] = stub.children ?? [];
  const last = real.children?.at(-1);
  const words = (first?.value ?? "x").slice(1).replace(/^\n/u, eol);
  const next = words === "" ? rest[0] : first;
  if (last?.type === "text" && words === "") {
    unslashed(last, next);
  }
  if (last?.type === "text" && words !== "") {
    last.value = `${last.value}${words}`;
    if (last.position !== undefined && first?.position !== undefined) {
      last.position.end = first.position.end;
    }
  } else {
    startAfter(next, last);
    if (first !== undefined && words !== "") {
      first.value = words;
      real.children?.push(first);
    }
  }
  real.children?.push(...rest);
};

/**
 * The code or HTML read after its own first line, put with the parts of `real`, the code or HTML
 * that line opened, after `eol`, the line break that stands before the piece.
 */
const graftLines = (piece: Piece, real: Node, stub: Node, eol: string) => {
  const { source, from, blank, parts } = piece;
  const { value = "" } = stub;
  const held = parts.get(real) ?? [real.value ?? ""];
  parts.set(real, held);
  if (real.type === "html" || isIndented(source, real)) {
    // They hold their first line too, HTML the end of its last when nothing ended it, and
    // indented code every blank line before the piece, of which one was read.
    const last = held.pop() ?? "";
    held.push(
      last.endsWith(eol) ? last.slice(0, -eol.length) : last,
      eol.repeat(real.type === "html" ? 1 : Math.max(blank.lines, 1)),
      value.slice(value.indexOf("\n") + 1)
    );
  } else if (lineAt(source, startOf(real)).next === from) {
    // The fence's first line was the last before the piece: all its code is the piece's.
    held.splice(0, held.length, value);
  } else if (value !== "" || linesIn(source.slice(from, endOf(stub))) > 0) {
    held.push(eol, value);
  }
};

/**
 * Whether `stub`, the block read from the line that opened `real` again and from `piece` after it,
 * is more of `real`: its words or its lines are put in it then. Not a block of another kind (a
 * table that a paragraph's last line became the head of).
 */
const graftLeaf = (piece: Piece, real: Node, stub: Node): boolean => {
  const eol = piece.source.startsWith("\r\n", piece.from - 2) ? "\r\n" : "\n";
  if (stub.type === "heading" && real.type === "paragraph") {
    // A line under the paragraph made a heading of it.
    Object.assign(real, { type: stub.type, depth: stub.depth });
    graftWords(real, stub, eol);
  } else if (stub.type !== real.type) {
    return false;
  } else if (stub.type === "paragraph") {
    graftWords(real, stub, eol);
  } else if (stub.type === "code" || stub.type === "html") {
    graftLines(piece, real, stub, eol);
  }
  return true;
};

/**
 * `nodes`, read from the lines that opened the last of `blocks` again and from `piece` after them,
 * put after `blocks`: what was read from the opening lines alone dropped, what was read from both
 * put in the last block (its blocks in the last block's, and so on down), and what was read from
 * the piece put after it.
 */
const place = (piece: Piece, blocks: Node[], nodes: Node[]): void => {
  const { from } = piece;
  for (const node of nodes) {
    const last = blocks.at(-1);
    if (startOf(node) >= from) {
      blocks.push(node);
    } else if (endOf(node) <= from) {
      // An opening line and no more.
    } else if (last !== undefined && graftLeaf(piece, last, node)) {
      if (HOLDS.has(node.type) || node.type === "table") {
        place(piece, last.children ?? [], node.children ?? []);
      }
      if (node.spread === true && typeof last.spread === "boolean") {
        last.spread = true;
      }
      if (last.position !== undefined && node.position !== undefined) {
        last.position.end = node.position.end;
      }
    } else {
      // No part of the last block: a block of its own, without the opening lines' words.
      each(node, (inner) => {
        if (inner.type === "text" && endOf(inner) <= from) {
          inner.value = "";
        }
      });
      blocks.push(node);
    }
  }
};

/** A name as the parser compares names: its spaces one each, in one case. */
const nameOf = (name: string) =>
  name
    .replaceAll(/[\t\n\r ]+/gu, " ")
    .trim()
    .toLowerCase()
    .toUpperCase()
    .toLowerCase();

/** A line that starts as one that defines a link's target or a note does. */
const DEFINITION = /^ {0,3}\[(?<label>(?:[^\]\\\n]|\\.)+)\]:/gmu;
/** A name in brackets, as a link or a note may be referred to. */
const NAMED = /\[(?<name>(?:[^[\]\\]|\\.)+)\]/gu;

/** A line that defines `label` and nothing more, to be read before a piece that refers to it. */
const stubOf = (label: string) => `[${label}]: <>\n\n`;

/**
 * What is read before a piece and is not its own: a line that defines each name in `text` that
 * `defined` holds, so a link or a note defined in another piece is one in this piece too.
 */
const stubsFor = (text: string, defined: Map<string, string>): string => {
  if (defined.size === 0) {
    return "";
  }
  const stubs = new Set<string>();
  for (const { groups } of text.matchAll(NAMED)) {
    const stub = defined.get(nameOf(groups?.name ?? ""));
    if (stub !== undefined) {
      stubs.add(stub);
    }
  }
  // A comment ends them, so no line of the piece is taken for more of the last.
  return stubs.size === 0 ? "" : `${[...stubs].join("")}<!---->\n\n`;
};

/** Where each piece of an answer ended as it was read, and the names that were defined for it. */
type Read = { to: number; stubs: string }[];

/**
 * `source` read in pieces into `blocks`, with the names `defined` holds defined for each piece that
 * refers to them.
 */
const readPieces = (
  source: string,
  blocks: Node[],
  defined: Map<string, string>
): Read => {
  const budget = { left: MAX_COST, plain: false };
  const read: Read = [];
  const parts: Piece["parts"] = new Map();
  let blank: Blank = { lines: 0, plain: false, at: 0 };
  let line = 0;
  for (let from = 0; from < source.length;) {
    const to = pieceEnd(source, from);
    const text = source.slice(from, to);
    const piece = { source, from, blank, parts };
    const open = openAt(piece, blocks);
    const stubs = stubsFor(text, defined);
    const lead = stubs + leadFor(piece, open);
    // What goes on in a paragraph that is plain text is plain text too.
    budget.plain &&= open.at(-1)?.type === "paragraph";
    const tree: Node = treeOf(lead + text, budget, lead.length);
    const lines = line - linesIn(lead);
    each(tree, ({ position }) => {
      for (const point of position ? [position.start, position.end] : []) {
        point.offset = (point.offset ?? 0) + from - lead.length;
        point.line += lines;
      }
    });
    place(piece, blocks, tree.children ?? []);
    read.push({ to, stubs });
    blank = blankAfter(text, from, blank);
    line += linesIn(text);
    from = to;
  }
  for (const [node, held] of parts) {
    node.value = held.join("");
  }
  return read;
};

/** The names the blocks define, each with a line that defines it and nothing more. */
const definedIn = (blocks: Node[]) => {
  const defined = new Map<string, string>();
  for (const block of blocks) {
    each(block, ({ type, identifier = "", label }) => {
      if (type === "definition") {
        defined.set(identifier, stubOf(label ?? identifier));
      } else if (type === "footnoteDefinition") {
        defined.set(`^${identifier}`, stubOf(`^${label ?? identifier}`));
      }
    });
  }
  return defined;
};

/**
 * The tree of `source`. Each node keeps its offsets in the source. A paragraph, heading or table
 * cell longer than MAX_INLINE, or with more marks than FREE_MARKS once MAX_COST is spent, is its own
 * characters, as plain text. Should the parser fail all the same, the source is one paragraph of its
 * own words: an answer is always drawn.
 */
export const parseMarkdown = (source: string): MarkdownRoot => {
  try {
    if (pieceEnd(source, 0) === source.length) {
      return treeOf(source, { left: MAX_COST, plain: false });
    }
    // The lines that look to define a name are taken to. Should the pieces, once read, define
    // other names (a line of code only looks to, a line in a quote does), they are read again.
    const guessed = new Map<string, string>();
    for (const { groups } of source.matchAll(DEFINITION)) {
      guessed.set(nameOf(groups?.label ?? ""), stubOf(groups?.label ?? ""));
    }
    const first: MarkdownRoot = { type: "root", children: [] };
    const read = readPieces(source, first.children, guessed);
    const defined = definedIn(first.children);
    const same = read.every(
      ({ to, stubs }, index) =>
        stubs === stubsFor(source.slice(read[index - 1]?.to ?? 0, to), defined)
    );
    if (same) {
      return first;
    }
    const again: MarkdownRoot = { type: "root", children: [] };
    readPieces(source, again.children, defined);
    return again;
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
// The parser recurses into every quote and list it opens, so a hostile answer, or a model's runaway,
// could exhaust the stack with a few thousand `- ` or `>` on a line. None of that is in a real
// answer, so a quote or a list deeper than MAX_DEPTH on a line is words from there: a backslash
// undoes the first mark past it, and it shows as the character it is. Code in a fence is left as it
// is. (A long paragraph's cost is bounded in the parse: see MAX_INLINE.)

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
export const bounded = (source: string): string => {
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
