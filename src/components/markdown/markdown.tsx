// Markdown: an agent's answer, drawn from micromark's syntax tree (parse.ts) with the system's parts,
// never as HTML. While it streams, a finished block is read and drawn once, keyed by its place so
// it never fades in again; only the block still being written is read again, made whole first, and
// each new word fades in. Written here, a table keeps its even columns and lines break where they
// fill (`greedy`), so nothing drawn moves; fenced code with no place is still coming in.
"use client";

import * as stylex from "@stylexjs/stylex";
import {
  createContext,
  Fragment,
  use,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type {
  ComponentProps,
  ComponentType,
  ReactElement,
  ReactNode,
} from "react";

import { useI18n } from "../../lib/i18n";
import { CheckIcon, ChevronRightIcon, Icon } from "../../lib/icons";
import {
  choiceBoxStyles,
  fadeIn,
  focusRing,
  visuallyHidden,
} from "../../lib/styles";
import {
  colors,
  duration,
  font,
  media,
  radius,
  size,
  space,
} from "../../lib/tokens.stylex";
import { announce, safeHref } from "../../lib/utils";
import type { LayoutStyle } from "../../lib/utils";
import { iconVars, motionVars } from "../../lib/vars.stylex";
import * as Code from "../code-block";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../collapsible";
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

type Of<T extends RootContent["type"]> = Extract<RootContent, { type: T }>;
type Phrase = Of<"paragraph">["children"][number];
type Row = Of<"table">["children"][number];
/** A node of the syntax tree Markdown draws: a block, a phrase, a list's item, a table's row or cell. */
export type MarkdownNode =
  | RootContent
  | Phrase
  | Of<"list">["children"][number]
  | Row
  | Row["children"][number];
type Node = MarkdownNode;

/** The elements Markdown draws that a caller may draw instead, by their HTML names. */
type MarkdownElement =
  | "a"
  | "blockquote"
  | "code"
  | "del"
  | "em"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "hr"
  | "img"
  | "li"
  | "ol"
  | "p"
  | "pre"
  | "strong"
  | "table"
  | "tbody"
  | "td"
  | "th"
  | "thead"
  | "tr"
  | "ul";

/**
 * Elements drawn in Markdown's place, keyed by HTML element name (a map written for react-markdown
 * or Streamdown carries over): each is given the element's own props (its `children`; `href` and
 * `title` for `a`, `src`, `alt` and `title` for `img`, `className` `language-…` for fenced code,
 * `start` for `ol`, `align` for a cell) and the syntax tree's `node` it draws, which is internal.
 */
export type MarkdownComponents = {
  [Tag in MarkdownElement]?: ComponentType<
    ComponentProps<Tag> & { node: MarkdownNode }
  >;
};

/** Every prop a Markdown takes. */
export interface MarkdownProps {
  /** The Markdown: the agent's answer, or as much of it as has arrived. */
  children: string;
  /** Still being written: a half-written end is drawn whole, each new word fades in. @default false */
  streaming?: boolean;
  /** Cut off part way: the end is made whole as while streaming, so no raw mark shows. @default false */
  truncated?: boolean;
  /**
   * How a screen reader hears it while it is written: `polite`, each block once it is finished;
   * `off`, nothing, for words beside the answer that another part already says (Reasoning's
   * thoughts, which say only that thinking started).
   * @default "polite"
   */
  live?: "polite" | "off";
  /** `message` in a chat message; `sm` a card or a panel; `xs` a muted note. @default "default" */
  size?: "default" | "message" | "sm" | "xs";
  /** The outline level of a `#` heading, so the page's outline never skips. @default 1 */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * A single newline inside a paragraph is a line break, for answers written as short lines; off,
   * it is a space, as CommonMark has it, so a paragraph wrapped by hand reads as one.
   * @default false
   */
  softBreaks?: boolean;
  /**
   * Fenced code past this many lines is folded under Show more, as CodeBlockContent's `maxLines`.
   * `false` never folds; a block still draws at most its first 2,000 lines (a line says how many
   * more, and Copy takes all), since the text comes from a model and has no bound.
   * @default 18
   */
  codeMaxLines?: number | false;
  /**
   * Draws the answer's links and pictures, any scheme, before Markdown's own filter; undefined
   * leaves one to Markdown (http, https, mailto, tel or a path here as a Link, else its words; a
   * picture is never loaded). Never handed an address that is still being written.
   */
  renderLink?: MarkdownLinkRenderer;
  /**
   * Draws elements in Markdown's place, keyed by HTML element name (`{ code: MyCode, a: MyLink }`);
   * any left out is Markdown's own. `a` is given only an address Markdown would lead to, whole;
   * `img` only an http or https one, whole, and giving it is the choice to load pictures. `code`
   * draws code in a sentence and fenced code (`node.type` is `code`), in CodeBlock's place; `pre`,
   * when given, holds fenced code's `code`. Task boxes, notes and folding sections stay Markdown's
   * own. `node` is internal: the parser's node, holding the answer as written (its `url` unchecked),
   * to tell what is drawn by; draw from the checked `href` and `src`.
   */
  components?: MarkdownComponents;
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
  // A task: Checkbox's box, read only, before the words.
  task: {
    listStyleType: "none",
    marginInlineStart: `calc(-1 * ${space["6"]})`,
    display: "flex",
    alignItems: "flex-start",
    gap: space["2"],
  },
  // Round at the corner, not the system's squircle, and its tick at the icon's own size: a task in
  // an answer is a mark that it is done, softer than a Checkbox someone presses. On the first line.
  box: {
    [iconVars.size]: size.iconSm,
    [iconVars.stroke]: size.iconStroke,
    display: "grid",
    flexShrink: 0,
    width: size.checkboxBox,
    height: size.checkboxBox,
    marginBlock: `calc((1lh - ${size.checkboxBox}) / 2)`,
    marginInlineStart: space["1"],
    borderRadius: radius.sm,
    cornerShape: "round",
    color: colors.primaryForeground,
  },
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
  // The room a link still being written keeps for Link's quarter step before its words and its
  // arrow after them, so neither its words nor what follows moves when the address is whole.
  linkLead: { display: "inline-block", width: `calc(${space["1"]} / 4)` },
  arrowRoom: {
    display: "inline-block",
    width: `calc(${size.linkMarkGap} + ${size.linkMark} + ${space["1"]} / 4)`,
  },
  footnoteMark: { fontSize: font.textXs, verticalAlign: "super" },
  footnotes: {
    display: "flex",
    flexDirection: "column",
    gap: space["1"],
    margin: 0,
    paddingInlineStart: space["6"],
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
    listStyleType: "decimal",
  },
  more: {
    margin: 0,
    marginBlockStart: `calc(-1 * ${space["2"]})`,
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

// A section that folds inside prose, as a document's toggle: the chevron before the summary,
// pointing along the line while closed and down while open; the body under the summary's first
// letter. A Collapsible with a look of its own and none of a panel's.
const sectionStyles = stylex.create({
  section: {
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr)",
    columnGap: space["1"],
    alignItems: "start",
  },
  toggle: {
    gridColumn: "1",
    gridRow: "1",
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1lh",
    height: "1lh",
    padding: 0,
    margin: 0,
    borderWidth: 0,
    borderRadius: radius.sm,
    cornerShape: radius.shape,
    backgroundColor: {
      default: "transparent",
      ":hover": { default: null, [media.hover]: colors.accent },
      ":active": colors.accentActive,
    },
    color: colors.mutedForeground,
    font: "inherit",
    cursor: "pointer",
  },
  // The holder turns; the drawing itself mirrors right to left, as a pointing icon does.
  chevron: {
    display: "inline-flex",
    transform: {
      default: null,
      ":is([aria-expanded=true] > *)": {
        default: "rotate(90deg)",
        ":dir(rtl)": "rotate(-90deg)",
      },
    },
    transitionProperty: "transform",
    transitionDuration: motionVars.ui,
    transitionTimingFunction: duration.ease,
  },
  summary: {
    gridColumn: "2",
    gridRow: "1",
    display: "block",
    minWidth: 0,
    margin: 0,
    fontWeight: font.weightMedium,
    color: colors.foreground,
  },
  under: { gridColumn: "2", gridRow: "2", minWidth: 0 },
  // Room inside the panel, as room on the panel itself would show while it is closed.
  body: {
    display: "flex",
    flexDirection: "column",
    gap: space["4"],
    minWidth: 0,
    paddingBlockStart: space["2"],
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
type Linked = Extract<Phrase, { url: string } | { referenceType: unknown }>;
interface Shared {
  provided: MarkdownLinkRenderer | null;
  renderLink?: MarkdownLinkRenderer;
  components: MarkdownComponents;
  streaming: boolean;
  size: NonNullable<MarkdownProps["size"]>;
  headingLevel: number;
  greedy: boolean;
  softBreaks: boolean;
  codeMaxLines: number | false;
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

// What changes as the answer grows, read only by the nodes that need it: the link definitions, the
// notes, the last word still being written (a bare address in it may still grow) and the place of
// the block drawn (a note leads back to its first mark).
const NO_DEFINITIONS: Of<"definition">[] = [];
const Definitions = createContext(NO_DEFINITIONS);
// The notes in their order, as words, so the value is the same while they are: the ids' prefix,
// then each note's name, led by `+` once its note has come (`_r_1_ +growth -churn`). A name has no
// space in it.
const Notes = createContext("");
const Tail = createContext("");
const At = createContext(-1);
// SAFETY: every node a node of the tree holds is a node of the tree.
const kidsOf = (node: Node) =>
  ("children" in node ? node.children : []) as Node[];
const BLOCKY = new Set(["blockquote", "list", "listItem", "table", "tableRow"]);
const textOf = (node: Node): string =>
  "value" in node
    ? node.value
    : kidsOf(node)
        .map(textOf)
        .join(BLOCKY.has(node.type) ? " " : "");
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

/** The caller's element for `tag` (`components`), given its props and the node it draws, else Markdown's own. */
const el = <T extends MarkdownElement>(
  shared: Shared,
  tag: T,
  node: Node,
  props: ComponentProps<T>,
  own: ReactElement
): ReactElement => {
  // SAFETY: `components` maps each tag to a part that takes that tag's props and the node.
  const Custom = shared.components[tag] as
    | ComponentType<ComponentProps<T> & { node: Node }>
    | undefined;
  return Custom === undefined ? own : <Custom {...props} node={node} />;
};

/**
 * While written, whether a half link of Markdown's own keeps the room Link's arrow will take: so far
 * its address is nothing, the first letters of a web address, or one.
 */
const keepsRoom = (url: string | undefined, shared: Shared, tail: string) => {
  const so = /\]\((?<url>[^\s)]*)$/u.exec(tail)?.groups?.url ?? "https://";
  return (
    shared.streaming &&
    shared.inLink !== true &&
    url === "streamdown:incomplete-link" &&
    shared.renderLink === undefined &&
    shared.provided === null &&
    shared.components.a === undefined &&
    (/^https?:\/\//u.test(so) ||
      ["http://", "https://"].some((web) => web.startsWith(so)))
  );
};
/** A link or a picture at an address it may lead to, whole: the caller's `a` or `img`, else Link. */
const leadTo = (
  node: Linked,
  link: MarkdownLink,
  href: string,
  { a: A, img: Img }: MarkdownComponents
) => {
  if (link.type === "image" && Img !== undefined && /^https?:/u.test(href)) {
    const alt = "alt" in node ? (node.alt ?? "") : "";
    return <Img node={node} src={href} alt={alt} title={link.title} />;
  }
  if (link.type !== "image" && A !== undefined) {
    return (
      <A node={node} href={href} title={link.title}>
        {link.children}
      </A>
    );
  }
  return (
    <Link href={href} title={link.title} external={/^https?:/u.test(href)}>
      {link.type === "image" && link.children === "" ? href : link.children}
    </Link>
  );
};

/**
 * A link or a picture: the host's, else the caller's `a` or `img`, else Markdown's own Link where
 * the address may lead, else its words. Never while its address can change: a half link or picture,
 * a reference not yet defined, a bare address (its words start where it does) in the word still
 * being written; nor inside a link.
 */
const Anchor = ({ node, shared, children }: Part<Linked>): ReactNode => {
  const found =
    "url" in node
      ? node
      : use(Definitions).find((each) => each.identifier === node.identifier);
  const [first] = "children" in node ? node.children : [];
  const bare = first?.position?.start.offset === node.position?.start.offset;
  const tail = use(Tail);
  const growing = bare && tail.includes(textOf(node));
  if (
    found === undefined ||
    parse.HALF.has(found.url) ||
    growing ||
    shared.inLink === true
  ) {
    return keepsRoom(found?.url, shared, tail) ? (
      <>
        <span aria-hidden="true" {...stylex.props(styles.linkLead)} />
        {children}
        <span aria-hidden="true" {...stylex.props(styles.arrowRoom)} />
      </>
    ) : (
      children
    );
  }
  const link = linkOf(node, found.url, found.title, children);
  const drawn = shared.renderLink?.(link);
  const hosted = drawn === undefined ? shared.provided?.(link) : drawn;
  const href = safeHref(found.url, { relative: true });
  return hosted !== undefined || href === null
    ? (hosted ?? children)
    : leadTo(node, link, href, shared.components);
};
/** Where a note's mark is: the place of its block and where it starts in it. */
const markId = (prefix: string, at: number, node: Node) =>
  `${prefix}-ref-${at}-${node.position?.start.offset ?? 0}`;
/** A note's mark: its number, leading to the note once the note has come. */
const NoteMark = ({ node, shared }: Part<Of<"footnoteReference">>) => {
  const words = useI18n().markdown;
  const [prefix = "", ...notes] = use(Notes).split(" ");
  const at = use(At);
  const index = notes.findIndex((note) => note.slice(1) === node.identifier);
  const number = index + 1;
  if (number === 0) {
    return `[^${node.label ?? node.identifier}]`;
  }
  const shown = <span aria-label={words.footnote(number)}>{number}</span>;
  return (
    <sup {...stylex.props(styles.footnoteMark)}>
      <span id={markId(prefix, at, node)}>
        {notes[index]?.startsWith("+") === true && shared.inLink !== true ? (
          <Link href={`#${prefix}-fn-${number}`}>{shown}</Link>
        ) : (
          shown
        )}
      </span>
    </sup>
  );
};

/** A task's box: Checkbox's, read only, said by its words beside it. */
const TaskBox = ({ done }: { done: boolean }) => {
  const words = useI18n().markdown;
  return (
    <>
      <span aria-hidden="true" {...stylex.props(styles.box)}>
        <span
          {...stylex.props(
            choiceBoxStyles.face,
            done ? choiceBoxStyles.full : choiceBoxStyles.empty
          )}
        >
          {done && <Icon icon={CheckIcon} />}
        </span>
      </span>
      <span {...stylex.props(visuallyHidden)}>
        {done ? words.done : words.notDone}
      </span>
    </>
  );
};
type Draw<T extends Node["type"]> = (
  node: Extract<Node, { type: T }>,
  shared: Shared,
  kids: Kids
) => ReactNode;

// A table is named by the heading above it; a row draws its own cells, as many as the head's.
const MOST_ROWS = 1000;
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
  const row = (cells: Row | undefined, tag: "th" | "td") => {
    const Cell = tag === "th" ? Tables.TableHead : Tables.TableCell;
    const drawn = cells?.children.slice(0, align.length).map((cell, at) => {
      const children = kids?.(cell.children, PHRASE);
      const props = { align: node.align?.[at] ?? undefined, children };
      return (
        <Fragment key={at}>
          {el(
            shared,
            tag,
            cell,
            props,
            <Cell align={align[at]}>{children}</Cell>
          )}
        </Fragment>
      );
    });
    const own = <Tables.TableRow>{drawn}</Tables.TableRow>;
    return cells === undefined
      ? own
      : el(shared, "tr", cells, { children: drawn }, own);
  };
  const top = row(head, "th");
  const header = el(
    shared,
    "thead",
    node,
    { children: top },
    <Tables.TableHeader>{top}</Tables.TableHeader>
  );
  // A table from a model has no bound: at most 1,000 rows are drawn, and a line says how many more.
  const lines = rows
    .slice(0, MOST_ROWS)
    .map((cells, at) => <Fragment key={at}>{row(cells, "td")}</Fragment>);
  const more = rows.length - MOST_ROWS;
  const body = el(
    shared,
    "tbody",
    node,
    { children: lines },
    <Tables.TableBody>{lines}</Tables.TableBody>
  );
  const label = name ?? words.table;
  return el(
    shared,
    "table",
    node,
    {
      "aria-label": label,
      children: (
        <>
          {header}
          {body}
        </>
      ),
    },
    <>
      <Tables.Table aria-label={label} streaming={written}>
        {header}
        {body}
      </Tables.Table>
      {more > 0 && <p {...stylex.props(styles.more)}>{words.moreRows(more)}</p>}
    </>
  );
};
// A paragraph in a list item is its words.
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
  shared: Shared,
  kids: Kids
) => {
  const [Tag, look] = MARKS[node.type];
  const children = kids(node.children);
  return el(
    shared,
    Tag,
    node,
    { children },
    <Tag {...stylex.props(look)}>{children}</Tag>
  );
};
const anchor = (node: Linked, shared: Shared, kids: Kids) => (
  <Anchor node={node} shared={shared}>
    {"children" in node
      ? kids(node.children, { inLink: true })
      : (node.alt ?? "")}
  </Anchor>
);
// A word in a link does not fade: its words move into the link when it is whole, and would fade
// again there.
const wordsOf = (value: string, shared: Shared) =>
  shared.streaming && shared.inLink !== true
    ? value.match(/\S+\s*|\s+/gu)?.map((word, at) => (
        <span key={at} {...stylex.props(fadeIn, styles.word)}>
          {word}
        </span>
      ))
    : value;
const headings = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
const headingLooks = {
  default: [styles.major, styles.minor],
  message: [styles.major, styles.minor],
  sm: [styles.smallMajor, styles.smallMinor],
  xs: [styles.xsHeading, styles.xsHeading],
};
const draw: { [T in Node["type"]]?: Draw<T> } = {
  text: (node, shared) =>
    shared.softBreaks && node.value.includes("\n")
      ? node.value.split("\n").map((line, at) => (
          <Fragment key={at}>
            {at > 0 && <br />}
            {wordsOf(line, shared)}
          </Fragment>
        ))
      : wordsOf(node.value, shared),
  strong: mark,
  emphasis: mark,
  delete: mark,
  inlineCode: (node, shared) =>
    el(
      shared,
      "code",
      node,
      { children: node.value },
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
  footnoteReference: (node, shared) => <NoteMark node={node} shared={shared} />,
  html: (node, shared) =>
    shared.phrase === true ? (
      <span {...stylex.props(styles.raw)}>{node.value}</span>
    ) : (
      <p {...stylex.props(styles.paragraph, styles.raw)}>{node.value}</p>
    ),
  paragraph: (node, shared, kids) => {
    const children = kids(node.children, PHRASE);
    return el(
      shared,
      "p",
      node,
      { children },
      <p {...stylex.props(styles.paragraph, shared.greedy && styles.greedy)}>
        {children}
      </p>
    );
  },
  heading: (node, shared, kids) => {
    // The fifth and sixth depths are drawn and placed as the fourth, from the caller's level on.
    const depth = Math.min(node.depth, 4);
    const Tag =
      headings[Math.min(shared.headingLevel - 1 + depth, 6) - 1] ?? "h6";
    const look = headingLooks[shared.size][depth <= 2 ? 0 : 1];
    const children = kids(node.children, PHRASE);
    return el(
      shared,
      Tag,
      node,
      { children },
      <Tag
        {...stylex.props(styles.heading, look, shared.greedy && styles.greedy)}
      >
        {children}
      </Tag>
    );
  },
  list: (node, shared, kids) => {
    const children = kids(node.children);
    const start = node.start ?? undefined;
    return node.ordered === true
      ? el(
          shared,
          "ol",
          node,
          { start, children },
          <ol start={start} {...stylex.props(styles.list, styles.ordered)}>
            {children}
          </ol>
        )
      : el(
          shared,
          "ul",
          node,
          { children },
          <ul {...stylex.props(styles.list, styles.unordered)}>{children}</ul>
        );
  },
  listItem: (node, shared, kids) => {
    const task = typeof node.checked === "boolean";
    const children = (
      <>
        {task && <TaskBox done={node.checked === true} />}
        {body(node.children, kids)}
      </>
    );
    return el(
      shared,
      "li",
      node,
      { children },
      <li {...stylex.props(styles.item, task && styles.task)}>{children}</li>
    );
  },
  blockquote: (node, shared, kids) => {
    const children = kids(node.children);
    return el(
      shared,
      "blockquote",
      node,
      { children },
      <blockquote {...stylex.props(styles.quote)}>{children}</blockquote>
    );
  },
  thematicBreak: (node, shared) => el(shared, "hr", node, {}, <Separator />),
  code: (node, shared) => {
    const { code: Custom, pre: Pre } = shared.components;
    if (Custom !== undefined || Pre !== undefined) {
      const lang = node.lang ?? "";
      const className = lang === "" ? undefined : `language-${lang}`;
      const code =
        Custom === undefined ? (
          <code className={className}>{node.value}</code>
        ) : (
          <Custom node={node} className={className}>
            {node.value}
          </Custom>
        );
      return Pre === undefined ? code : <Pre node={node}>{code}</Pre>;
    }
    return (
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
        {/* `false` never folds, yet still draws at most 2,000 lines: a model's code has no bound. */}
        <Code.CodeBlockContent
          lineNumbers
          maxLines={
            shared.codeMaxLines === false
              ? Number.POSITIVE_INFINITY
              : shared.codeMaxLines
          }
        >
          {node.value}
        </Code.CodeBlockContent>
      </Code.CodeBlock>
    );
  },
};
const Drawn = ({ node, shared, name }: Part<Node>): ReactNode => {
  const kids: Kids = (nodes, within) =>
    nodes.map((child, at) => (
      <Drawn
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
const phrases = (nodes: readonly Node[], shared: Shared) =>
  nodes.map((node, at) => (
    <Drawn key={at} node={node} shared={{ ...shared, ...PHRASE }} />
  ));

/** The notes at the foot, in the order they are first marked, each leading back to its first mark. */
const NoteList = ({
  notes,
  prefix,
  shared,
}: {
  notes: ReturnType<typeof notesOf>["listed"];
  prefix: string;
  shared: Shared;
}) => {
  const words = useI18n().markdown;
  return (
    <ol {...stylex.props(styles.footnotes)}>
      {notes.map(({ at, note, number, first }) => {
        const back = first && (
          <Link href={`#${markId(prefix, ...first)}`}>
            {words.back(number)}
          </Link>
        );
        return (
          <li
            key={note.identifier}
            value={number}
            id={`${prefix}-fn-${number}`}
          >
            <At value={at}>
              {note.children.map((child, index) =>
                child.type === "paragraph" ? (
                  <span key={index}>
                    {phrases(child.children, shared)} {back}
                  </span>
                ) : (
                  <Drawn key={index} node={child} shared={shared} />
                )
              )}
            </At>
          </li>
        );
      })}
    </ol>
  );
};

// ---- Sections: `<details>` with a `<summary>` line, the one form of HTML drawn as what it means --
//
// CommonMark reads it as an HTML block holding the opening and the summary, the Markdown blocks of
// its body, and an HTML block holding the closing; those are grouped again into a section that
// folds (`<details open>` stands open), and any other HTML stays text. While an answer is written
// an opening is a section once it is whole, its closing still to come; an answer drawn whole with an
// opening nothing closes shows it as text. Sections nest, at most 32 deep.
const OPENING =
  /^<details(?<attributes>(?:\s+[a-z][a-z-]*(?:="[^"\n]*")?)*)\s*>[ \t]*\n?[ \t]*<summary>(?<summary>[^\n]*)<\/summary>[ \t]*$/u;
const CLOSING = /^<\/details>[ \t]*$/u;
interface Section {
  at: number;
  node: Node;
  summary: string;
  open: boolean;
  children: Grouped[];
}
type Grouped = { at: number; node: Node } | Section;
const UNDRAWN = /^(?:definition|footnoteDefinition)$/u;
const htmlOf = (node: Node) => (node.type === "html" ? node.value.trim() : "");
/** The blocks, each whole section read as one; `unclosed`: an opening nothing closes is one too. */
const group = (blocks: readonly Node[], unclosed: boolean) => {
  const root: Grouped[] = [];
  const open: Section[] = [];
  let past = 0;
  const into = () => open.at(-1)?.children ?? root;
  for (const [at, node] of blocks.entries()) {
    const { attributes = "", summary } =
      OPENING.exec(htmlOf(node))?.groups ?? {};
    const closing = CLOSING.test(htmlOf(node));
    const section = closing && past === 0 ? open.pop() : undefined;
    if (summary !== undefined && open.length < 32) {
      const opens = /(?:^|\s)open(?:\s|=|$)/u.test(attributes);
      open.push({ at, node, summary, open: opens, children: [] });
    } else if (section !== undefined) {
      into().push(section);
    } else if (!UNDRAWN.test(node.type)) {
      // An opening past the depth is text, and so is the closing that answers it.
      if (summary !== undefined) {
        past += 1;
      } else if (closing && past > 0) {
        past -= 1;
      }
      into().push({ at, node });
    }
  }
  for (let section = open.pop(); section !== undefined; section = open.pop()) {
    if (unclosed) {
      into().push(section);
    } else {
      into().push({ at: section.at, node: section.node });
      for (const child of section.children) {
        into().push(child);
      }
    }
  }
  return root;
};
const SectionBlock = ({
  section,
  shared,
  children,
}: {
  section: Section;
  shared: Shared;
  children: ReactNode;
}) => {
  const id = useId();
  const [words] = parse.readBlock(
    section.summary.trim(),
    false,
    shared.streaming
  );
  return (
    <Collapsible asChild defaultOpen={section.open}>
      <div
        data-slot="markdown-section"
        {...stylex.props(sectionStyles.section)}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            aria-labelledby={id}
            {...stylex.props(sectionStyles.toggle, focusRing)}
          >
            <span aria-hidden="true" {...stylex.props(sectionStyles.chevron)}>
              <Icon icon={ChevronRightIcon} />
            </span>
          </button>
        </CollapsibleTrigger>
        <div id={id} {...stylex.props(sectionStyles.summary)}>
          {words?.type === "paragraph" && phrases(words.children, shared)}
        </div>
        <CollapsibleContent asChild>
          <div {...stylex.props(sectionStyles.under)}>
            <div {...stylex.props(sectionStyles.body)}>{children}</div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
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
const FOUND = /^(?:definition|footnoteDefinition|footnoteReference)$/u;
const found = new WeakMap<Node, Node[]>();
/** The definitions, notes and notes' marks a block holds, in reading order: found once, by a stack. */
const foundIn = (block: Node) => {
  const known = found.get(block);
  if (known !== undefined) {
    return known;
  }
  const nodes: Node[] = [];
  const stack = [block];
  for (let node = stack.pop(); node !== undefined; node = stack.pop()) {
    if (FOUND.test(node.type)) {
      nodes.push(node);
    }
    for (const kid of kidsOf(node).toReversed()) {
      stack.push(kid);
    }
  }
  found.set(block, nodes);
  return nodes;
};
/**
 * While written, what a block says once it is finished: never each word, nor code (CodeBlock says
 * it is being written); a table says its name, a section its summary.
 */
const useSaid = (
  blocks: readonly Node[],
  streaming: boolean,
  live: boolean,
  names: readonly (string | undefined)[]
) => {
  const words = useI18n().markdown;
  const told = useRef<number | null>(null);
  const finished = streaming ? Math.max(blocks.length - 1, 0) : blocks.length;
  useEffect(() => {
    const from = told.current;
    told.current = finished;
    if (!live || from === null || finished <= from) {
      return;
    }
    const said = blocks
      .slice(from, finished)
      .map((node, at) => {
        const html = htmlOf(node);
        if (node.type === "table") {
          return names[from + at] ?? words.table;
        }
        if (html !== "") {
          const summary = OPENING.exec(html)?.groups?.summary;
          return summary ?? (CLOSING.test(html) ? "" : html);
        }
        return FOUND.test(node.type) || node.type === "code"
          ? ""
          : textOf(node).trim();
      })
      .filter((part) => part !== "")
      .join(" ");
    if (said !== "") {
      announce(said);
    }
  }, [blocks, finished, live, names, words.table]);
};
// While written, a table's row waits for its line's end, and its head for its row of dashes; a
// task's box, a note's mark or the start of a note, a link's definition (never drawn) and a mark of
// emphasis or code at the very end wait for the words after them.
const HALF_ROW = /(?:^|\n) {0,3}\|[^\n]*$/u;
const HEAD = /(?:^|\n) {0,3}\|[^\n]*\n?$/u;
const DASHES = /^ {0,3}\|?[ \t]*:?-+:?[ \t]*(?:\||$)/mu;
const STARTS_WAITING =
  /^[ \t>]*(?:(?:[-*+]|\d{1,9}[.)])[ \t]+\[[ xX]?\]?[ \t]*|\[\^[^\]\s]*\]?:?[ \t]*|\[(?!\^)(?:[^\]\\]|\\.){1,999}\]:.*)$/u;
/** `end` less what waits; each pattern is anchored or found from the end, so none scans back. */
const lessWaiting = (end: string) => {
  const line = end.lastIndexOf("\n") + 1;
  if (STARTS_WAITING.test(end.slice(line))) {
    return end.slice(0, line);
  }
  const note = end.lastIndexOf("[^");
  let to = note !== -1 && !/[\]\s]/u.test(end.slice(note)) ? note : end.length;
  while (to > 0 && "*_~`[ \t".includes(end.charAt(to - 1))) {
    to -= end.charAt(to - 2) === "!" && end.charAt(to - 1) === "[" ? 2 : 1;
  }
  return end.slice(0, to);
};
/** The last word of `text`: a bare address in it may still grow. */
const lastWord = (text: string) =>
  text.slice(
    Math.max(...[" ", "\n", "\t"].map((c) => text.lastIndexOf(c))) + 1
  );
/**
 * The block still being written, read again as it grows; past 8 KB only once it has grown by an
 * eighth, so a huge one (a paragraph of 40,000 lines, a table of thousands of rows) costs no more a
 * chunk than a small one and grows in steps, drawn with the last word it was read with.
 */
const useEnding = (whole: string, streaming: boolean, read: () => Node[]) => {
  const [kept, setKept] = useState<{ whole: string; nodes: Node[] }>({
    whole: "",
    nodes: [],
  });
  const big = streaming && whole.length > 8192;
  const due =
    !big ||
    !whole.startsWith(kept.whole) ||
    (whole.length - kept.whole.length) * 8 >= whole.length;
  if (!due) {
    return kept;
  }
  const now = { whole, nodes: read() };
  if (big) {
    setKept(now);
  }
  return now;
};
const framed = new Set(["code", "table", "thematicBreak"]);
const NO_COMPONENTS: MarkdownComponents = {};

/**
 * The answer's top-level nodes: the finished blocks' read once, the block still being written's
 * made whole (`ending`, how many), and the last word still being written. Once written, an answer
 * that defines a name or a note is read whole, so its references resolve as CommonMark says.
 */
const useBlocks = (
  children: string,
  streaming: boolean,
  truncated: boolean
) => {
  const source = children.replaceAll(/\r\n?/gu, "\n");
  const cut = useStarts(source);
  const starts = !streaming && parse.definesNames(source) ? [0] : cut;
  const open = streaming || truncated;
  const done = (open ? starts.slice(0, -1) : starts).flatMap((start, at) =>
    parse.readBlock(source.slice(start, starts[at + 1]), false, streaming)
  );
  let end = source.slice(open ? starts.at(-1) : source.length);
  // Cut off, a link still being written goes; a row waits for its line's end, a head for its dashes.
  const bracket = end.lastIndexOf("[");
  end =
    truncated && bracket > end.lastIndexOf("]") ? end.slice(0, bracket) : end;
  const rows = lessWaiting(end).replace(HALF_ROW, "");
  const whole = DASHES.test(rows) ? rows : rows.replace(HEAD, "");
  const code = streaming ? parse.openCode(end) : null;
  const read = useEnding(whole, streaming && code === null, () =>
    open && code === null ? parse.readBlock(whole, true, streaming) : []
  );
  // A section's opening shows once it is whole.
  const ending = (code ?? read.nodes).filter(
    (node) =>
      !streaming ||
      !htmlOf(node).startsWith("<details") ||
      OPENING.test(htmlOf(node))
  );
  const definitions =
    starts.length === 1
      ? done
          .flatMap(foundIn)
          .flatMap((node) => (node.type === "definition" ? [node] : []))
      : NO_DEFINITIONS;
  return {
    all: [...done, ...ending],
    ending: ending.length,
    tail: lastWord(read.whole),
    definitions,
  };
};

/**
 * The notes, numbered in the order they are first marked (once written, only those that came),
 * each with where it is and where its first mark outside the notes is.
 */
const notesOf = (all: readonly Node[], streaming: boolean, prefix: string) => {
  const notes = new Map<string, readonly [number, Of<"footnoteDefinition">]>();
  const firsts = new Map<string, readonly [number, Node]>();
  const marked = new Set<string>();
  for (const [at, block] of all.entries()) {
    for (const node of foundIn(block)) {
      if (node.type === "footnoteDefinition" && !notes.has(node.identifier)) {
        notes.set(node.identifier, [at, node]);
      } else if (node.type === "footnoteReference") {
        marked.add(node.identifier);
        if (
          block.type !== "footnoteDefinition" &&
          !firsts.has(node.identifier)
        ) {
          firsts.set(node.identifier, [at, node]);
        }
      }
    }
  }
  const order = [...marked].filter((id) => streaming || notes.has(id));
  return {
    listed: order.flatMap((id, index) => {
      const [at = 0, note] = notes.get(id) ?? [];
      const first = firsts.get(id);
      return note === undefined ? [] : [{ at, note, number: index + 1, first }];
    }),
    value: [
      prefix,
      ...order.map((id) => `${notes.has(id) ? "+" : "-"}${id}`),
    ].join(" "),
  };
};

/** Each table's name: the words of the heading above it. */
const namesOf = (all: readonly Node[]) => {
  let heading: string | undefined;
  return all.map((node) => {
    heading = node.type === "heading" ? textOf(node) : heading;
    return node.type === "table" ? heading : undefined;
  });
};

export const Markdown = ({
  children,
  streaming = false,
  truncated = false,
  live = "polite",
  size: look = "default",
  headingLevel = 1,
  softBreaks = false,
  codeMaxLines = 18,
  renderLink,
  components = NO_COMPONENTS,
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
    components,
    streaming,
    size: look,
    headingLevel,
    greedy: written,
    softBreaks,
    codeMaxLines,
  };
  const { all, ending, tail, definitions } = useBlocks(
    children,
    streaming,
    truncated
  );
  const open = streaming || truncated;
  const prefix = useId();
  const notes = notesOf(all, streaming, prefix);
  const names = namesOf(all);
  useSaid(all, streaming, live === "polite", names);
  const place = (grouped: Grouped): ReactNode => {
    const { at, node } = grouped;
    const inner = (
      <At value={at}>
        <Tail value={open && at >= all.length - ending ? tail : ""}>
          {"children" in grouped ? (
            <SectionBlock section={grouped} shared={shared}>
              {grouped.children.map(place)}
            </SectionBlock>
          ) : (
            <Drawn node={node} shared={shared} name={names[at]} />
          )}
        </Tail>
      </At>
    );
    return "children" in grouped ? (
      <Fragment key={at}>{inner}</Fragment>
    ) : (
      <div
        key={at}
        {...stylex.props(streaming && framed.has(node.type) && fadeIn)}
      >
        {inner}
      </div>
    );
  };
  return (
    <div
      data-slot="markdown"
      aria-busy={streaming || undefined}
      {...stylex.props(styles.root, look !== "default" && styles[look], style)}
    >
      <Definitions value={definitions}>
        <Notes value={notes.value}>
          {group(all, open).map(place)}
          {notes.listed.length > 0 && (
            <Tail value={open ? tail : ""}>
              <NoteList notes={notes.listed} prefix={prefix} shared={shared} />
            </Tail>
          )}
        </Notes>
      </Definitions>
    </div>
  );
};
