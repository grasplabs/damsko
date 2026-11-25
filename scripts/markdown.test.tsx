// Markdown through its interface, drawn on the server. The parse is micromark's, so what is ours is
// held here: the cut into blocks reads every CommonMark and GFM example as the whole parse does,
// and each kind of node draws its part; no address still being written, or unsafe, is ever handed
// on; and time and size grow in step with the answer, hostile ones too. Streaming in a DOM:
// markdown-stream.test.tsx.
//
//   pnpm exec vp test scripts/markdown.test.tsx
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import {
  Markdown,
  MarkdownLinkProvider,
  parseMarkdown,
} from "../src/components/markdown/index.ts";
import type {
  MarkdownComponents,
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
const answers = fixture("fixtures/markdown-answers.json", "answers", "lines");
const specs = [
  ...fixture("fixtures/commonmark-spec.json", "examples", "markdown"),
  ...fixture("fixtures/gfm-spec.json", "examples", "markdown"),
];

const draw = (source: string, props: Partial<MarkdownProps> = {}) =>
  renderToStaticMarkup(<Markdown {...props}>{source}</Markdown>);

const count = (html: string, pattern: string) =>
  html.match(new RegExp(pattern, "gu"))?.length ?? 0;
/** What the HTML says, its tags dropped. */
const textOf = (html: string) => html.replaceAll(/<[^>]*>/gu, "");

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

/** A note's mark is a number up high, leading to its note; the note an item at the foot, each of its paragraphs leading back. */
const notePartsOf = (
  node: Tree,
  inLink: boolean,
  defined: Map<string, string>
): [string, number][] => {
  if (node.type === "footnoteReference" && defined.has(`^${node.identifier}`)) {
    return [
      ["<sup", 1],
      ["<a\\b", inLink ? 0 : 1],
    ];
  }
  if (node.type === "footnoteDefinition") {
    const paragraphs = node.children.filter((kid) => kid.type === "paragraph");
    const marks = Number(defined.get(`^${node.identifier}`) ?? 0);
    // `↩`, `↩²`, `↩³`: a way back per mark, after each paragraph.
    const each = Math.max(paragraphs.length, 1);
    return [
      ["<li", 1],
      ["<a\\b", each * marks],
      ["<sup", each * Math.max(marks - 1, 0)],
    ];
  }
  return [];
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
  const parts = notePartsOf(node, inLink, defined);
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
    parts.push([`<h${node.depth}\\b`, 1]);
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
      // Each block is read with the names the whole answer defines (parse.ts, `Names`).
      const nodes = allNodes(parseMarkdown(source).children);
      const of = (type: string) =>
        nodes.flatMap((node) =>
          node.type === type && "identifier" in node ? [node.identifier] : []
        );
      const names = {
        links: new Set(of("definition")),
        notes: new Set(of("footnoteDefinition")),
      };
      const { starts } = parse.blockStarts(source);
      const blocks = starts.flatMap((start, at) =>
        parse.readBlock(source.slice(start, starts[at + 1]), { names })
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
      // Each note's marks outside the notes, each a way back from the note.
      const outside = tree.children.filter(
        (node) => node.type !== "footnoteDefinition"
      );
      const marks = new Map<string, number>();
      for (const node of allNodes(outside)) {
        if (node.type === "footnoteReference") {
          marks.set(node.identifier, (marks.get(node.identifier) ?? 0) + 1);
        }
      }
      for (const node of allNodes(tree.children)) {
        if (node.type === "footnoteDefinition" && marks.has(node.identifier)) {
          defined.set(
            `^${node.identifier}`,
            String(marks.get(node.identifier))
          );
        }
      }
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
      // A note no mark refers to is not drawn.
      for (const node of tree.children) {
        if (
          node.type !== "footnoteDefinition" ||
          defined.has(`^${node.identifier}`)
        ) {
          walk(node, "block", false);
        }
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
  "Marks[^b] in [a link[^a]](https://example.com/l) and[^b].\n\n[^a]: A at https://example.com/bare\n\n[^b]: B.",
  "Not yet[^later] defined, then[^none].\n\n[^later]: Here.",
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
  // A definition counts once finished: its address and title can no longer change.
  "See [a] and ![pic][a].\n\n[a]:\nhttps://example.com/long/path",
  'See [a] and ![pic][a].\n\n[a]:\nhttps://example.com/titled/path\n"The title"',
  "See [a] and ![pic][a].\n\n[a]:\n<https://example.com/angle/path>",
  "> See [a] and ![pic][a].\n>\n> [a]:\n> https://example.com/quoted/path",
  "- See [a] and ![pic][a].\n\n- [a]:\n  https://example.com/listed/path",
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
          // A caller's `a` and `img` draw an anchor, as Markdown's own Link does.
          const components: MarkdownComponents = {
            a: ({ href, children }) => <a href={href}>{children}</a>,
            img: ({ src }) => <a href={src}>picture</a>,
          };
          const html = [take, undefined].map((renderLink) =>
            renderToStaticMarkup(
              <MarkdownLinkProvider renderLink={take}>
                <Markdown
                  renderLink={renderLink}
                  components={renderLink ? undefined : components}
                  {...props}
                >
                  {text.slice(0, at)}
                </Markdown>
              </MarkdownLinkProvider>
            )
          );
          const anchors = [
            ...html.join("").matchAll(/<a [^>]*href="(?<href>[^"]*)"/gu),
          ];
          const drawn = anchors.map((found) =>
            (found.groups?.href ?? "").replaceAll("&amp;", "&")
          );
          // A note's mark and its way back lead to an element there is.
          const ids = new Set(
            [...html.join("").matchAll(/ id="(?<id>[^"]*)"/gu)].map(
              (found) => `#${found.groups?.id ?? ""}`
            )
          );
          for (const href of [
            ...handed.filter((url) => !written.has(url)),
            ...drawn.filter((url) =>
              url.startsWith("#") ? !ids.has(url) : !leads.has(url)
            ),
          ]) {
            wrong.push(`${JSON.stringify(text.slice(0, at))} handed ${href}`);
          }
        }
      }
    }
    expect(wrong).toStrictEqual([]);
    expect(links).toHaveLength(57);
  }, 120_000);
});

