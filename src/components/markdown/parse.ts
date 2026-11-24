// Markdown's pure half: the answer cut into top-level blocks, each read once by micromark (with
// GitHub's additions) while it is the same, and the end still being written made whole by remend.
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";
import remend from "remend";

/** A Markdown syntax tree (mdast). */
export type MarkdownRoot = ReturnType<typeof fromMarkdown>;
export type RootContent = MarkdownRoot["children"][number];

// Strike-through is two tildes, as a model writes it (`20~25°C` is a tilde). A note's mark (`[^1]`)
// and a task's box (`[x]`) stay as written. micromark weighs each emphasis or link mark of a
// paragraph against those before it, so many unmatched ones cost their number squared (`a*`
// repeated: 1.7 s for 40 KB): a paragraph of more than 1,000 is read without them, as words.
const KEPT = "gfmFootnoteCall gfmPotentialFootnoteCall tasklistCheck";
const OFF = "attention strikethrough labelStartLink labelStartImage labelEnd";
const off = (names: string) => ({ disable: { null: names.split(" ") } });
const GFM = [gfm({ singleTilde: false }), off(KEPT)];
const PLAIN = [...GFM, off(OFF)];
const FROM = [gfmFromMarkdown()];
const PARAGRAPHS = /\n(?=[ \t>]*(?:[-*+|#\d\n]|$))/u;
const marks = (part: string) => part.replaceAll(/[^*_~[\]]/gu, "").length;
/** An answer's syntax tree, whole. */
export const parseMarkdown = (source: string): MarkdownRoot => {
  const many = source.split(PARAGRAPHS).some((part) => marks(part) > 1000);
  try {
    const extensions = many ? PLAIN : GFM;
    return fromMarkdown(source, { extensions, mdastExtensions: FROM });
  } catch {
    // Nesting deep enough to exhaust the stack (thousands of `>` on a line): its words.
    const text = { type: "text" as const, value: source };
    return {
      type: "root",
      children: [{ type: "paragraph", children: [text] }],
    };
  }
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

// A reference is a link only where its definition is read with it, so a whole answer that defines a
// name (or seems to) is read whole; while it streams, a reference is its words.
const DEFINES = /^[ \t>*+\d.)-]*\[(?!\^)(?:[^\]\\]|\\.){1,200}\]:/mu;
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

/** A block that opens a fence and does not close it: its code, never read by the parser. */
export const openCode = (block: string) => {
  const [first = "", ...lines] = block.split("\n");
  const { fence, info = "" } = FENCE.exec(first)?.groups ?? {};
  if (fence === undefined || lines.some((line) => closes(line, fence))) {
    return null;
  }
  const lang = info.trim().split(/\s/u)[0] ?? "";
  const value = lines.join("\n");
  return [{ type: "code" as const, lang: lang === "" ? null : lang, value }];
};

const cache = new Map<string, RootContent[]>();
const REPAIR = {
  linkMode: "text-only",
  singleTilde: false,
  comparisonOperators: false,
  katex: false,
} as const;

/**
 * A block's nodes, read once while it is the same. `open`: the block still being written, made
 * whole first (remend: bold from its first letter, a half link its words, a half picture's address
 * nowhere) and not kept, with none of remend's rewrites that would draw a whole answer otherwise.
 */
export const readBlock = (block: string, open = false) => {
  const source = open ? remend(block, REPAIR) : block;
  const nodes = cache.get(source) ?? parseMarkdown(source).children;
  if (!open) {
    if (cache.size > 5000) {
      cache.clear();
    }
    cache.set(source, nodes);
  }
  return nodes;
};

/** Where a picture still being written leads once remend has made it whole: nowhere. */
export const HALF_PICTURE = "streamdown:incomplete-image";
