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
  repair,
  tidy,
} from "../src/components/markdown/parse.ts";
import type { Grouped, Placed } from "../src/components/markdown/parse.ts";
import { visuallyHidden } from "../src/lib/styles.ts";
import { safeHref } from "../src/lib/utils.ts";
import { isRecord, readJson } from "./json.ts";

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
 * What a reader sees of blocks, as Markdown draws them: words only, every run of spaces one. While
 * it streams, a note still to come has its number already, and a section still open is one.
 */
const seenOf = (blocks: Placed[], streaming: boolean): string => {
  const nodes: Node[] = blocks.map(({ node }) => node);
  const { definitions, notes, order } = gathered(nodes);
  const numbered = streaming ? order : order.filter((id) => notes.has(id));
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
      return ` ${node.value ?? ""} `;
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
    return RUN_TOGETHER.has(node.type)
      ? inner.join("")
      : ` ${inner.join(" ")} `;
  };
  // A section's summary, then its blocks; at the foot, the notes in the order they are referred to.
  const grouped = (each: Grouped): string =>
    each.type === "section"
      ? ` ${each.summary.map(words).join("")} ${each.children.map(grouped).join(" ")}`
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

/** How a stream of `answer` reads, a character at a time: where a raw mark shows, where something is taken back. */
const streamOf = (answer: string) => {
  const whole = seenOf(
    parseMarkdown(tidy(bounded(answer))).children.map((node) => ({
      node,
      base: 0,
    })),
    false
  );
  const rawMarks: number[] = [];
  const retractions: number[] = [];
  let kept = NOTHING;
  let before = "";
  for (let at = 1; at <= answer.length; at += 1) {
    const read = readBlocks(
      repair(bounded(answer.slice(0, at))).text,
      kept,
      true
    );
    ({ kept } = read);
    const seen = seenOf(read.blocks, true);
    // Where what is seen leaves the whole answer, past the word still being written, it shows
    // something the whole answer does not: a raw mark, where that holds one.
    let same = 0;
    while (same < seen.length && seen[same] === whole[same]) {
      same += 1;
    }
    if (MARK.test(seen.slice(same))) {
      rawMarks.push(at);
    }
    if (!seen.startsWith(before)) {
      retractions.push(at);
    }
    before = seen.replace(/\S+$/u, "");
  }
  return { rawMarks, retractions };
};

/** A count, written as the docs page writes it. */
const counted = (count: number) => count.toLocaleString("en");

const page = readFileSync(
  new URL("../docs/components/markdown.mdx", import.meta.url),
  "utf-8"
);

describe("ten answers, streamed a character at a time", () => {
  // `5*3 = 15 and 2*2*2 = 8`: CommonMark pairs the star of `5*3` with the first of `2*2`, so the
  // whole answer shows "3 = 15 and 2" in italics. A star inside a word is left open while written
  // (it is most likely a character), so it shows until the second arrives, and then goes.
  const FIVE_TIMES_THREE = { rawMarks: 13, retractions: 1 };

  test("no raw mark shows and nothing is taken back, but where CommonMark pairs two stars inside words", () => {
    const found = answers.map(({ name, text }) => {
      const { rawMarks, retractions } = streamOf(text);
      return {
        name,
        prefixes: text.length,
        rawMarks: rawMarks.length,
        retractions: retractions.length,
      };
    });
    expect(
      found.map(({ name, rawMarks, retractions }) => ({
        name,
        rawMarks,
        retractions,
      }))
    ).toStrictEqual(
      answers.map(({ name }) => ({
        name,
        ...(name === "math"
          ? FIVE_TIMES_THREE
          : { rawMarks: 0, retractions: 0 }),
      }))
    );
    const prefixes = found.reduce((sum, { prefixes: each }) => sum + each, 0);
    expect(page).toContain(
      `"${answers.length} answers as a model writes them, ${counted(prefixes)} prefixes, a character at a time: a raw mark shows at ${FIVE_TIMES_THREE.rawMarks} and something is taken back at ${FIVE_TIMES_THREE.retractions}, all one star inside a word that CommonMark pairs with a later one (5*3 … 2*2)"`
    );
  }, 120_000);

  test("what is read off the blocks is what is drawn", () => {
    const differing: string[] = [];
    for (const { name, text } of answers) {
      for (let at = 1; at <= text.length; at += 40) {
        const source = text.slice(0, at);
        const drawn = seenInHtml(
          renderToStaticMarkup(<Markdown streaming>{source}</Markdown>)
        );
        const read = seenOf(
          readBlocks(repair(bounded(source)).text, NOTHING, true).blocks,
          true
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
  // to close (CommonMark leaves it so once the answer is whole), and a bracket that ran on past its
  // line is words (remend makes the lines after it a link to nowhere).
  const REMEND_SHOWS_FEWER = new Map([
    [
      "remend/__tests__/broken-markdown-variants.test.ts:442",
      "a star inside a word",
    ],
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
      `"${counted(cases.length)} inputs of their tests, each a half-written answer: Markdown shows the same as remend for ${counted(tally.same ?? 0)}, fewer raw marks for ${tally["fewer raw marks"] ?? 0}, holds back a mark or a bracket still being written for ${tally["held back"] ?? 0} (remend shows it), and more raw marks for ${tally["more raw marks"] ?? 0}: a star inside a word, or a bracket that ran past its line, which it leaves as words"`
    );
  }, 120_000);
});