/** The kinds of node a block's tree holds. */
const types = (nodes: parse.Block[]) =>
  JSON.stringify(nodes).match(/"type":"\w+"/gu) ?? [];

describe("what an answer may hold besides prose", () => {
  test("a task is Checkbox's box, read only, said as done or not", () => {
    const html = draw("- [x] Gather the comments\n- [ ] Share them\n- Plain");
    expect(count(html, "<li")).toBe(3);
    expect(count(html, "<input")).toBe(0);
    expect(textOf(html)).toBe("DoneGather the commentsNot doneShare themPlain");
  });

  test("notes are numbered by their first mark, listed at the foot, and lead back", () => {
    const source =
      "B[^b], A[^a], B again[^b].\n\n[^a]: Note A.\n\n[^b]: Note B.";
    const html = draw(source);
    expect(textOf(html)).toBe("B1, A2, B again1.Note B. ↩ ↩2Note A. ↩");
    expect(html).toContain('aria-label="Back to reference 1-2"');
    const hrefs = [...html.matchAll(/href="#(?<id>[^"]*)"/gu)].map(
      (found) => found.groups?.id ?? ""
    );
    expect(hrefs).toHaveLength(6);
    for (const id of hrefs) {
      expect(count(html, ` id="${id}"`)).toBe(1);
    }
  });

  test("a mark is as written until its note has come, while written too, as Streamdown draws it", () => {
    const source = "First[^x] and[^y].\n\n[^y]: Why.\n";
    expect(textOf(draw(source.slice(0, 19), { streaming: true }))).toBe(
      "First[^x] and[^y]."
    );
    expect(textOf(draw(source, { streaming: true }))).toBe(
      "First[^x] and1.Why. ↩"
    );
    expect(textOf(draw(source))).toBe("First[^x] and1.Why. ↩");
  });

  test("a caller's elements draw in Markdown's place, given the element's props and the node", () => {
    const html = draw(
      'See [the guide](https://example.com/guide "Guide"), `x`, ![c](https://e.com/c.png).\n\n```ts\nconst a = 1;\n```',
      {
        components: {
          a: ({ href, title, children, node }) => (
            <i data-href={href} data-title={title} data-node={node.type}>
              {children}
            </i>
          ),
          img: ({ src, alt }) => <img src={src} alt={alt} />,
          code: ({ className, children, node }) => (
            <kbd data-class={className} data-node={node.type}>
              {children}
            </kbd>
          ),
          p: ({ children }) => <section>{children}</section>,
        },
      }
    );
    expect(html).toContain(
      '<section>See <i data-href="https://example.com/guide" data-title="Guide" data-node="link">the guide</i>, <kbd data-node="inlineCode">x</kbd>, <img src="https://e.com/c.png" alt="c"/>.</section>'
    );
    expect(html).toContain(
      '<kbd data-class="language-ts" data-node="code">const a = 1;</kbd>'
    );
  });

  test("while written, each whole word fades in, and each character where words have no spaces; the word at the end waits", () => {
    const html = draw("你好 world and more", { streaming: true });
    expect(count(html, "<span")).toBe(4);
    expect(textOf(html)).toBe("你好 world and");
    expect(
      count(draw("你好 world and more ", { streaming: true }), "<span")
    ).toBe(5);
    // Each character where words have no spaces is a word of its own, so none waits.
    expect(textOf(draw("world 你好", { streaming: true }))).toBe("world 你好");
  });

  test("soft breaks: a single newline is a line break when asked, a space otherwise", () => {
    expect(count(draw("One\nTwo"), "<br")).toBe(0);
    expect(count(draw("One\nTwo\nThree", { softBreaks: true }), "<br")).toBe(2);
  });

  test("a section folds: <details> with a <summary> line, nested; any other HTML stays text", () => {
    const html = draw(
      "<details>\n<summary>Outer **one**</summary>\n\nWords.\n\n<details open>\n<summary>Inner</summary>\n\nMore.\n\n</details>\n\n</details>\n\n<div>Other</div>\n\n<details>\n<summary>Never closed</summary>\n\nText."
    );
    expect(count(html, 'data-slot="markdown-section"')).toBe(2);
    expect(html).toMatch(/<strong[^>]*>one<\/strong>/u);
    expect(textOf(html)).toContain("&lt;div&gt;Other&lt;/div&gt;");
    expect(textOf(html)).toContain(
      "&lt;summary&gt;Never closed&lt;/summary&gt;"
    );
  });

  test("sections nest 32 deep, and deeper is words", () => {
    const source = `${"<details>\n<summary>s</summary>\n\n".repeat(40)}x\n\n${"</details>\n\n".repeat(40)}`;
    const html = draw(source);
    expect(count(html, 'data-slot="markdown-section"')).toBe(32);
    expect(textOf(html)).toContain("&lt;details&gt;");
  });
});

