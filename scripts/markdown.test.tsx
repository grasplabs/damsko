// Markdown through its interface, drawn on the server. The parse is micromark's, so what is ours is
// held here: the cut into blocks reads every CommonMark and GFM example as the whole parse does,
// and each kind of node draws its part; no address still being written, or unsafe, is ever handed
// on; and time and size grow in step with the answer, hostile ones too. Streaming in a DOM:
// markdown-stream.test.tsx.
//
//   pnpm exec vp test scripts/markdown.test.tsx
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import {
  Markdown,
  MarkdownLinkProvider,
  parseMarkdown,
} from "../src/components/markdown/index.ts";
import type {
  MarkdownLinkRenderer,
  MarkdownProps,
} from "../src/components/markdown/index.ts";
import * as parse from "../src/components/markdown/parse.ts";
import { safeHref } from "../src/lib/utils.ts";
import { isRecord, readJson } from "./json.ts";

/** Each item of a fixture's list `key`: its name, and its Markdown (joined when given as lines). */
const fixture = (file: string, key: string, field: string) => {
  const value = readJson(fileURLToPath(new URL(file, import.meta.url)));
  const list = isRecord(value) ? value[key] : undefined;
  return (Array.isArray(list) ? list : []).flatMap((item: unknown) => {
    const text = isRecord(item) ? item[field] : undefined;
    const joined = Array.isArray(text) ? text.join("\n") : text;
    const name = isRecord(item) ? String(item.example ?? item.name) : "";
    return typeof joined === "string" ? [{ name, text: joined }] : [];
  });
};
const specs = [
  ...fixture("fixtures/commonmark-spec.json", "examples", "markdown"),
  ...fixture("fixtures/gfm-spec.json", "examples", "markdown"),
];

const draw = (source: string, props: Partial<MarkdownProps> = {}) =>
  renderToStaticMarkup(<Markdown {...props}>{source}</Markdown>);

const count = (html: string, pattern: string) =>
  html.match(new RegExp(pattern, "gu"))?.length ?? 0;

type Tree = ReturnType<typeof parseMarkdown>["children"][number];
// SAFETY: every node a node of the tree holds is a node of the tree.
const kids = (node: Tree) =>
  ("children" in node ? node.children : []) as Tree[];

const shape = (nodes: unknown) =>
  JSON.stringify(nodes, (key, value: unknown) =>
    key === "position" ? undefined : value
  );

const allNodes = (nodes: Tree[]): Tree[] =>
  nodes.flatMap((node) => [node, ...allNodes(kids(node))]);
const definitionsIn = (nodes: Tree[]) =>
  allNodes(nodes).flatMap((node) => (node.type === "definition" ? [node] : []));

const tags: Record<string, string> = {
  blockquote: "<blockquote",
  list: "<[ou]l",
  listItem: "<li",
  table: "<table",
  strong: "<strong",
  emphasis: "<em\\b",
  delete: "<del",
  break: "<br",
  inlineCode: "<code class",
  code: 'data-slot="code-block"',
  thematicBreak: '<hr|role="separator"',
};

/**
 * The parts one node draws, by the elements' patterns: a paragraph in a list item or a note is its
 * words, HTML outside a phrase a paragraph of text, a link in a link its words, and a table's row
 * as many cells as its head at most.
 */
const partsOf = (
  node: Tree,
  place: string,
  inLink: boolean,
  defined: Map<string, string>
): [string, number][] => {
  const parts: [string, number][] = [];
  const tag = tags[node.type];
  if (tag !== undefined) {
    parts.push([tag, 1]);
  }
  if (node.type === "table") {
    const width = node.children[0]?.children.length ?? 0;
    for (const row of node.children) {
      parts.push(["<t[hd]\\b", Math.min(row.children.length, width)]);
    }
  }
  if (node.type === "heading") {
    parts.push([`<h${Math.min(node.depth, 4)}\\b`, 1]);
  }
  const block = place === "block" || (place === "item" && node.type === "html");
  if (block && (node.type === "paragraph" || node.type === "html")) {
    parts.push(["<p\\b", 1]);
  }
  const url =
    "url" in node
      ? node.url
      : defined.get("identifier" in node ? node.identifier : "");
  const linked = /^(?:link|image)(?:Reference)?$/u.test(node.type);
  if (linked && !inLink && safeHref(url, { relative: true }) !== null) {
    parts.push(["<a\\b", 1]);
  }
  return parts;
};

