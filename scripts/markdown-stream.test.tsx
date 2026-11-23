// Markdown while it streams. At every prefix of an answer, what a reader sees is weighed against
// what they see once the answer is whole:
//   - a raw mark: a mark (`*`, `[`, a backtick, a pipe …) on screen where the whole answer shows
//     none, so it flashes and goes;
//   - a retraction: something shown is taken back, rather than added to.
// Two corpora:
//   - ten answers as a model writes them (scripts/fixtures/markdown-answers.json: prose with links
//     and emphasis, nested lists, tables, code in several languages, tasks, notes, math-like text
//     with `$` and `_`, Chinese and Japanese, Arabic and Hebrew, emoji), every prefix, a character at
//     a time, read off the blocks Markdown draws as it draws them while streaming (repair, then a
//     block at a time); that reading is held to the real drawing, on the server, every 40th prefix;
//   - every input of Streamdown's and remend's own tests (scripts/fixtures/streamdown-inputs.json),
//     each a half-written answer: what Markdown shows of it against what remend's repair shows of
//     it, both drawn by Markdown.
// The counts are the docs page's "How it is tested" (docs/components/markdown.mdx), held to it here.
//
//   pnpm exec vp test scripts/markdown-stream.test.tsx
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import * as stylex from "@stylexjs/stylex";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { Markdown } from "../src/components/markdown/index.ts";
import {
  bounded,
  groupSections,
  NOTHING,
  parseMarkdown,
  readBlocks,
} from "../src/components/markdown/parse.ts";
import type { Grouped, Placed } from "../src/components/markdown/parse.ts";
import { repair, tidy } from "../src/components/markdown/repair.ts";
import { visuallyHidden } from "../src/lib/styles.ts";
import { safeHref } from "../src/lib/utils.ts";
import { isRecord, readJson } from "./json.ts";
import { families } from "./markdown-cost.ts";

/** The records of a fixture's list `key`, each with the string fields `fields` asks for. */
const recordsIn = (file: string, key: string, fields: string[]) => {
  const value = readJson(fileURLToPath(new URL(file, import.meta.url)));
  const list = isRecord(value) ? value[key] : undefined;
  return (Array.isArray(list) ? list : []).flatMap((item: unknown) => {
    if (!isRecord(item)) {
      return [];
    }
    const strings = new Map<string, string>();
    for (const field of fields) {
      const found = item[field];
      if (typeof found === "string") {
        strings.set(field, found);
      } else if (Array.isArray(found)) {
        strings.set(field, found.join("\n"));
      }
    }
    return strings.size === fields.length ? [strings] : [];
  });
};

const answers = recordsIn("fixtures/markdown-answers.json", "answers", [
  "name",
  "lines",
]).map((answer) => ({
  name: answer.get("name") ?? "",
  text: answer.get("lines") ?? "",
}));

const cases = recordsIn("fixtures/streamdown-inputs.json", "cases", [
  "test",
  "markdown",
  "remend",
]).map((each) => ({
  test: each.get("test") ?? "",
  markdown: each.get("markdown") ?? "",
  remend: each.get("remend") ?? "",
}));

/** A node of the tree, as far as reading its words goes. */
interface Node {
  type: string;
  value?: string;
  alt?: string | null;
  url?: string;
  identifier?: string;
  label?: string | null;
  children?: Node[];
}

/** The nodes whose words run together: a phrase's, a paragraph's, a heading's, a cell's. */
const RUN_TOGETHER = new Set([
  "strong",
  "emphasis",
  "delete",
  "link",
  "linkReference",
  "paragraph",
  "heading",
  "tableCell",
]);

