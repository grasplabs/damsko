// Markdown against the specifications it reads, example by example: every example of the
// CommonMark Spec 0.31.2 (scripts/fixtures/commonmark-spec.json) and GitHub Flavored Markdown's own,
// the GFM Spec's extensions and cmark-gfm's extensions test (scripts/fixtures/gfm-spec.json).
//   - Read: an answer, finished, is read into the same tree as the parser alone reads it
//     (mdast-util-from-markdown with GFM), every place the same, unless Markdown means otherwise.
//   - Drawn: what Markdown draws (on the server) is what the spec draws, element for element and
//     word for word, unless one of Markdown's own rules says otherwise: a link leads only to http,
//     https or mailto, a picture is its words, raw HTML is its text, a fifth or sixth heading is
//     drawn as the fourth. Each example that differs is put down to the rule that makes it differ,
//     and its drawing is checked: against the spec drawn by that rule, or against the parser's
//     tree drawn by Markdown's rules, written out in this test apart from Markdown. Any other
//     difference is a bug.
// The counts are the docs page's "How it is tested" (docs/components/markdown.mdx), held to it here.
//
//   pnpm exec vp test scripts/markdown-conformance.test.tsx
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import * as stylex from "@stylexjs/stylex";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { Markdown } from "../src/components/markdown/index.ts";
import {
  bounded,
  encodedUrl,
  parseMarkdown,
} from "../src/components/markdown/parse.ts";
import { visuallyHidden } from "../src/lib/styles.ts";
import { safeHref } from "../src/lib/utils.ts";
import { isRecord, readJson } from "./json.ts";

/** One example: its set, number and section, its Markdown, and the HTML its spec draws. */
interface Example {
  set: string;
  example: number;
  section: string;
  markdown: string;
  html: string;
}

/** The examples a fixture holds. */
const examplesIn = (file: string): Example[] => {
  const value = readJson(fileURLToPath(new URL(file, import.meta.url)));
  const list = isRecord(value) ? value.examples : undefined;
  return (Array.isArray(list) ? list : []).flatMap((item: unknown) =>
    isRecord(item) &&
    typeof item.example === "number" &&
    typeof item.section === "string" &&
    typeof item.markdown === "string" &&
    typeof item.html === "string"
      ? [
          {
            set: typeof item.set === "string" ? item.set : "commonmark",
            example: item.example,
            section: item.section,
            markdown: item.markdown,
            html: item.html,
          },
        ]
      : []
  );
};

const commonmark = examplesIn("fixtures/commonmark-spec.json");
const github = examplesIn("fixtures/gfm-spec.json");

/** The tree the parser alone reads, with GitHub's additions or without. */
const plain = (source: string, withGfm = true) =>
  withGfm
    ? fromMarkdown(source, {
        extensions: [gfm()],
        mdastExtensions: [gfmFromMarkdown()],
      })
    : fromMarkdown(source);

// ---- HTML, read as elements ----------------------------------------------------------------------

/** An element of drawn HTML, or its text. */
interface Element {
  tag: string;
  attributes: Map<string, string>;
  children: (Element | string)[];
}

const VOID = new Set(["br", "hr", "img", "input"]);
const ENTITIES = new Map([
  ["amp", "&"],
  ["lt", "<"],
  ["gt", ">"],
  ["quot", '"'],
  ["apos", "'"],
  ["nbsp", " "],
]);

