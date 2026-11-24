// Markdown: an agent's answer, drawn from micromark's syntax tree (parse.ts) with the system's parts,
// never as HTML. While it streams, a finished block is read and drawn once, keyed by its place so
// it never fades in again; only the block still being written is read again, made whole first, and
// each new word fades in. Written here, a table keeps its even columns and lines break where they
// fill (`greedy`), so nothing drawn moves; fenced code with no place is still coming in.
"use client";

import * as stylex from "@stylexjs/stylex";
import { createContext, Fragment, use, useState } from "react";
import type { ReactNode } from "react";

import { useI18n } from "../../lib/i18n";
import { fadeIn } from "../../lib/styles";
import { colors, font, radius, size, space } from "../../lib/tokens.stylex";
import { safeHref } from "../../lib/utils";
import type { LayoutStyle } from "../../lib/utils";
import * as Code from "../code-block";
import { Link } from "../link";
import { Separator } from "../separator";
import * as Tables from "../table";
import { tableVars } from "../table.stylex";
import * as parse from "./parse";
import type { RootContent } from "./parse";

/** A link in the answer, as the host's renderer sees it. */
export interface MarkdownLink {
  /** The address exactly as the source has it, any scheme. */
  href: string;
  /** The address's scheme in lower case (`javascript`, `https`); empty for none. */
  scheme: string;
  /** The link's title, when the source gives one: `[words](url "title")`. */
  title?: string;
  /** What the link says, drawn as Markdown draws it; for a picture, its alt words. */
  children: ReactNode;
  /** `link` for `[words](url)` and a reference, `autolink` for a bare address, `image` for a picture. */
  type: "link" | "image" | "autolink";
}

/** Draws a link in Markdown's place, or gives undefined to leave it to Markdown. */
export type MarkdownLinkRenderer = (link: MarkdownLink) => ReactNode;

/** Every prop a Markdown takes. */
export interface MarkdownProps {
  /** The Markdown: the agent's answer, or as much of it as has arrived. */
  children: string;
  /** Still being written: a half-written end is drawn whole, each new word fades in. @default false */
  streaming?: boolean;
  /** Cut off part way: the end is made whole as while streaming, so no raw mark shows. @default false */
  truncated?: boolean;
  /** `message` in a chat message; `sm` a card or a panel; `xs` a muted note. @default "default" */
  size?: "default" | "message" | "sm" | "xs";
  /** The outline level of a `#` heading, so the page's outline never skips. @default 1 */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Draws the answer's links and pictures, any scheme, before Markdown's own filter; undefined
   * leaves one to Markdown (http, https, mailto, tel or a path here as a Link, else its words; a
   * picture is never loaded). Never handed an address that is still being written.
   */
  renderLink?: MarkdownLinkRenderer;
  /** Layout only: where it sits and how much room it takes. */
  style?: LayoutStyle;
}
const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: space["4"],
    minWidth: 0,
    fontFamily: font.sans,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    color: colors.bodyForeground,
    whiteSpace: "normal",
    overflowWrap: "anywhere",
  },
  message: {
    fontSize: size.messageText,
    lineHeight: size.messageTextLine,
    [tableVars.text]: size.messageText,
    [tableVars.line]: size.messageTextLine,
  },
  sm: { gap: space["3"], fontSize: font.textSm, lineHeight: font.textSmLine },
  xs: {
    gap: space["2"],
    fontSize: size.messageText,
    lineHeight: size.messageTextLine,
    color: colors.mutedForeground,
  },
  paragraph: { margin: 0, textWrap: "pretty" },
  greedy: { textWrap: "wrap" },
  // A word's fade ends with it: a finished one holds no animation the page keeps weighing.
  word: { animationFillMode: "backwards" },
  heading: {
    margin: 0,
    color: colors.foreground,
    fontWeight: font.weightMedium,
    textWrap: "balance",
  },
  major: { fontSize: font.textLg, lineHeight: font.textLgLine },
  minor: { fontSize: font.textBase, lineHeight: font.textBaseLine },
  smallMajor: { fontSize: font.textBase, lineHeight: font.textBaseLine },
  smallMinor: { fontSize: font.textSm, lineHeight: font.textSmLine },
  xsHeading: { fontSize: size.messageText, lineHeight: size.messageTextLine },
  strong: { fontWeight: font.weightMedium, color: colors.foreground },
  emphasis: { fontStyle: "italic" },
  deleted: {
    textDecorationLine: "line-through",
    color: colors.mutedForeground,
  },
  inlineCode: {
    direction: "ltr",
    unicodeBidi: "isolate",
    paddingInline: space["1"],
    borderRadius: radius.sm,
    cornerShape: radius.shape,
    backgroundColor: colors.codeBg,
    fontFamily: font.mono,
    fontSize: font.textSm,
    color: colors.foreground,
  },
  xsCode: { fontSize: `calc(${size.messageText} * 0.92)` },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: space["1"],
    margin: 0,
    paddingInlineStart: space["6"],
  },
  ordered: { listStyleType: "decimal" },
  unordered: { listStyleType: "disc" },
  item: {
    paddingInlineStart: space["1"],
    "::marker": { color: colors.mutedForeground },
  },
  itemBody: { display: "flex", flexDirection: "column", gap: space["2"] },
  quote: {
    display: "flex",
    flexDirection: "column",
    gap: space["2"],
    margin: 0,
    paddingInlineStart: space["4"],
    borderInlineStartWidth: size.codeBlockBarWidth,
    borderInlineStartStyle: "solid",
    borderInlineStartColor: colors.border,
    color: colors.mutedForeground,
  },
  note: {
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
  },
  raw: {
    direction: "ltr",
    unicodeBidi: "isolate",
    fontFamily: font.mono,
    fontSize: font.textSm,
    color: colors.mutedForeground,
    whiteSpace: "pre-wrap",
  },
});
const Provided = createContext<MarkdownLinkRenderer | null>(null);