/** What the tree refers to: link targets, notes, and the notes in the order they are first referred to. */
const gathered = (nodes: Node[]) => {
  const definitions = new Map<string, string>();
  const notes = new Map<string, Node>();
  const order: string[] = [];
  const visit = (node: Node) => {
    const id = node.identifier ?? "";
    if (node.type === "definition") {
      definitions.set(id, node.url ?? "");
    } else if (node.type === "footnoteDefinition") {
      notes.set(id, node);
    } else if (node.type === "footnoteReference" && !order.includes(id)) {
      order.push(id);
    }
    for (const child of node.children ?? []) {
      visit(child);
    }
  };
  for (const node of nodes) {
    visit(node);
  }
  return { definitions, notes, order };
};

/**
 * What a reader sees of each block, as Markdown draws it: its words, a section's summary then its
 * blocks, and after the blocks each note at the foot. While it streams, a section still open is one.
 */
const seenBlocks = (blocks: Placed[]): { shown: string[]; foot: string[] } => {
  const nodes: Node[] = blocks.map(({ node }) => node);
  const { definitions, notes, order } = gathered(nodes);
  const numbered = order.filter((id) => notes.has(id));
  const pictured = (node: Node) => {
    const url =
      node.type === "image" ? node.url : definitions.get(node.identifier ?? "");
    return node.alt === "" || node.alt === null || node.alt === undefined
      ? (safeHref(url) ?? "")
      : node.alt;
  };
  const words = (node: Node): string => {
    if (["text", "inlineCode", "html"].includes(node.type)) {
      return (node.value ?? "").replaceAll("\n", " ");
    }
    if (node.type === "code") {
      return node.value ?? "";
    }
    if (node.type === "image" || node.type === "imageReference") {
      return pictured(node);
    }
    if (node.type === "footnoteReference") {
      const number = numbered.indexOf(node.identifier ?? "") + 1;
      return number === 0
        ? `[^${node.label ?? node.identifier}]`
        : String(number);
    }
    const inner = (node.children ?? []).map(words);
    return inner.join(RUN_TOGETHER.has(node.type) ? "" : " ");
  };
  // A section's summary, then its blocks; at the foot, the notes in the order they are referred to.
  const grouped = (each: Grouped): string =>
    each.type === "section"
      ? [each.summary.map(words).join(""), ...each.children.map(grouped)].join(
          " "
        )
      : words(each.placed.node);
  const shown = groupSections(
    blocks.filter(
      ({ node }) =>
        node.type !== "definition" && node.type !== "footnoteDefinition"
    ),
    true
  ).map(grouped);
  const foot = numbered.flatMap((id) => {
    const note = notes.get(id);
    return note === undefined ? [] : [words(note)];
  });
  return { shown, foot };
};

/** What a reader sees of blocks, as Markdown draws them: words only, every run of spaces one. */
const seenOf = (blocks: Placed[]): string => {
  const { shown, foot } = seenBlocks(blocks);
  return [...shown, ...foot].join(" ").replaceAll(/\s+/gu, " ").trim();
};

const HIDDEN = stylex.props(visuallyHidden).className ?? "";
const BLOCK_TAGS =
  /^(?:p|h\d|li|tr|td|th|pre|blockquote|div|section|table|ul|ol)$/u;

/** Whether an element's words are not on screen: said only to a screen reader, an icon, a button, a note's way back. */
const isHidden = (tag: string, attributes: string) =>
  attributes.includes(`class="${HIDDEN}"`) ||
  attributes.includes('aria-hidden="true"') ||
  /^(?:svg|button|output)$/u.test(tag) ||
  attributes.includes('data-slot="code-block-header"') ||
  attributes.includes('role="tooltip"') ||
  /href="#[^"]*-ref-/u.test(attributes);