describe("while it is written, nothing shows that the whole answer will not", () => {
  test("a list item starting with a bracket under a line is never a heading for a moment", () => {
    for (const marker of ["-", "*", "+", "1.", "1)"]) {
      for (const end of ["[", "[ ", "[x", "[ ]", "[x] "]) {
        const html = draw(`Tasks:\n${marker} ${end}`, { streaming: true });
        expect(count(html, "<h\\d")).toBe(0);
      }
    }
  });

  test("a tag still open shows its words, as the whole answer does", () => {
    // Each ends in a space: the word still being written waits for it.
    for (const source of [
      "Hello <div class=x and more words ",
      "<span title=x y ",
    ]) {
      const words = textOf(draw(source, { streaming: true }));
      expect(words.trim()).toBe(textOf(draw(source)).trim());
    }
  });

  test("a mark of emphasis or code at the very end, and a closing fence half typed, wait", () => {
    for (const mark of ["**", "*", "`", "~~", "__", "_"]) {
      const html = draw(`The cost is ${mark}`, { streaming: true });
      expect(textOf(html).trim()).toBe("The cost is");
    }
    const code = draw("```js\nconst a = 1;\n``", { streaming: true });
    expect(code).toContain("const a = 1;");
    expect(code).not.toContain("``");
  });

  test("a line that is only the start of a block's mark waits for what decides it", () => {
    const cases = [
      ["1. one\n2", "one"],
      ["Tasks:\n-", "Tasks:"],
      ["Tasks:\n- [", "Tasks:"],
      ["Done.\n\n--", "Done."],
      ["Done.\n\n<", "Done."],
      ["Done.\n\n</det", "Done."],
      ["Summary\n=", "Summary"],
      ["Para\n#", "Para"],
      ["See [the docs] ", "See the docs"],
    ];
    const drawn = cases.map(([source = ""]) => {
      const html = draw(source, { streaming: true });
      return [source, textOf(html).trim(), count(html, "<h\\d")];
    });
    expect(drawn).toStrictEqual(
      cases.map(([source, words]) => [source, words, 0])
    );
  });

  test("no mark of emphasis shows at any prefix, a link being written after it too", () => {
    const text = answers.find(({ name }) => name === "export")?.text ?? "";
    const wrong: string[] = [];
    for (let at = 1; at <= text.length; at += 1) {
      const html = draw(text.slice(0, at), { streaming: true });
      const words = textOf(html.replaceAll(/<code[^>]*>[^]*?<\/code>/gu, ""));
      if (/[*~_]/u.test(words)) {
        wrong.push(text.slice(Math.max(0, at - 30), at));
      }
    }
    expect(wrong).toStrictEqual([]);
    expect(text.length).toBeGreaterThan(1000);
  });

  test("a block read alone knows the answer's names: links and notes defined elsewhere", () => {
    const names = { links: new Set(["the guide"]), notes: new Set(["1"]) };
    const told = parse.readBlock("See [the guide] and a mark[^1].", {
      names,
    });
    expect(types(told)).toContain('"type":"linkReference"');
    expect(types(told)).toContain('"type":"footnoteReference"');
    const alone = parse.readBlock("A mark[^2].");
    expect(types(alone)).not.toContain('"type":"footnoteReference"');
  });

  test("a link's definition still being written is never a link", () => {
    const source =
      'See [the guide][ref].\n\n[ref]: https://example.com/guide "The guide"';
    for (let at = 1; at < source.length; at += 1) {
      const handed: string[] = [];
      const html = draw(source.slice(0, at), {
        streaming: true,
        renderLink: (link) => {
          handed.push(link.href);
        },
      });
      expect([handed, count(html, "<a\\b")]).toStrictEqual([[], 0]);
    }
  });
});