/** Draws some of the links of every Markdown inside it (a product's citations, its own scheme). */
export const MarkdownLinkProvider = ({
  renderLink,
  children,
}: {
  /** Draws a link, or gives undefined to leave it to Markdown. */
  renderLink: MarkdownLinkRenderer;
  /** What holds the Markdown. */
  children: ReactNode;
}) => <Provided value={renderLink}>{children}</Provided>;
type Of<T extends RootContent["type"]> = Extract<RootContent, { type: T }>;
type Phrase = Of<"paragraph">["children"][number];
type Row = Of<"table">["children"][number];
type Node = RootContent | Phrase | Of<"list">["children"][number] | Row;
type Linked = Extract<Phrase, { url: string } | { referenceType: unknown }>;
interface Shared {
  provided: MarkdownLinkRenderer | null;
  renderLink?: MarkdownLinkRenderer;
  streaming: boolean;
  size: NonNullable<MarkdownProps["size"]>;
  headingLevel: number;
  greedy: boolean;
  inLink?: boolean;
  phrase?: boolean;
}
const PHRASE = { phrase: true };
type Kids = (nodes: readonly Node[], within?: Partial<Shared>) => ReactNode;
interface Part<T> {
  node: T;
  shared: Shared;
  kids?: Kids;
  name?: string;
  children?: ReactNode;
}

// What changes as the answer grows, read only by the nodes that need it: the link definitions, and
// the last word still being written (a bare address in it may still grow). HTML in a phrase is a
// span, elsewhere a block.
const Definitions = createContext<Of<"definition">[]>([]);
const Tail = createContext("");
// SAFETY: every node a node of the tree holds is a node of the tree.
const kidsOf = (node: Node) =>
  ("children" in node ? node.children : []) as Node[];
const textOf = (node: Node): string =>
  "value" in node ? node.value : kidsOf(node).map(textOf).join("");