describe("the parse is micromark's, block by block", () => {
  test("every example reads as the whole parse does, cut into blocks", () => {
    const differing = specs.filter(({ text }) => {
      const source = text.replaceAll(/\r\n?/gu, "\n");
      const starts = parse.blockStarts(source);
      const blocks = starts.flatMap((start, at) =>
        parse.readBlock(source.slice(start, starts[at + 1]))
      );
      return shape(blocks) !== shape(parseMarkdown(source).children);
    });
    expect(differing.map(({ name }) => name)).toStrictEqual([]);
    expect(specs.length).toBeGreaterThan(700);
  });

  test("every kind of node draws its part, for every example", () => {
    const differing: string[] = [];
    for (const { name, text } of specs) {
      const tree = parseMarkdown(text.replaceAll(/\r\n?/gu, "\n"));
      const defined = new Map(
        definitionsIn(tree.children)
          .toReversed()
          .map((node) => [node.identifier, node.url])
      );
      const want: Record<string, number> = {};
      const walk = (node: Tree, place: string, inLink: boolean) => {
        for (const [pattern, times] of partsOf(node, place, inLink, defined)) {
          want[pattern] = (want[pattern] ?? 0) + times;
        }
        const linked = /^(?:link|image)(?:Reference)?$/u.test(node.type);
        let next = /^(?:paragraph|heading|tableCell)$/u.test(node.type)
          ? "phrase"
          : "block";
        next = /^(?:listItem|footnoteDefinition)$/u.test(node.type)
          ? "item"
          : next;
        for (const child of kids(node)) {
          walk(child, place === "phrase" ? place : next, inLink || linked);
        }
      };
      for (const node of tree.children) {
        walk(node, "block", false);
      }
      const html = draw(text);
      for (const [pattern, times] of Object.entries(want)) {
        if (count(html, pattern) !== times) {
          differing.push(
            `${name}: ${pattern} ${count(html, pattern)} of ${times}`
          );
        }
      }
    }
    expect(differing).toStrictEqual([]);
  });
});

const JS = ["java", "script"].join("");
const links = [
  "See [the guide](https://example.com/guide) for more.",
  "See [the guide](https://example.com/guide?a=1&b=2#part) now.",
  'Titled [link](https://example.com/t "The title") here.',
  "Mail [us](mailto:team@example.com) or call [us](tel:+3120123456).",
  "A [path](/files/report) and a [relative](report.pdf) one.",
  `A [script](${JS}:alert(1)) link.`,
  `Cased [script](JaVa\tScRiPt:alert(1)) link.`,
  "A [data](data:text/html,<b>x</b>) link.",
  "A [vb](vbscript:msgbox) and a [file](file:///etc/passwd) link.",
  "Elsewhere [//](//evil.example.com/x) link.",
  "Angle <https://example.com/angle> link.",
  "Bare https://example.com/bare/path?q=1 address.",
  "Bare www.example.com/www address.",
  "Mail team@example.com address.",
  "Bare at the end https://example.com/end",
  "[Reference][guide] link.\n\n[guide]: https://example.com/ref",
  "[Collapsed][] link.\n\n[collapsed]: https://example.com/collapsed",
  "[Shortcut] link.\n\n[shortcut]: https://example.com/shortcut 'Title'",
  "[Undefined][nowhere] link.",
  "A picture ![chart](https://example.com/chart.png) here.",
  "A picture ![](https://example.com/empty.png) with no words.",
  `A picture ![bad](${JS}:alert(1)) here.`,
  "[Reference picture][pic]\n\n[pic]: https://example.com/pic.png",
  "A [link with ![a picture](https://example.com/p.png) inside](https://example.com/outer).",
  "A [link [inside](https://example.com/inner) a link](https://example.com/outer2).",
  "**Bold [link](https://example.com/bold)** and *em [link](https://example.com/em)*.",
  "`code [not](https://example.com/code)` and [after](https://example.com/after).",
  "- [In a list](https://example.com/list)\n- [Second](https://example.com/second)",
  "> [In a quote](https://example.com/quote)",
  "| A | B |\n| - | - |\n| [cell](https://example.com/cell) | x |",
  "1. [Ordered](https://example.com/ordered)\n   [nested](https://example.com/nested)",
  "[Parens](https://example.com/a_(b)) and more.",
  "[Angle dest](<https://example.com/a b>) here.",
  "[Escaped \\] bracket](https://example.com/escaped).",
  "[Unclosed](https://example.com/unclosed",
  "[Two](https://example.com/one) [links](https://example.com/two) together.",
  "Text ~~[struck](https://example.com/struck)~~ link.",
  "# A [heading link](https://example.com/heading)",
  "A footnote[^1] link.\n\n[^1]: See [the note](https://example.com/note).",
  "Back to back https://example.com/a,https://example.com/b end.",
  "Trailing dot https://example.com/dot. Next.",
  "In parens (https://example.com/paren) end.",
  "Spaced [link] (https://example.com/space) is not a link.",
  "Image link [![img](https://example.com/i.png)](https://example.com/wrap)",
  "Emoji [🙂 link](https://example.com/emoji) and 中文 [链接](https://example.com/zh).",
  "A [link](https://example.com/x\nsplit) over lines.",
  '<a href="https://example.com/raw">raw HTML</a> stays text.',
  "Autolink <mailto:a@example.com> and <tel:+31201234>.",
  "A [link](  https://example.com/padded  ) padded.",
  "[Def first]\n\n[def first]: https://example.com/first\n[def first]: https://example.com/second",
];