describe("bounds a model's answer cannot pass", () => {
  test("fenced code's marks are not counted against a paragraph's 1,000", () => {
    const html = draw(`**Bold** words.\n\`\`\`\n${"*_".repeat(1000)}\n\`\`\``);
    expect(count(html, "<strong")).toBe(1);
  });

  test("a link's name may be as long as CommonMark allows", () => {
    const name = "n".repeat(500);
    const html = draw(
      `A [link][${name}].\n\n[${name}]: https://example.com/long`
    );
    expect(html).toContain('href="https://example.com/long"');
  });

  test("lists nest 32 deep, and deeper is drawn 32 deep", () => {
    const source = Array.from(
      { length: 400 },
      (_, depth) => `${"  ".repeat(depth)}- level ${depth + 1}`
    ).join("\n");
    const html = draw(source);
    expect(count(html, "<ul")).toBe(32);
    expect(textOf(html)).toContain("level 400");
  });

  test("a table draws at most 1,000 rows, and says how many more", () => {
    const html = draw(`| a |\n| - |\n${"| x |\n".repeat(1500)}`);
    expect(count(html, "<tr")).toBe(1001);
    expect(textOf(html)).toContain("500 more rows");
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
  "closing brackets": (size) => "a] ".repeat(size / 3),
  "notes and tasks": (size) =>
    `${"- [x] a[^1]\n".repeat(size / 24)}\n[^1]: n\n`,
  "notes' marks and spaces left open": (size) =>
    `${"a[^".repeat(size / 6)}${" ".repeat(size / 2)}`,
  "lists nested 400 deep": (size) =>
    Array.from(
      { length: size / 400 },
      (_, at) => `${"  ".repeat(at % 400)}- a`
    ).join("\n"),
  "sections left open": (size) =>
    "<details>\n<summary>s</summary>\n\nx\n\n".repeat(size / 34),
};

// Each block wraps the one before it in 32 more sections: read first at the top, a block
// is read again 32 deep, and its own sections inside it stop there too.
const wrap = (inner: string) =>
  `${"<details>\n<summary>s</summary>\n\n".repeat(32)}${inner}\n\n${"</details>\n\n".repeat(32)}`.trimEnd();
const deepest = (html: string) => {
  let open = 0;
  let most = 0;
  const stack: boolean[] = [];
  for (const [tag] of html.matchAll(/<div\b[^>]*>|<\/div>/gu)) {
    if (tag === "</div>") {
      open -= Number(stack.pop() === true);
    } else {
      const section = tag.includes('data-slot="markdown-section"');
      stack.push(section);
      open += Number(section);
      most = Math.max(most, open);
    }
  }
  return most;
};

describe("time and size grow in step with the answer", () => {
  test("sections around sections already read stop at 32 deep, at once and without throwing", () => {
    const blocks = [wrap("x")];
    for (let at = 1; at <= 8; at += 1) {
      blocks.push(wrap(blocks.at(-1) ?? ""));
    }
    const source = blocks.join("\n\n");
    const start = performance.now();
    const drawn = [draw(source), draw(source, { streaming: true })];
    expect(performance.now() - start).toBeLessThan(5000);
    expect(drawn.map(deepest)).toStrictEqual([32, 32]);
  }, 120_000);

  test("a long answer of sections around sections streams with no read much slower than the rest", async () => {
    const blocks = [wrap("x")];
    for (let at = 1; at <= 14; at += 1) {
      blocks.push(wrap(blocks.at(-1) ?? ""));
    }
    const source = blocks.join("\n\n");
    const times: number[] = [];
    let most = 0;
    for (let at = 500; at < source.length + 500; at += 500) {
      // Each chunk drawn in a task of its own, as a page draws it.
      // oxlint-disable-next-line no-await-in-loop -- one chunk after another, as they stream
      await sleep(0);
      const start = performance.now();
      const html = draw(source.slice(0, at), { streaming: true });
      times.push(performance.now() - start);
      most = Math.max(most, deepest(html));
    }
    const sorted = times.toSorted((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
    expect(most).toBe(32);
    // The cache cleared whole, every block read again: reads of seven times the median and more.
    expect(sorted.at(-1) ?? 0).toBeLessThan(Math.max(median, 1) * 6);
  }, 600_000);

  test.each(Object.entries(hostile))(
    "%s: nine times the answer, whole and while written, under 27 times the time and 10 times the nodes",
    (_, make) => {
      const cost = (size: number) => {
        let best = Number.POSITIVE_INFINITY;
        let nodes = 0;
        for (let run = 0; run < 5; run += 1) {
          // A new answer each run, so none is read from what was read before.
          const source = `${run}${make(size)}`;
          // Whole, and as the end of an answer still being written.
          const start = performance.now();
          const html = draw(source);
          draw(source, { streaming: true });
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

  // Each a block of its own, marked or linked from a block of its own: every block is read with
  // every name the answer defines, which must cost each block nothing more as the names grow.
  const named = {
    "5,000 notes": [5000, (at: number) => `t[^${at}]\n\n[^${at}]: n`],
    "2,000 link definitions": [
      2000,
      (at: number) => `[x][l${at}]\n\n[l${at}]: https://x.example/${at}`,
    ],
    // About 420 KB, its reads past the cache's bound.
    "2,000 notes of 100 words": [
      2000,
      (at: number) => `t[^${at}]\n\n[^${at}]: ${"*n* ".repeat(50)}`,
    ],
  } as const;

  test.each(Object.entries(named))(
    "%s, whole and streamed, take under 4 times as long as as many blocks of words",
    (_, [blocks, make]) => {
      const answer = (block: (at: number) => string, run: string) =>
        Array.from({ length: blocks }, (__, at) => `${block(at)}${run}`).join(
          "\n\n"
        );
      const words = (at: number) => make(at).replaceAll(/[[\]^:]/gu, "w");
      // Whole, then streamed in 20 chunks, a new answer each time so none is read from before.
      const cost = (block: (at: number) => string) => {
        const start = performance.now();
        const whole = draw(answer(block, "a"));
        const streamed = answer(block, "b");
        let last = "";
        for (let chunk = 1; chunk <= 20; chunk += 1) {
          const at = Math.round((streamed.length * chunk) / 20);
          last = draw(streamed.slice(0, at), { streaming: chunk < 20 });
        }
        return { time: performance.now() - start, html: [whole, last] };
      };
      const plain = cost(words);
      const { time, html } = cost(make);
      // Each mark found its note and each reference its definition, those streamed ahead of
      // their definition too.
      const linked = (one: string) => count(one, '<a href="https://x.example');
      const marks = (one: string) => count(one, "<sup");
      expect(
        html.map((one) => Math.max(linked(one), marks(one)))
      ).toStrictEqual([blocks, blocks]);
      // Each block keyed by every name: 6 times as long for 2,000 link definitions, minutes for
      // 5,000 notes.
      expect(time).toBeLessThan(plain.time * 4);
    },
    600_000
  );

  test("past the cache's bound, a chunk reads again none of the blocks it had read", () => {
    const text = Array.from(
      { length: 2000 },
      (_, at) => `t[^${at}]\n\n[^${at}]: ${"*n* ".repeat(50)}`
    ).join("\n\n");
    // Each emphasis node drawn: a block read again draws new ones.
    const drawn = (source: string) => {
      const nodes = new Set<unknown>();
      const components: MarkdownComponents = {
        em: ({ node, ...props }) => {
          nodes.add(node);
          return <em {...props} />;
        },
      };
      draw(source, { streaming: true, components });
      return nodes;
    };
    const before = drawn(text.slice(0, -2000));
    const after = drawn(text);
    const fresh = [...after].filter((node) => !before.has(node));
    // The ten or so blocks the chunk adds, and the one still being written: 50 each.
    expect(fresh.length).toBeLessThan(1000);
    expect(after.size).toBeGreaterThan(99_000);
  }, 120_000);
});