const linkOf = (
  node: Linked,
  url: string,
  title: unknown,
  children: ReactNode
) => {
  const text = textOf(node);
  const scheme = /^(?<s>[a-z][a-z\d+.-]*):/iu.exec(
    url.replaceAll(/[\s\p{Cc}]/gu, "")
  );
  const link: MarkdownLink = {
    href: url,
    scheme: scheme?.groups?.s?.toLowerCase() ?? "",
    children,
    type: [text, `http://${text}`, `mailto:${text}`].includes(url)
      ? "autolink"
      : "link",
    ...(typeof title === "string" && { title }),
  };
  if (node.type === "image" || node.type === "imageReference") {
    link.type = "image";
  }
  return link;
};

/**
 * A link or a picture: the host's, else Markdown's own Link where the address may lead, else its
 * words. Never while its address can change: a half picture, a reference not yet defined, a bare
 * address (its words start where it does) in the word still being written; nor inside a link.
 */
const Anchor = ({ node, shared, children }: Part<Linked>): ReactNode => {
  const found =
    "url" in node
      ? node
      : use(Definitions).find((each) => each.identifier === node.identifier);
  const [first] = "children" in node ? node.children : [];
  const bare = first?.position?.start.offset === node.position?.start.offset;
  const growing = bare && use(Tail).includes(textOf(node));
  if (
    found === undefined ||
    found.url === parse.HALF_PICTURE ||
    growing ||
    shared.inLink === true
  ) {
    return children;
  }
  const link = linkOf(node, found.url, found.title, children);
  const drawn = shared.renderLink?.(link);
  const hosted = drawn === undefined ? shared.provided?.(link) : drawn;
  const href = safeHref(found.url, { relative: true });
  if (hosted !== undefined || href === null) {
    return hosted ?? children;
  }
  return (
    <Link href={href} title={link.title} external={/^https?:/u.test(href)}>
      {link.type === "image" && children === "" ? href : children}
    </Link>
  );
};
type Draw<T extends Node["type"]> = (
  node: Extract<Node, { type: T }>,
  shared: Shared,
  kids: Kids
) => ReactNode;