describe("no address still being written, and none unsafe, is ever handed on", () => {
  test("at every prefix of every case, streamed and cut off", () => {
    const wrong: string[] = [];
    for (const text of links) {
      // Every address the whole answer writes, as written and as a link leads to it.
      const tree = parseMarkdown(text);
      const written = new Set(
        allNodes(tree.children).flatMap((node) =>
          "url" in node ? [node.url] : []
        )
      );
      const leads = new Set(
        [...written].map((url) => safeHref(url, { relative: true }))
      );
      for (let at = 1; at <= text.length; at += 1) {
        for (const props of [{ streaming: true }, { truncated: true }]) {
          const handed: string[] = [];
          const take: MarkdownLinkRenderer = (link) => {
            handed.push(link.href);
          };
          const html = renderToStaticMarkup(
            <MarkdownLinkProvider renderLink={take}>
              <Markdown renderLink={take} {...props}>
                {text.slice(0, at)}
              </Markdown>
            </MarkdownLinkProvider>
          );
          const anchors = [...html.matchAll(/<a [^>]*href="(?<href>[^"]*)"/gu)];
          const drawn = anchors.map((found) =>
            (found.groups?.href ?? "").replaceAll("&amp;", "&")
          );
          for (const href of [
            ...handed.filter((url) => !written.has(url)),
            ...drawn.filter((url) => !leads.has(url)),
          ]) {
            wrong.push(`${JSON.stringify(text.slice(0, at))} handed ${href}`);
          }
        }
      }
    }
    expect(wrong).toStrictEqual([]);
    expect(links).toHaveLength(50);
  });
});

// Hostile answers: nesting past any stack, delimiter runs micromark weighs against each other, a
// huge table, links by the thousand.
const hostile: Record<string, (size: number) => string> = {
  "deep nesting": (size) =>
    `${"> ".repeat(size / 4)}a\n\n${Array.from({ length: size / 200 }, (_, at) => `${"  ".repeat(at % 50)}- a`).join("\n")}`,
  "delimiter runs": (size) =>
    `${"a*".repeat(size / 4)}\n${"*_".repeat(size / 4)}`,
  "a huge table": (size) =>
    `| a | b | c |\n|---|---|---|\n${"| **x** | [y](https://e.com) | `z` |\n".repeat(size / 39)}`,
  "many links": (size) => "[a](https://example.com/x) ".repeat(size / 27),
};

describe("time and size grow in step with the answer", () => {
  test.each(Object.entries(hostile))(
    "%s: nine times the answer, under 27 times the time and 10 times the nodes",
    (_, make) => {
      const cost = (size: number) => {
        let best = Number.POSITIVE_INFINITY;
        let nodes = 0;
        for (let run = 0; run < 5; run += 1) {
          // A new answer each run, so none is read from what was read before.
          const source = `${run}${make(size)}`;
          const start = performance.now();
          const html = draw(source);
          best = Math.min(best, performance.now() - start);
          nodes = html.split("<").length;
        }
        return { time: Math.max(best, 1), nodes };
      };
      const [small, , large] = [4000, 12_000, 36_000].map(cost);
      expect(large?.time ?? 0).toBeLessThan((small?.time ?? 0) * 27);
      expect(large?.nodes ?? 0).toBeLessThan((small?.nodes ?? 0) * 10);
    },
    120_000
  );
});