/** What a reader sees of Markdown drawn on the server: its words, every run of spaces one. */
const seenInHtml = (html: string): string => {
  let out = "";
  const hidden: number[] = [];
  let depth = 0;
  for (const match of html.matchAll(
    /<(?<close>\/?)(?<tag>[a-zA-Z][\w-]*)(?<attributes>[^>]*?)(?<self>\/?)>|(?<text>[^<]+)/gu
  )) {
    const { close, tag = "", attributes = "", self, text } = match.groups ?? {};
    if (text !== undefined) {
      out += hidden.length === 0 ? text : "";
    } else if (close === "/") {
      depth -= 1;
      if (hidden.at(-1) === depth) {
        hidden.pop();
      }
      out += BLOCK_TAGS.test(tag) ? " " : "";
    } else if (self !== "/" && !/^(?:br|hr|img|input|path)$/u.test(tag)) {
      if (hidden.length === 0 && isHidden(tag, attributes)) {
        hidden.push(depth);
      }
      out +=
        BLOCK_TAGS.test(tag) ||
        attributes.includes('data-slot="code-block-line"')
          ? " "
          : "";
      depth += 1;
    }
  }
  return out
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll(/\s+/gu, " ")
    .trim();
};

/** The characters that start or end a mark. */
const MARK = /[*_~`[\]()#>|<!\\$=-]/u;

/** How far apart the prefixes are that are also drawn on the server. */
const DRAWN_EVERY = 200;

/** The names a stream's blocks define, one string: when it changes, a definition has arrived. */
const definedIn = (blocks: Placed[]) =>
  blocks
    .flatMap(({ node }) =>
      node.type === "definition" || node.type === "footnoteDefinition"
        ? [node.identifier]
        : []
    )
    .join(" ");

/** The marks whose meaning a later character decides, as CommonMark reads them (see streamOf). */
const DECIDED_LATER = /[*_~`|[\]()!]/gu;

/**
 * How a stream of `answer` reads, a character at a time, as Markdown reads it while written:
 *   - where a raw mark shows: a mark on screen past where what is seen leaves the whole answer,
 *     which has none there; and how many times one shows and then goes (episodes);
 *   - where what was shown changes before the point where the answer goes on: a character of a
 *     block, or of a note at the foot, inserted, taken out or replaced, rather than added at its
 *     end. A definition that arrives reads the references to it anew, as a link or a note's
 *     number (Markdown lets the use come first), so the prefix where one arrives is not weighed.
 *     Unless `strict`, a change in marks alone is not counted either: a run of stars, underscores,
 *     tildes or backticks, a line of pipes or a link's brackets is a mark or a character as a later
 *     character decides (`*a` is emphasis once `*a*`; `[a](b` a link once `)` closes it).
 */
const streamOf = (answer: string, strict: boolean) => {
  const whole = seenOf(
    parseMarkdown(tidy(bounded(answer))).children.map((node) => ({
      node,
      base: 0,
    }))
  );
  const flashes: number[] = [];
  const changes: string[] = [];
  let episodes = 0;
  let held = NOTHING;
  let before: { shown: string[]; foot: string[] } = { shown: [], foot: [] };
  let names = "";
  for (let at = 1; at <= answer.length; at += 1) {
    const read = readBlocks(repair(bounded(answer.slice(0, at))).text, held);
    held = read.kept;
    const seen = seenBlocks(read.blocks);
    const joined = [...seen.shown, ...seen.foot]
      .join(" ")
      .replaceAll(/\s+/gu, " ")
      .trim();
    let same = 0;
    while (same < joined.length && joined[same] === whole[same]) {
      same += 1;
    }
    if (MARK.test(joined.slice(same))) {
      episodes += flashes.at(-1) === at - 1 ? 0 : 1;
      flashes.push(at);
    }
    const defined = definedIn(read.blocks);
    for (const part of defined === names ? (["shown", "foot"] as const) : []) {
      for (const [index, block] of before[part].entries()) {
        const now = seen[part][index] ?? "";
        const added = strict
          ? now.startsWith(block)
          : now
              .replaceAll(DECIDED_LATER, "")
              .startsWith(block.replaceAll(DECIDED_LATER, ""));
        if (!added) {
          changes.push(
            `at ${at}: ${JSON.stringify(block)} became ${JSON.stringify(now)}`
          );
        }
      }
    }
    before = seen;
    names = defined;
  }
  return { flashes: flashes.length, episodes, changes };
};