// A table is named by the heading above it; a row draws its own cells, as many as the head's. A
// paragraph in a list item or a note is its words; a note is drawn where it is written.
const TableBlock = ({ node, shared, kids, name }: Part<Of<"table">>) => {
  const words = useI18n().markdown;
  const [written, setWritten] = useState(shared.streaming);
  if (shared.streaming && !written) {
    setWritten(true);
  }
  const [head, ...rows] = node.children;
  const sides = { left: "start", right: "end", center: "center" } as const;
  const align = (head?.children ?? []).map(
    (_, at) => sides[node.align?.[at] ?? "left"]
  );
  const row = (cells: Row | undefined, Cell: typeof Tables.TableCell) =>
    cells?.children.slice(0, align.length).map((cell, at) => (
      <Cell key={at} align={align[at]}>
        {kids?.(cell.children, PHRASE)}
      </Cell>
    ));
  return (
    <Tables.Table aria-label={name ?? words.table} streaming={written}>
      <Tables.TableHeader>
        <Tables.TableRow>{row(head, Tables.TableHead)}</Tables.TableRow>
      </Tables.TableHeader>
      <Tables.TableBody>
        {rows.map((cells, at) => (
          <Tables.TableRow key={at}>
            {row(cells, Tables.TableCell)}
          </Tables.TableRow>
        ))}
      </Tables.TableBody>
    </Tables.Table>
  );
};
const body = (nodes: readonly Node[], kids: Kids) => (
  <div {...stylex.props(styles.itemBody)}>
    {nodes.map((child, at) => (
      <Fragment key={at}>
        {child.type === "paragraph" ? (
          <span>{kids(child.children, PHRASE)}</span>
        ) : (
          kids([child])
        )}
      </Fragment>
    ))}
  </div>
);
const MARKS = {
  strong: ["strong", styles.strong],
  emphasis: ["em", styles.emphasis],
  delete: ["del", styles.deleted],
} as const;
const mark = (
  node: Extract<Phrase, { type: keyof typeof MARKS }>,
  _: Shared,
  kids: Kids
) => {
  const [Tag, look] = MARKS[node.type];
  return <Tag {...stylex.props(look)}>{kids(node.children)}</Tag>;
};
const anchor = (node: Linked, shared: Shared, kids: Kids) => (
  <Anchor node={node} shared={shared}>
    {"children" in node
      ? kids(node.children, { inLink: true })
      : (node.alt ?? "")}
  </Anchor>
);
const headings = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
const headingLooks = {
  default: [styles.major, styles.minor],
  message: [styles.major, styles.minor],
  sm: [styles.smallMajor, styles.smallMinor],
  xs: [styles.xsHeading, styles.xsHeading],
};
const draw: { [T in Node["type"]]?: Draw<T> } = {
  text: (node, shared) =>
    shared.streaming
      ? node.value.match(/\S+\s*|\s+/gu)?.map((word, at) => (
          <span key={at} {...stylex.props(fadeIn, styles.word)}>
            {word}
          </span>
        ))
      : node.value,
  strong: mark,
  emphasis: mark,
  delete: mark,
  inlineCode: (node, shared) => (
    <code
      {...stylex.props(
        styles.inlineCode,
        shared.size === "xs" && styles.xsCode
      )}
    >
      {node.value}
    </code>
  ),
  break: () => <br />,
  link: anchor,
  linkReference: anchor,
  image: anchor,
  imageReference: anchor,
  footnoteDefinition: (node, _, kids) => (
    <div {...stylex.props(styles.note)}>
      {`[^${node.label ?? node.identifier}]`} {body(node.children, kids)}
    </div>
  ),
  html: (node, shared) =>
    shared.phrase === true ? (
      <span {...stylex.props(styles.raw)}>{node.value}</span>
    ) : (
      <p {...stylex.props(styles.paragraph, styles.raw)}>{node.value}</p>
    ),
  paragraph: (node, shared, kids) => (
    <p {...stylex.props(styles.paragraph, shared.greedy && styles.greedy)}>
      {kids(node.children, PHRASE)}
    </p>
  ),
  heading: (node, shared, kids) => {
    // The fifth and sixth depths are drawn and placed as the fourth, from the caller's level on.
    const depth = Math.min(node.depth, 4);
    const Tag =
      headings[Math.min(shared.headingLevel - 1 + depth, 6) - 1] ?? "h6";
    const look = headingLooks[shared.size][depth <= 2 ? 0 : 1];
    return (
      <Tag
        {...stylex.props(styles.heading, look, shared.greedy && styles.greedy)}
      >
        {kids(node.children, PHRASE)}
      </Tag>
    );
  },
  list: (node, _, kids) =>
    node.ordered === true ? (
      <ol
        start={node.start ?? undefined}
        {...stylex.props(styles.list, styles.ordered)}
      >
        {kids(node.children)}
      </ol>
    ) : (
      <ul {...stylex.props(styles.list, styles.unordered)}>
        {kids(node.children)}
      </ul>
    ),
  listItem: (node, _, kids) => (
    <li {...stylex.props(styles.item)}>{body(node.children, kids)}</li>
  ),
  blockquote: (node, _, kids) => (
    <blockquote {...stylex.props(styles.quote)}>
      {kids(node.children)}
    </blockquote>
  ),
  thematicBreak: () => <Separator />,
  code: (node) => (
    <Code.CodeBlock
      language={node.lang ?? "text"}
      streaming={node.position === undefined}
    >
      <Code.CodeBlockHeader>
        <Code.CodeBlockTitle />
        <Code.CodeBlockActions>
          <Code.CodeBlockCopyButton value={node.value} />
        </Code.CodeBlockActions>
      </Code.CodeBlockHeader>
      <Code.CodeBlockContent lineNumbers maxLines={18}>
        {node.value}
      </Code.CodeBlockContent>
    </Code.CodeBlock>
  ),
};
const MarkdownNode = ({ node, shared, name }: Part<Node>): ReactNode => {
  const kids: Kids = (nodes, within) =>
    nodes.map((child, at) => (
      <MarkdownNode
        key={at}
        node={child}
        shared={within ? { ...shared, ...within } : shared}
      />
    ));
  if (node.type === "table") {
    return <TableBlock node={node} shared={shared} kids={kids} name={name} />;
  }
  // SAFETY: each entry of `draw` takes the node of its own type, which `node.type` picks.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- see SAFETY
  const render = draw[node.type] as Draw<Node["type"]> | undefined;
  return render?.(node, shared, kids) ?? null;
};
const useStarts = (source: string) => {
  const [cut, setCut] = useState({ source: "", starts: [0] });
  if (cut.source === source) {
    return cut.starts;
  }
  const starts = parse.blockStarts(
    source,
    source.startsWith(cut.source) ? cut.starts : []
  );
  setCut({ source, starts });
  return starts;
};
const definitionsIn = (nodes: readonly Node[]): Of<"definition">[] =>
  nodes.flatMap((node) =>
    node.type === "definition" ? [node] : definitionsIn(kidsOf(node))
  );