/** HTML's text with its character references read. */
const decoded = (text: string) =>
  text.replaceAll(
    /&(?<name>#x[\da-f]+|#\d+|[a-z]+);/giu,
    (whole, name: string) => {
      if (name.startsWith("#x") || name.startsWith("#X")) {
        return String.fromCodePoint(Number.parseInt(name.slice(2), 16));
      }
      if (name.startsWith("#")) {
        return String.fromCodePoint(Number(name.slice(1)));
      }
      return ENTITIES.get(name) ?? whole;
    }
  );

/** Drawn HTML as elements: what React and the spec write is well formed, so tags and text will do. */
const elementsOf = (html: string): Element => {
  const root: Element = { tag: "#root", attributes: new Map(), children: [] };
  const open = [root];
  for (const match of html.matchAll(
    /<(?<close>\/?)(?<tag>[a-zA-Z][\w-]*)(?<attributes>(?:\s+[\w:-]+(?:="[^"]*")?)*)\s*(?<self>\/?)>|(?<text>[^<]+|<)/gu
  )) {
    const top = open.at(-1) ?? root;
    const { close, tag = "", attributes = "", self, text } = match.groups ?? {};
    if (text !== undefined) {
      top.children.push(decoded(text));
    } else if (close === "/") {
      const at = open.findLastIndex((element) => element.tag === tag);
      open.length = at > 0 ? at : open.length;
    } else {
      const element: Element = {
        tag: tag.toLowerCase(),
        attributes: new Map(
          Array.from(
            attributes.matchAll(/(?<name>[\w:-]+)(?:="(?<value>[^"]*)")?/gu),
            (found) => [
              found.groups?.name ?? "",
              decoded(found.groups?.value ?? ""),
            ]
          )
        ),
        children: [],
      };
      top.children.push(element);
      if (!VOID.has(element.tag) && self !== "/") {
        open.push(element);
      }
    }
  }
  return root;
};

const textOf = (node: Element | string): string =>
  typeof node === "string" ? node : node.children.map(textOf).join("");

const firstOf = (node: Element, tag: string): Element | undefined => {
  for (const child of node.children) {
    if (typeof child !== "string") {
      const found = child.tag === tag ? child : firstOf(child, tag);
      if (found !== undefined) {
        return found;
      }
    }
  }
  return undefined;
};

// ---- Both drawings, as one outline ---------------------------------------------------------------

/** An element of the outline both drawings are brought to: its name, what tells it apart, its children. */
interface Part {
  tag: string;
  about?: string;
  children: (Part | string)[];
}

/** An address as a browser follows it, its escapes read, to compare. */
const addressOf = (href: string) => {
  try {
    return decodeURI(new URL(href).href);
  } catch {
    return href;
  }
};

const linkOf = (
  href: string,
  title: string | undefined,
  children: (Part | string)[]
): Part => ({
  tag: "a",
  about: `${addressOf(href)}${title === undefined || title === "" ? "" : ` "${title}"`}`,
  children,
});

const BLOCKS =
  "p|h\\d|ul|ol|li|blockquote|hr|table|thead|tbody|tr|th|td|notes|task|code-block";
const AROUND_BLOCKS = new RegExp(`\\s*(</?(?:${BLOCKS})\\b[^>]*>)\\s*`, "gu");

/** The outline as a line of text: tags round words, every run of spaces one, none round a block. */
const written = (parts: (Part | string)[]): string =>
  parts
    .map((part) => {
      if (typeof part === "string") {
        return part.replaceAll(/\s+/gu, " ");
      }
      const about = part.about === undefined ? "" : ` ${part.about}`;
      const [code] = part.children;
      const inner =
        part.tag === "code-block" && typeof code === "string"
          ? JSON.stringify(code.replace(/\n+$/u, ""))
          : written(part.children);
      return `<${part.tag}${about}>${inner}</${part.tag}>`;
    })
    .join("")
    .replaceAll(AROUND_BLOCKS, "$1")
    .replaceAll(/<\/br>\s+/gu, "</br>")
    .trim();

/** In an item, its words are a paragraph, as Markdown draws a tight item's (a task's box apart). */
const asParagraphs = (parts: (Part | string)[]): (Part | string)[] => {
  const out: (Part | string)[] = [];
  let words: (Part | string)[] = [];
  const flush = () => {
    if (words.some((part) => typeof part !== "string" || part.trim() !== "")) {
      out.push({ tag: "p", children: words });
    }
    words = [];
  };
  for (const part of parts) {
    if (typeof part !== "string" && part.tag === "task") {
      out.push(part);
    } else if (
      typeof part !== "string" &&
      new RegExp(`^(?:${BLOCKS})$`, "u").test(part.tag)
    ) {
      flush();
      out.push(part);
    } else {
      words.push(part);
    }
  }
  flush();
  return out;
};

/** Which of Markdown's rules to draw the spec's HTML by: links and pictures as Markdown has them, headings past h4. */
interface Rules {
  links: boolean;
  pictures: boolean;
  headings: boolean;
}

const NO_RULES: Rules = { links: false, pictures: false, headings: false };

type Parts = (Part | string)[];

/** An ordered list's start, unless it is 1. */
const startOf = (node: Element) => {
  const start = node.attributes.get("start");
  return start === undefined || start === "1" ? undefined : start;
};

/** How the spec's elements become the outline, by tag; any other is itself. */
const SPEC: Record<
  string,
  (
    node: Element,
    rules: Rules,
    draw: (node: Element | string) => Parts
  ) => Parts
> = {
  "#root": (node, _, draw) => node.children.flatMap(draw),
  sup: (node, _, draw) => node.children.flatMap(draw),
  pre: (node) => {
    const code = firstOf(node, "code");
    const language = (code?.attributes.get("class") ?? "").replace(
      /^language-/u,
      ""
    );
    return [
      {
        tag: "code-block",
        about: language === "" ? undefined : language,
        children: [textOf(code ?? node)],
      },
    ];
  },
  li: (node, _, draw) => [
    { tag: "li", children: asParagraphs(node.children.flatMap(draw)) },
  ],
  input: (node) => [
    {
      tag: "task",
      about: node.attributes.has("checked") ? "done" : "open",
      children: [],
    },
  ],
  section: (node, _, draw) => [
    {
      tag: "notes",
      children: (firstOf(node, "ol")?.children ?? []).flatMap(draw),
    },
  ],
  a: (node, rules, draw) => {
    const children = () => node.children.flatMap(draw);
    if (node.attributes.has("data-footnote-ref")) {
      return [{ tag: "note", children: children() }];
    }
    if (
      node.attributes.has("data-footnote-backref") ||
      node.attributes.get("class") === "footnote-backref"
    ) {
      return [];
    }
    const href = node.attributes.get("href") ?? "";
    return rules.links && safeHref(href) === null
      ? children()
      : [linkOf(href, node.attributes.get("title"), children())];
  },
  img: (node, rules) => {
    const src = node.attributes.get("src") ?? "";
    const alt = node.attributes.get("alt") ?? "";
    if (!rules.pictures) {
      return [{ tag: "img", about: addressOf(src), children: [alt] }];
    }
    const href = safeHref(src);
    const words = alt === "" ? (href ?? "") : alt;
    return href === null
      ? [words]
      : [linkOf(href, node.attributes.get("title"), [words])];
  },
  ol: (node, _, draw) => [
    { tag: "ol", about: startOf(node), children: node.children.flatMap(draw) },
  ],
  h5: (node, rules, draw) => [
    {
      tag: rules.headings ? "h4" : node.tag,
      children: node.children.flatMap(draw),
    },
  ],
  h6: (node, rules, draw) => [
    {
      tag: rules.headings ? "h4" : node.tag,
      children: node.children.flatMap(draw),
    },
  ],
};

/** The spec's HTML as the outline; drawn by `rules`, as Markdown draws what they cover. */
const fromSpec = (node: Element | string, rules: Rules): Parts => {
  if (typeof node === "string") {
    return [node];
  }
  const draw = (child: Element | string) => fromSpec(child, rules);
  return (
    SPEC[node.tag]?.(node, rules, draw) ?? [
      { tag: node.tag, children: node.children.flatMap(draw) },
    ]
  );
};

const HIDDEN = stylex.props(visuallyHidden).className ?? "";

/** Whether an element of Markdown's drawing is not part of the outline: icons, buttons, its code block's header. */
const isChrome = (node: Element) =>
  node.attributes.get("aria-hidden") === "true" ||
  node.attributes.get("role") === "tooltip" ||
  node.attributes.get("data-slot") === "code-block-header" ||
  ["svg", "button", "output"].includes(node.tag);

/** A list item's or a note's paragraphs, which Markdown draws as words (a span), as paragraphs. */
const paragraphsOf = (
  children: (Element | string)[],
  draw: (node: Element | string) => Parts
): Parts =>
  children.flatMap((part) =>
    typeof part !== "string" && part.tag === "span"
      ? [{ tag: "p", children: draw(part) }]
      : draw(part)
  );

/** How Markdown's elements become the outline, by tag or slot; any other is itself. */
const OURS: Record<
  string,
  (node: Element, draw: (node: Element | string) => Parts) => Parts
> = {
  "#root": (node, draw) => node.children.flatMap(draw),
  div: (node, draw) => node.children.flatMap(draw),
  span: (node, draw) => node.children.flatMap(draw),
  "code-block": (node) => {
    const code = firstOf(node, "code");
    const language = code?.attributes.get("data-language") ?? "text";
    const lines = (code?.children ?? []).map((line) =>
      textOf(line).replace(/\n$/u, "")
    );
    return [
      {
        tag: "code-block",
        about: language === "text" ? undefined : language,
        children: [lines.join("\n")],
      },
    ];
  },
  separator: () => [{ tag: "hr", children: [] }],
  // A task's box, then the item's body: its paragraphs drawn as words, and its blocks.
  li: (node, draw) => [
    {
      tag: "li",
      children: node.children.flatMap((child) =>
        typeof child !== "string" && child.tag === "div"
          ? paragraphsOf(child.children, draw)
          : draw(child)
      ),
    },
  ],
  sup: (node) => [{ tag: "note", children: [textOf(node)] }],
  a: (node, draw) => {
    const href = node.attributes.get("href") ?? "";
    return href.includes("-ref-")
      ? []
      : [
          linkOf(
            href,
            node.attributes.get("title"),
            node.children.flatMap(draw)
          ),
        ];
  },
  ol: (node, draw) =>
    node.children.some(
      (child) =>
        typeof child !== "string" &&
        (child.attributes.get("id") ?? "").includes("-fn-")
    )
      ? [
          {
            tag: "notes",
            children: node.children.flatMap((child) =>
              typeof child === "string"
                ? []
                : [
                    {
                      tag: "li",
                      children: asParagraphs(
                        paragraphsOf(child.children, draw)
                      ),
                    },
                  ]
            ),
          },
        ]
      : [
          {
            tag: "ol",
            about: startOf(node),
            children: node.children.flatMap(draw),
          },
        ],
  tbody: (node, draw) =>
    node.children.length === 0
      ? []
      : [{ tag: "tbody", children: node.children.flatMap(draw) }],
};

/** Markdown's own drawing as the outline. */
const fromOurs = (node: Element | string): Parts => {
  if (typeof node === "string") {
    return [node];
  }
  if (node.attributes.get("class") === HIDDEN) {
    // A task's box says what it is only to a screen reader; anything else so said is no word on screen.
    const said = textOf(node);
    return said === "Done" || said === "Not done"
      ? [
          {
            tag: "task",
            about: said === "Done" ? "done" : "open",
            children: [],
          },
        ]
      : [];
  }
  if (isChrome(node)) {
    return [];
  }
  const draw = OURS[node.attributes.get("data-slot") ?? ""] ?? OURS[node.tag];
  return (
    draw?.(node, fromOurs) ?? [
      { tag: node.tag, children: node.children.flatMap(fromOurs) },
    ]
  );
};

// ---- What tells an example apart ----------------------------------------------------------------

/** A node of the parser's tree, as far as telling an example apart reads it. */
interface Tree {
  type: string;
  value?: string;
  url?: string;
  depth?: number;
  children?: Tree[];
}

/** The kinds of node in an example's tree that one of Markdown's rules draws its own way. */
const kindsIn = (tree: Tree) => {
  const kinds = {
    html: new Array<string>(),
    links: false,
    pictures: false,
    headings: false,
  };
  const visit = (node: Tree) => {
    if (node.type === "html") {
      kinds.html.push(node.value ?? "");
    }
    kinds.pictures ||= node.type === "image" || node.type === "imageReference";
    kinds.links ||=
      (node.type === "link" || node.type === "definition") &&
      safeHref(node.url) === null;
    kinds.headings ||= node.type === "heading" && (node.depth ?? 0) > 4;
    for (const child of node.children ?? []) {
      visit(child);
    }
  };
  visit(tree);
  return kinds;
};

/** A node of the parser's tree, as far as drawing it by Markdown's rules reads it. */
interface Drawn {
  type: string;
  value?: string;
  url?: string;
  title?: string | null;
  alt?: string | null;
  depth?: number;
  lang?: string | null;
  ordered?: boolean | null;
  start?: number | null;
  checked?: boolean | null;
  identifier?: string;
  children?: Drawn[];
}

/** The elements of a phrase, by the tree's name for each. */
const PHRASES = new Map([
  ["emphasis", "em"],
  ["strong", "strong"],
  ["delete", "del"],
  ["inlineCode", "code"],
  ["break", "br"],
]);

/** What the tree refers to: link targets, notes, and the notes in the order they are first referred to. */
const referredIn = (root: Drawn) => {
  const definitions = new Map<string, Drawn>();
  const notes = new Map<string, Drawn>();
  const order: string[] = [];
  const gather = (node: Drawn) => {
    const id = node.identifier ?? "";
    if (node.type === "definition") {
      definitions.set(id, node);
    } else if (node.type === "footnoteDefinition") {
      notes.set(id, node);
    } else if (node.type === "footnoteReference" && !order.includes(id)) {
      order.push(id);
    }
    for (const child of node.children ?? []) {
      gather(child);
    }
  };
  gather(root);
  return { definitions, notes, numbered: order.filter((id) => notes.has(id)) };
};

/**
 * The parser's tree drawn as the outline by Markdown's rules, written out apart from Markdown: a
 * link leads only to http, https or mailto, its address encoded as CommonMark has it; a picture is
 * its alt words, a link to it where it may lead; raw HTML is its text; a fifth or sixth heading is
 * a fourth; a short row has empty cells to the head's count; the notes stand at the foot, in the
 * order they are first referred to.
 */
const fromTree = (root: Drawn): string => {
  const { definitions, notes, numbered } = referredIn(root);
  const target = (node: Drawn) =>
    node.type.endsWith("Reference")
      ? definitions.get(node.identifier ?? "")
      : node;
  const hrefOf = (node: Drawn) => {
    const url = target(node)?.url;
    return url === undefined ? null : safeHref(encodedUrl(url));
  };
  const draw = (node: Drawn, inLink = false): (Part | string)[] => {
    const inner = () =>
      (node.children ?? []).flatMap((child) =>
        draw(child, inLink || node.type.startsWith("link"))
      );
    const href = hrefOf(node);
    const title = target(node)?.title ?? undefined;
    if (node.type === "link" || node.type === "linkReference") {
      return href === null ? inner() : [linkOf(href, title, inner())];
    }
    if (node.type === "image" || node.type === "imageReference") {
      const alt = node.alt ?? "";
      const words = alt === "" ? (href ?? "") : alt;
      return href === null || inLink ? [words] : [linkOf(href, title, [words])];
    }
    if (node.type === "footnoteReference") {
      const number = numbered.indexOf(node.identifier ?? "") + 1;
      return [{ tag: "note", children: [String(number)] }];
    }
    const tag = PHRASES.get(node.type);
    if (tag === undefined) {
      return [node.value ?? ""];
    }
    return [
      {
        tag,
        children: node.children === undefined ? [node.value ?? ""] : inner(),
      },
    ];
  };
  const phrases = (node: Drawn) =>
    (node.children ?? []).flatMap((child) => draw(child));
  const row = (each: Drawn, tag: string, columns: number): Part => ({
    tag: "tr",
    children: Array.from({ length: columns }, (_, column) => ({
      tag,
      children: phrases(each.children?.[column] ?? { type: "tableCell" }),
    })),
  });
  const drawers: Record<
    string,
    (
      node: Drawn,
      blocks: (node: Drawn) => (Part | string)[]
    ) => (Part | string)[]
  > = {
    paragraph: (node) => [{ tag: "p", children: phrases(node) }],
    html: (node) => [{ tag: "p", children: [node.value ?? ""] }],
    heading: (node) => [
      { tag: `h${Math.min(node.depth ?? 1, 4)}`, children: phrases(node) },
    ],
    thematicBreak: () => [{ tag: "hr", children: [] }],
    definition: () => [],
    footnoteDefinition: () => [],
    code: (node) => {
      const language = node.lang ?? "text";
      return [
        {
          tag: "code-block",
          about: language === "text" ? undefined : language,
          children: [node.value ?? ""],
        },
      ];
    },
    list: (node, inner) => {
      const start = node.ordered === true ? (node.start ?? 1) : 1;
      return [
        {
          tag: node.ordered === true ? "ol" : "ul",
          about: start === 1 ? undefined : String(start),
          children: inner(node),
        },
      ];
    },
    listItem: (node, inner) => {
      const box: Part[] =
        typeof node.checked === "boolean"
          ? [
              {
                tag: "task",
                about: node.checked ? "done" : "open",
                children: [],
              },
            ]
          : [];
      return [{ tag: "li", children: [...box, ...inner(node)] }];
    },
    table: (node) => {
      const [head, ...rows] = node.children ?? [];
      const columns = head?.children?.length ?? 0;
      const body: Part[] =
        rows.length === 0
          ? []
          : [
              {
                tag: "tbody",
                children: rows.map((each) => row(each, "td", columns)),
              },
            ];
      return [
        {
          tag: "table",
          children: [
            {
              tag: "thead",
              children: head === undefined ? [] : [row(head, "th", columns)],
            },
            ...body,
          ],
        },
      ];
    },
  };
  const blocks = (node: Drawn): (Part | string)[] =>
    (node.children ?? []).flatMap(
      (child) =>
        drawers[child.type]?.(child, blocks) ?? [
          { tag: child.type, children: blocks(child) },
        ]
    );
  const foot: Part[] =
    numbered.length === 0
      ? []
      : [
          {
            tag: "notes",
            children: numbered.map((id) => ({
              tag: "li",
              children: blocks(notes.get(id) ?? { type: "none" }),
            })),
          },
        ];
  return written([...blocks(root), ...foot]);
};

/** What cmark-gfm draws that GitHub's parser for the web, micromark, reads otherwise, by example. */
const READ_OTHERWISE = new Map([
  [
    "extensions 19",
    "`mailto:` and `xmpp:` written bare: micromark links the address after them only",
  ],
  [
    "extensions 20",
    "the extensions test gives no HTML for it, only that it must not crash",
  ],
]);

/** How Markdown reads and draws an example, against its spec. */
const verdictOf = ({ set, example, markdown, html }: Example) => {
  const tree = JSON.stringify(parseMarkdown(bounded(markdown)));
  let read = tree === JSON.stringify(plain(markdown)) ? "same" : "bug";
  if (read === "bug" && bounded(markdown) !== markdown) {
    read = "greater than";
  } else if (
    read === "bug" &&
    tree ===
      JSON.stringify(
        fromMarkdown(markdown, {
          extensions: [gfm({ singleTilde: false })],
          mdastExtensions: [gfmFromMarkdown()],
        })
      )
  ) {
    read = "one tilde";
  }
  const spec = elementsOf(html);
  const drawing = elementsOf(
    renderToStaticMarkup(<Markdown>{markdown}</Markdown>)
  );
  const ours = written(fromOurs(drawing));
  if (written(fromSpec(spec, NO_RULES)) === ours) {
    return { read, drawn: "same" };
  }
  const kinds = kindsIn(plain(markdown));
  const rules = {
    links: true,
    pictures: kinds.pictures,
    headings: kinds.headings,
  };
  let drawn = "bug";
  if (written(fromSpec(spec, rules)) === ours) {
    drawn = "links";
    if (kinds.pictures) {
      drawn = "pictures";
    } else if (kinds.headings) {
      drawn = "headings";
    }
  } else if (fromTree(parseMarkdown(bounded(markdown))) !== ours) {
    // Every other class is drawn by Markdown's rules from the tree Markdown reads: checked so.
    drawn = "bug";
  } else if (kinds.html.length > 0) {
    drawn = "html";
  } else if (
    set === "commonmark" &&
    JSON.stringify(plain(markdown, false)) !== JSON.stringify(plain(markdown))
  ) {
    drawn = "bare links";
  } else if (read === "one tilde") {
    drawn = "one tilde";
  } else if (READ_OTHERWISE.has(`${set} ${example}`)) {
    drawn = "read otherwise";
  }
  return { read, drawn };
};

/** How many examples of `examples` each verdict has, and those that are bugs. */
const tally = (examples: Example[]) => {
  const read: Record<string, number> = {};
  const drawn: Record<string, number> = {};
  const bugs: string[] = [];
  for (const each of examples) {
    const verdict = verdictOf(each);
    read[verdict.read] = (read[verdict.read] ?? 0) + 1;
    drawn[verdict.drawn] = (drawn[verdict.drawn] ?? 0) + 1;
    if (verdict.read === "bug" || verdict.drawn === "bug") {
      bugs.push(
        `${each.set} ${each.example} (${each.section}): ${JSON.stringify(each.markdown)}`
      );
    }
  }
  return { read, drawn, bugs };
};

const page = readFileSync(
  new URL("../docs/components/markdown.mdx", import.meta.url),
  "utf-8"
);

/**
 * How long a test that draws hundreds of examples may run, in milliseconds: a second or two of this
 * process's time on the processor, which a machine busy with others can make many times as long by
 * the clock.
 */
const SLOW_TEST = 120_000;

describe("the specifications, example by example", () => {
  test(
    "CommonMark 0.31.2: every example read as the parser reads it, drawn as the spec draws it or by Markdown's own rules",
    () => {
      const { read, drawn, bugs } = tally(commonmark);
      expect(bugs).toStrictEqual([]);
      expect(read).toStrictEqual({ same: 652 });
      expect(drawn).toStrictEqual({
        same: 462,
        links: 96,
        pictures: 22,
        html: 65,
        headings: 2,
        "bare links": 5,
      });
      expect(page).toContain(
        `"${commonmark.length} examples. Read: all ${read.same} as the parser alone reads them. Drawn: ${drawn.same} as the spec draws them; ${drawn.links} links to other than http, https or mailto as their words; ${drawn.pictures} pictures as their words; ${drawn.html} with raw HTML, shown as its text; ${drawn.headings} fifth or sixth headings as fourth ones; ${drawn["bare links"]} bare web or mail addresses linked, as GitHub links them"`
      );
    },
    SLOW_TEST
  );

  test(
    "GitHub Flavored Markdown: every extension example read and drawn as GitHub has it, or by Markdown's own rules",
    () => {
      const { read, drawn, bugs } = tally(github);
      expect(bugs).toStrictEqual([]);
      expect(read).toStrictEqual({ same: 52, "one tilde": 2 });
      expect(drawn).toStrictEqual({
        same: 46,
        links: 1,
        html: 3,
        "one tilde": 2,
        "read otherwise": 2,
      });
      expect(page).toContain(
        `"${github.length} examples. Read: ${read.same} as the parser alone reads them, ${read["one tilde"]} with a strike of one tilde read as a tilde. Drawn: ${drawn.same} as cmark-gfm draws them; ${drawn.links} link to ftp as its words; ${drawn.html} with raw HTML, shown as its text; ${drawn["one tilde"]} with a tilde for a strike; ${drawn["read otherwise"]} that micromark reads otherwise than cmark-gfm or that have no HTML"`
      );
    },
    SLOW_TEST
  );
});