/** A count, written as the docs page writes it. */
const counted = (count: number) => count.toLocaleString("en");

const page = readFileSync(
  new URL("../docs/components/markdown.mdx", import.meta.url),
  "utf-8"
);

describe("72 answers, streamed a character at a time", () => {
  // Where a raw mark shows, all of them once: a note shows as written (`[^1]`) until it arrives at
  // the end; and `5*3 … 2*2`, where CommonMark pairs the star inside `5*3` with a later one, which
  // no prefix before it can know: a star inside a word is most likely a character, so it shows,
  // and goes once the second arrives. That one change is the only change to what was shown.
  const RAW_MARKS = new Map([
    ["export", "a note as written until it arrives"],
    [
      "math",
      "a star inside a word that CommonMark pairs with a later one (5*3 … 2*2)",
    ],
    ["policy", "a note as written until it arrives"],
    ["d1", "a note as written until it arrives"],
  ]);
  const CHANGED = new Map([["math", 1]]);

  test("what was shown is only ever added to, and a raw mark shows only where Markdown decides it later", () => {
    const flashing = new Map<string, string>();
    const changed = new Map<string, number>();
    const found: string[] = [];
    let prefixes = 0;
    let flashes = 0;
    let episodes = 0;
    for (const { name, text } of answers) {
      const stream = streamOf(text, true);
      prefixes += text.length;
      flashes += stream.flashes;
      episodes += stream.episodes;
      if (stream.episodes > 0) {
        flashing.set(
          name,
          RAW_MARKS.get(name) ?? `${stream.episodes} episodes`
        );
      }
      if (stream.changes.length > 0) {
        changed.set(name, stream.changes.length);
        found.push(`${name}: ${stream.changes.slice(0, 3).join("; ")}`);
      }
    }
    expect({ changed, found: found.length }).toStrictEqual({
      changed: CHANGED,
      found: CHANGED.size,
    });
    expect(flashing).toStrictEqual(RAW_MARKS);
    expect(page).toContain(
      `"${answers.length} answers as a model writes them, ${counted(prefixes)} prefixes, every character: what was shown is only ever added to, but at ${CHANGED.size} (5*3 … 2*2, a star inside a word that CommonMark pairs with a later one); a raw mark shows at ${counted(flashes)} prefixes in ${episodes} episodes, all that star or a note shown as written until it arrives"`
    );
  }, 300_000);

  test("what is read off the blocks is what is drawn", () => {
    const differing: string[] = [];
    for (const { name, text } of answers) {
      for (let at = 1; at <= text.length; at += DRAWN_EVERY) {
        const source = text.slice(0, at);
        const drawn = seenInHtml(
          renderToStaticMarkup(<Markdown streaming>{source}</Markdown>)
        );
        const read = seenOf(
          readBlocks(repair(bounded(source)).text, NOTHING).blocks
        );
        if (drawn !== read) {
          differing.push(
            `${name} at ${at}:\n  drawn ${drawn}\n  read  ${read}`
          );
        }
      }
    }
    expect(differing).toStrictEqual([]);
  }, 120_000);
});

describe("the cost gate's hostile families, streamed a character at a time", () => {
  test("what was shown is only ever added to, but for marks a later character decides", () => {
    const found: string[] = [];
    for (const family of families) {
      // Each mark and structure, and each pair of marks in one paragraph.
      if (
        family.kind !== "random" &&
        (family.kind !== "pair" || !family.blocks)
      ) {
        const { changes } = streamOf(
          family.make(family.kind === "pair" ? 40 : 160),
          false
        );
        found.push(
          ...changes.slice(0, 2).map((change) => `${family.name} ${change}`)
        );
      }
    }
    expect(found).toStrictEqual([]);
  }, 300_000);
});