// While written, a table's row waits for its line's end, and its head for its row of dashes.
const HALF_ROW = /(?:^|\n) {0,3}\|[^\n]*$/u;
const HEAD = /(?:^|\n) {0,3}\|[^\n]*\n?$/u;
const DASHES = /^ {0,3}\|?[ \t]*:?-+:?[ \t]*(?:\||$)/mu;
const framed = new Set(["code", "table", "thematicBreak"]);
export const Markdown = ({
  children,
  streaming = false,
  truncated = false,
  size: look = "default",
  headingLevel = 1,
  renderLink,
  style,
}: MarkdownProps) => {
  const provided = use(Provided);
  const [written, setWritten] = useState(streaming);
  if (streaming && !written) {
    setWritten(true);
  }
  // Before anything the answer changes, so a finished block is handed the same as before.
  const shared: Shared = {
    provided,
    renderLink,
    streaming,
    size: look,
    headingLevel,
    greedy: written,
  };
  const source = children.replaceAll(/\r\n?/gu, "\n");
  const cut = useStarts(source);
  const starts = !streaming && parse.definesNames(source) ? [0] : cut;
  const open = streaming || truncated;
  const done = (open ? starts.slice(0, -1) : starts).flatMap((start, at) =>
    parse.readBlock(source.slice(start, starts[at + 1]))
  );
  let end = source.slice(open ? starts.at(-1) : source.length);
  // Cut off, a link still being written goes; a row waits for its line's end, a head for its dashes.
  const bracket = end.lastIndexOf("[");
  end =
    truncated && bracket > end.lastIndexOf("]") ? end.slice(0, bracket) : end;
  const rows = end.replace(HALF_ROW, "");
  const whole = DASHES.test(rows) ? rows : rows.replace(HEAD, "");
  const half = () => (open ? parse.readBlock(whole, true) : []);
  const ending = (streaming ? parse.openCode(end) : null) ?? half();
  const tail = end.slice(
    Math.max(...[" ", "\n", "\t"].map((c) => end.lastIndexOf(c))) + 1
  );
  const blocks = [...done, ...ending].filter(
    (node) => node.type !== "definition"
  );
  let heading: string | undefined;
  const names = blocks.map((node) => {
    heading = node.type === "heading" ? textOf(node) : heading;
    return node.type === "table" ? heading : undefined;
  });
  return (
    <div
      data-slot="markdown"
      aria-busy={streaming || undefined}
      {...stylex.props(styles.root, look !== "default" && styles[look], style)}
    >
      {/* oxlint-disable-next-line react/jsx-no-constructed-context-values -- compiled */}
      <Definitions value={starts.length === 1 ? definitionsIn(done) : []}>
        {blocks.map((node, at) => (
          <div
            key={at}
            {...stylex.props(streaming && framed.has(node.type) && fadeIn)}
          >
            <Tail
              value={open && at >= blocks.length - ending.length ? tail : ""}
            >
              <MarkdownNode node={node} shared={shared} name={names[at]} />
            </Tail>
          </div>
        ))}
      </Definitions>
    </div>
  );
};
