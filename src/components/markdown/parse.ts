// Markdown's pure half: the answer cut into top-level blocks, each read once by micromark (with
// GitHub's additions) while it is the same, and the end still being written made whole by remend.
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";
import remend from "remend";

/** A Markdown syntax tree (mdast). */
export type MarkdownRoot = ReturnType<typeof fromMarkdown>;
export type RootContent = MarkdownRoot["children"][number];

// Strike-through is two tildes, as a model writes it (`20~25°C` is a tilde). micromark weighs each
// emphasis or link mark of a paragraph against those before it, so many unmatched ones cost their
// number squared (`a*` repeated: 1.7 s for 40 KB): a block with a paragraph of more than 1,000 (its
// fenced code aside) is read without them, as words, and without `![^1]`, a note's mark after a `!`,
// which looks back for its picture.
const OFF =
  "attention strikethrough labelStartLink labelStartImage labelEnd gfmPotentialFootnoteCall";
const GFM = [gfm({ singleTilde: false })];
const PLAIN = [...GFM, { disable: { null: OFF.split(" ") } }];
const FROM = [gfmFromMarkdown()];
// micromark reads `[^1]` as a note's mark only once it has read the note (`gfmFootnotes`), which a
// block read alone, or an answer still being written, may not hold yet: while written, the list of
// notes read holds every name, so a mark is one from the start.
const EVERY = Object.assign<string[], object>([], { includes: () => true });
const everyNote: ReturnType<typeof gfm> = {
  text: {
    91: {
      add: "before" as const,
      tokenize<State>(
        this: { parser: { gfmFootnotes?: string[] } },
        _: unknown,
        __: unknown,
        nok: State
      ) {
        this.parser.gfmFootnotes = EVERY;
        return nok;
      },
    },
  },
};
const FENCE = /^ {0,3}(?<fence>`{3,}|~{3,})(?<info>.*)$/u;
const closes = (line: string, open: string) => {
  const { fence = "", info = "x" } = FENCE.exec(line)?.groups ?? {};
  return (
    fence.startsWith(open.slice(0, 1)) &&
    fence.length >= open.length &&
    info.trim() === ""
  );
};
// A line led by more than 64 characters of indent and container marks: a list or a quote nested
// past 32 deep, which micromark weighs as its depth squared (400 deep: 5 s for 80 KB).
const DEEP = /^(?:[ \t]|(?:[-*+>]|\d{1,9}[.)])(?=[ \t])){65,}/u;
/**
 * The source as it is read, fenced code left as it is: a line nested past 32 deep keeps its last 64
 * characters of lead, so it is drawn 32 deep; and whether a paragraph has more than 1,000 marks.
 */
const bounded = (source: string) => {
  let fence = "";
  let marks = 0;
  let many = false;
  const lines = source.split("\n").map((line) => {
    if (fence !== "") {
      fence = closes(line, fence) ? "" : fence;
      return line;
    }
    fence = FENCE.exec(line)?.groups?.fence ?? "";
    // A fence, a list item, a row, a heading or a blank line starts a part of its own.
    marks = fence !== "" || /^[ \t>]*(?:[-*+|#\d]|$)/u.test(line) ? 0 : marks;
    marks += line.replaceAll(/[^*_~[\]]/gu, "").length;
    many ||= fence === "" && marks > 1000;
    return line.replace(DEEP, (lead) => lead.slice(-64));
  });
  return { text: lines.join("\n"), many };
};
const read = (source: string, notes = false): MarkdownRoot => {
  const { text, many } = bounded(source);
  try {
    const extensions = [...(many ? PLAIN : GFM), ...(notes ? [everyNote] : [])];
    return fromMarkdown(text, { extensions, mdastExtensions: FROM });
  } catch {
    // Nesting deep enough to exhaust the stack (thousands of `>` on a line): its words.
    const words = { type: "text" as const, value: source };
    return {
      type: "root",
      children: [{ type: "paragraph", children: [words] }],
    };
  }
};
/** An answer's syntax tree, whole. */
export const parseMarkdown = (source: string) => read(source);

// After a blank line, a line at the margin that no list item starts starts a block of its own; a
// fence, or HTML that may hold blank lines (CommonMark's kinds 1 to 5), runs on to its end.
const STARTS = /^(?![-*+](?:[ \t]|$)|\d{1,9}[.)](?:[ \t]|$))\S/u;
const HTML =
  /^ {0,3}<(?<open>pre|script|style|textarea|!--|\?|!\[CDATA\[|![a-z])/iu;
const ENDS: Record<string, string> = {
  "!--": "-->",
  "?": "?>",
  "![cdata[": "]]>",
};

/** What ends the block `line` opens, if it does not end on that line. */
const endOf = (line: string): ((next: string) => boolean) | null => {
  const fence = FENCE.exec(line)?.groups?.fence;
  if (fence !== undefined) {
    return (next) => closes(next, fence);
  }
  const open = HTML.exec(line)?.groups?.open?.toLowerCase() ?? "";
  const end = ENDS[open] ?? (/^[a-z]{2}/u.test(open) ? `</${open}>` : ">");
  const ends = (next: string) => next.toLowerCase().includes(end);
  return open === "" || ends(line.slice(open.length + 1)) ? null : ends;
};

// A reference is a link, or a note's mark, only where its definition is read with it, so a whole
// answer that defines a name or a note (or seems to) is read whole; while it streams, a reference to
// a link is its words.
const DEFINES = /^[ \t>*+\d.)-]*\[(?:[^\]\\]|\\.){1,999}\]:/mu;
export const definesNames = (source: string) => DEFINES.test(source);
/**
 * Where each top-level block of `source` starts. `known`: the starts of a shorter answer this one
 * goes on from; all but the last stand, and the rest is read on from there.
 */
export const blockStarts = (source: string, known: readonly number[] = []) => {
  const starts = known.length > 1 ? known.slice(0, -1) : [0];
  let ends: ((next: string) => boolean) | null = null;
  let blank = false;
  for (let at = starts.at(-1) ?? 0; at < source.length;) {
    const next = source.indexOf("\n", at) + 1 || source.length;
    const line = source.slice(at, next).trimEnd();
    if (ends === null) {
      if (blank && STARTS.test(line) && at > (starts.at(-1) ?? 0)) {
        starts.push(at);
      }
      ends = endOf(line);
    } else if (ends(line)) {
      ends = null;
    }
    blank = ends === null && line === "";
    at = next;
  }
  return starts;
};

/**
 * A block that opens a fence and does not close it: its code, never read by the parser, less a
 * closing fence still being typed.
 */
export const openCode = (block: string) => {
  const [first = "", ...lines] = block.split("\n");
  const { fence, info = "" } = FENCE.exec(first)?.groups ?? {};
  if (fence === undefined || lines.some((line) => closes(line, fence))) {
    return null;
  }
  const last = lines.at(-1)?.trim() ?? "";
  const lang = info.trim().split(/\s/u)[0] ?? "";
  const closing = last !== "" && fence.startsWith(last);
  const value = (closing ? lines.slice(0, -1) : lines).join("\n");
  return [{ type: "code" as const, lang: lang === "" ? null : lang, value }];
};

const cache = new Map<string, RootContent[]>();
const REPAIR = {
  singleTilde: false,
  comparisonOperators: false,
  katex: false,
} as const;

/**
 * A block's nodes, read once while it is the same. `open`: the block still being written, made
 * whole first (remend: bold from its first letter, a half link one to nowhere, a half picture's
 * address nowhere) and not kept, with none of remend's rewrites that would draw a whole answer
 * otherwise. `streaming`: every `[^name]` is a note's mark, its note perhaps still to come.
 */
export const readBlock = (block: string, open = false, streaming = false) => {
  const source = open ? remend(block, REPAIR) : block;
  const notes = streaming && source.includes("[^");
  const key = notes ? `\0${source}` : source;
  const nodes = cache.get(key) ?? read(source, notes).children;
  if (!open) {
    if (cache.size > 5000) {
      cache.clear();
    }
    cache.set(key, nodes);
  }
  return nodes;
};

/** Where a link or a picture still being written leads once remend has made it whole: nowhere. */
export const HALF = new Set([
  "streamdown:incomplete-link",
  "streamdown:incomplete-image",
]);