/** The words of a view, without its marks and spaces. */
const lettersOf = (text: string) => text.replaceAll(/[^\p{L}\p{N}]/gu, "");
const MARKS = new RegExp(MARK.source, "gu");
const marksOf = (text: string) => text.match(MARKS)?.length ?? 0;

/**
 * How Markdown's view of a half-written answer weighs against remend's: the same; fewer raw marks
 * and the same words; the same words as far as it goes, the rest held back for now; or more raw marks.
 */
const weighed = (ours: string, theirs: string) => {
  if (ours === theirs) {
    return "same";
  }
  const words = lettersOf(ours);
  const marks = Math.sign(marksOf(ours) - marksOf(theirs));
  if (words === lettersOf(theirs) && marks !== 0) {
    return marks < 0 ? "fewer raw marks" : "more raw marks";
  }
  return lettersOf(theirs).startsWith(words) && marks <= 0
    ? "held back"
    : "other";
};

describe("Streamdown's and remend's own inputs, half-written", () => {
  // Where remend shows fewer marks, by choice: a star inside a word is a character, not a mark
  // to close (CommonMark leaves it so once the answer is whole); a bracket that ran on past its
  // line is words (remend makes the lines after it a link to nowhere); and a note is shown as
  // written until it is defined (remend numbers it at once, so a number moves should the note
  // never come, and words change: `m[0][1]`).
  const NOTE = "a note shown as written until it is defined";
  const REMEND_SHOWS_FEWER = new Map([
    ["remend/__tests__/intraword-asterisk.test.ts:31", "a star inside a word"],
    ["remend/__tests__/intraword-asterisk.test.ts:32", "a star inside a word"],
    ["remend/__tests__/italic.test.ts:50", "a star inside a word"],
    [
      "remend/__tests__/link-block-scope.test.ts:47",
      "a bracket that ran past its line",
    ],
    [
      "remend/__tests__/link-block-scope.test.ts:50",
      "a bracket that ran past its line",
    ],
    ["streamdown/__tests__/anchor-links.test.tsx:29", NOTE],
    ["streamdown/__tests__/footnotes.test.tsx:43", NOTE],
    ["streamdown/__tests__/footnotes.test.tsx:65", NOTE],
    ["streamdown/__tests__/footnotes.test.tsx:138", NOTE],
    ["streamdown/__tests__/footnotes.test.tsx:158", NOTE],
    ["streamdown/__tests__/footnotes.test.tsx:197", NOTE],
  ]);

  test("Markdown shows as few raw marks as remend, or fewer, and never loses a word", () => {
    const tally: Record<string, number> = {};
    const fewer = new Map<string, string>();
    for (const each of cases) {
      const ours = seenInHtml(
        renderToStaticMarkup(<Markdown streaming>{each.markdown}</Markdown>)
      );
      const theirs = seenInHtml(
        renderToStaticMarkup(<Markdown>{each.remend}</Markdown>)
      );
      const verdict = weighed(ours, theirs);
      tally[verdict] = (tally[verdict] ?? 0) + 1;
      if (verdict === "more raw marks" || verdict === "other") {
        fewer.set(
          each.test,
          REMEND_SHOWS_FEWER.get(each.test) ??
            `${verdict}: ${ours} | remend: ${theirs}`
        );
      }
    }
    expect(fewer).toStrictEqual(REMEND_SHOWS_FEWER);
    expect(page).toContain(
      `"${counted(cases.length)} inputs of their tests, each a half-written answer: Markdown shows the same as remend for ${counted(tally.same ?? 0)}, fewer raw marks for ${tally["fewer raw marks"] ?? 0}, holds back a mark or a bracket still being written for ${tally["held back"] ?? 0} (remend shows it), and other words for ${(tally["more raw marks"] ?? 0) + (tally.other ?? 0)}: a star inside a word or a bracket that ran past its line, which it leaves as words, and a note shown as written until it is defined"`
    );
  }, 120_000);
});
