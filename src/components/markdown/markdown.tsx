// Markdown: an agent's answer, drawn from micromark's syntax tree (parse.ts) with the system's parts,
// never as HTML. While it streams, a finished block is read and drawn once, keyed by its place so
// it never fades in again; only the block still being written is read again, made whole first, and
// each new word fades in. Written here, a table keeps its even columns and lines break where they
// fill (`greedy`), so nothing drawn moves; fenced code with no place is still coming in.
"use client";

import * as stylex from "@stylexjs/stylex";
import {
  createContext,
  createElement,
  Fragment,
  use,
  useEffect,
  useId,
  useLayoutEffect,
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
import type { Block, RootContent } from "./parse";

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
  | Block
  | Phrase
  | Of<"list">["children"][number]
  | Row
  | Row["children"][number];
type Node = MarkdownNode;

/** The elements Markdown draws that a caller may draw instead, by their HTML names. */
type Blocks = "p" | "blockquote" | "ul" | "ol" | "li" | "hr" | "pre" | "code";
type Cells = "table" | "thead" | "tbody" | "tr" | "th" | "td";
type Phrases = "a" | "img" | "strong" | "em" | "del";
type MarkdownElement = `h${1 | 2 | 3 | 4 | 5 | 6}` | Blocks | Cells | Phrases;

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
  notes?: boolean;
}
const PHRASE = { phrase: true };
type Kids = (nodes: readonly Node[], within?: Partial<Shared>) => ReactNode;
interface Part<T> {
  node: T;
  shared: Shared;
  kids: Kids;
  name?: string;
  children?: ReactNode;
}

// What changes as the answer grows, read only by the nodes that need it: the link definitions; the
// notes; the last word still being written (a bare address in it may still grow); where the block
// still being written was last read to (past many words, what came after it fades as one); and the
// place of the block drawn (a note leads back to its first mark).
const NO_DEFINITIONS: Of<"definition">[] = [];
const Definitions = createContext(NO_DEFINITIONS);
// The notes in their order, as lines, so the value stays the same while they do: the ids' prefix,
// then for each note `+` once it has come (else `-`), its first mark's id, a space and its name (a
// name has no space in it).
const Notes = createContext("");
const Tail = createContext("");
const Fresh = createContext(-1);
const At = createContext("");
// SAFETY: every node a node of the tree holds is a node of the tree.
const kidsOf = (node: Node) =>
  ("children" in node ? node.children : []) as Node[];
const BLOCKY = /^(?:blockquote|list|listItem|table|tableRow|section)$/u;
const textOf = (node: Node): string =>
  "value" in node
    ? node.value
    : kidsOf(node)
        .map(textOf)
        .join(BLOCKY.test(node.type) ? " " : "");
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
 * The element `tag`: the caller's (`components`), given `props` and the node, else Markdown's own,
 * `own` or the tag itself with `props` and its `looks`.
 */
const part = <T extends MarkdownElement>(
  shared: Shared,
  tag: T,
  node: Node,
  props: ComponentProps<T>,
  looks: readonly (stylex.StyleXStyles | false)[],
  own?: ReactElement
): ReactElement => {
  // SAFETY: `components` maps each tag to a part that takes that tag's props and the node.
  const Custom = shared.components[tag] as
    | ComponentType<ComponentProps<T> & { node: Node }>
    | undefined;
  if (Custom !== undefined) {
    return <Custom {...props} node={node} />;
  }
  return own ?? createElement(tag, { ...props, ...stylex.props(...looks) });
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
 * A link or a picture whose address can still change: a picture is nothing yet; a link its words,
 * keeping the room its arrow will take when it is Markdown's own (keepsRoom).
 */
const held = (
  url: string | undefined,
  shared: Shared,
  tail: string,
  children: ReactNode
): ReactNode => {
  if (url === "streamdown:incomplete-image") {
    return null;
  }
  return keepsRoom(url, shared, tail) ? (
    <>
      <span aria-hidden="true" {...stylex.props(styles.linkLead)} />
      {children}
      <span aria-hidden="true" {...stylex.props(styles.arrowRoom)} />
    </>
  ) : (
    children
  );
};

/**
 * A link or a picture: the host's, else the caller's `a` or `img`, else Markdown's own Link where
 * the address may lead, else its words. Never while its address can change: a half link or picture,
 * a reference not yet defined, a bare address (its words start where it does) in the word still
 * being written; nor inside a link.
 */
const Anchor = ({
  node,
  shared,
  children,
}: Omit<Part<Linked>, "kids">): ReactNode => {
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
    return held(found?.url, shared, tail, children);
  }
  const link = linkOf(node, found.url, found.title, children);
  const drawn = shared.renderLink?.(link);
  const hosted = drawn === undefined ? shared.provided?.(link) : drawn;
  const href = safeHref(parse.encodedHref(found.url), { relative: true });
  return hosted !== undefined || href === null
    ? (hosted ?? children)
    : leadTo(node, link, href, shared.components);
};
/** Where a note's mark is: the place of its block and where it starts in it. */
const markId = (prefix: string, place: string, node: Node) =>
  `${prefix}-ref-${place}-${node.position?.start.offset ?? 0}`;
/** A note in the answer's notes: its number, whether it has come and its marks' ids. */
const useNote = (name: string) => {
  const [prefix = "", ...notes] = use(Notes).split("\n");
  const index = notes.findIndex((line) => line.endsWith(` ${name}`));
  const [head = ""] = notes[index]?.split(" ") ?? [];
  const marks = head
    .slice(1)
    .split(",")
    .filter((mark) => mark !== "");
  return { prefix, number: index + 1, come: head.startsWith("+"), marks };
};
/** A note's mark: its number, leading to the note once the note has come. */
const NoteMark = ({
  node,
  shared,
}: Omit<Part<Of<"footnoteReference">>, "kids">) => {
  const words = useI18n().markdown;
  const { prefix, number, come } = useNote(node.identifier);
  const place = use(At);
  if (number === 0) {
    return `[^${node.label ?? node.identifier}]`;
  }
  const shown = <span aria-label={words.footnote(number)}>{number}</span>;
  return (
    <sup {...stylex.props(styles.footnoteMark)}>
      <span id={markId(prefix, place, node)}>
        {come && shared.inLink !== true ? (
          <Link href={`#${prefix}-fn-${number}`}>{shown}</Link>
        ) : (
          shown
        )}
      </span>
    </sup>
  );
};
/** A list item's or a note's blocks: a paragraph is its words, followed by `after`. */
const body = (nodes: readonly Node[], kids: Kids, after?: ReactElement) => (
  <div {...stylex.props(styles.itemBody)}>
    {nodes.map((child, at) => (
      <Fragment key={at}>
        {child.type === "paragraph" ? (
          <span>
            {kids(child.children, PHRASE)}
            {after !== undefined && " "}
            {after}
          </span>
        ) : (
          kids([child])
        )}
      </Fragment>
    ))}
    {!nodes.some((child) => child.type === "paragraph") && after}
  </div>
);
/** A note at the foot, leading back to each of its marks: `↩`, `↩²`. */
const Note = ({
  node,
  kids,
}: Omit<Part<Of<"footnoteDefinition">>, "shared">) => {
  const words = useI18n().markdown;
  const { prefix, number, marks } = useNote(node.identifier);
  const back = marks.length > 0 && (
    <>
      {marks.map((mark, at) => (
        <Fragment key={mark}>
          {at > 0 && " "}
          <Link href={`#${mark}`} aria-label={words.back(number, at + 1)}>
            ↩{at > 0 && <sup>{at + 1}</sup>}
          </Link>
        </Fragment>
      ))}
    </>
  );
  return (
    <li value={number} id={`${prefix}-fn-${number}`}>
      {body(node.children, kids, back === false ? undefined : back)}
    </li>
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

// A table is named by the heading above it; a row draws its own cells, as many as the head's. One
// from a model has no bound: at most 1,000 rows are drawn, and a line says how many more.
const MOST_ROWS = 1000;
const TableBlock = ({ node, shared, kids, name }: Part<Of<"table">>) => {
  const words = useI18n().markdown;
  const [head, ...rows] = node.children;
  const sides = { left: "start", right: "end", center: "center" } as const;
  const align = (head?.children ?? []).map(
    (_, at) => sides[node.align?.[at] ?? "left"]
  );
  const row = (cells: Row | undefined, tag: "th" | "td") => {
    const Cell = tag === "th" ? Tables.TableHead : Tables.TableCell;
    const drawn = cells?.children.slice(0, align.length).map((cell, at) => {
      const children = kids(cell.children, PHRASE);
      const props = { align: node.align?.[at] ?? undefined, children };
      const own = <Cell align={align[at]}>{children}</Cell>;
      return (
        <Fragment key={at}>{part(shared, tag, cell, props, [], own)}</Fragment>
      );
    });
    const own = <Tables.TableRow>{drawn}</Tables.TableRow>;
    return cells && part(shared, "tr", cells, { children: drawn }, [], own);
  };
  const top = row(head, "th");
  const lines = rows
    .slice(0, MOST_ROWS)
    .map((cells, at) => <Fragment key={at}>{row(cells, "td")}</Fragment>);
  const label = name ?? words.table;
  const header = <Tables.TableHeader>{top}</Tables.TableHeader>;
  const children = (
    <>
      {part(shared, "thead", node, { children: top }, [], header)}
      {part(
        shared,
        "tbody",
        node,
        { children: lines },
        [],
        <Tables.TableBody>{lines}</Tables.TableBody>
      )}
    </>
  );
  const more =
    Math.max(rows.length - MOST_ROWS, 0) +
    ("more" in node ? Number(node.more) : 0);
  const own = (
    <>
      <Tables.Table aria-label={label} streaming={shared.greedy}>
        {children}
      </Tables.Table>
      {more > 0 && <p {...stylex.props(styles.more)}>{words.moreRows(more)}</p>}
    </>
  );
  return part(
    shared,
    "table",
    node,
    { "aria-label": label, children },
    [],
    own
  );
};
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
  const [tag, look] = MARKS[node.type];
  return part(shared, tag, node, { children: kids(node.children) }, [look]);
};
const anchor = (node: Linked, shared: Shared, kids: Kids) => (
  <Anchor node={node} shared={shared}>
    {"children" in node
      ? kids(node.children, { inLink: true })
      : (node.alt ?? "")}
  </Anchor>
);
// A word with what follows it; in scripts written without spaces (Chinese, Japanese, Korean, and
// their punctuation), each character, as Streamdown animates them.
const WORDS =
  /[\p{sc=Han}\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Hangul}\u3000-\u303F\uFF00-\uFFEF]\s*|[^\s\p{sc=Han}\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Hangul}\u3000-\u303F\uFF00-\uFFEF]+\s*|\s+/gu;
/**
 * Words that may fade in: each its own fade while written, but not in a link (its words move into
 * the link when it is whole, and would fade again there). Past many words in the block still being
 * written, the words read since its last read fade as one, and the rest stand.
 */
const Words = ({
  value,
  shared,
  from,
}: {
  value: string;
  shared: Shared;
  from: number;
}) => {
  const fresh = use(Fresh);
  if (!shared.streaming || shared.inLink === true) {
    return value;
  }
  if (fresh >= 0) {
    const cut = Math.min(Math.max(fresh - from, 0), value.length);
    return (
      <>
        {value.slice(0, cut)}
        <span key={fresh} {...stylex.props(fadeIn, styles.word)}>
          {value.slice(cut)}
        </span>
      </>
    );
  }
  return value.match(WORDS)?.map((word, at) => (
    <span key={at} {...stylex.props(fadeIn, styles.word)}>
      {word}
    </span>
  ));
};
const framed = new Set(["code", "table", "thematicBreak"]);
/** A block in the answer's column: a framed one fades in whole while written; a section is its own. */
const Placed = ({
  node,
  shared,
  children,
}: {
  node: Node;
  shared: Shared;
  children: ReactElement;
}) =>
  node.type === "section" ? (
    children
  ) : (
    <div {...stylex.props(shared.streaming && framed.has(node.type) && fadeIn)}>
      {children}
    </div>
  );

/**
 * A section (parse.ts): the chevron before its summary, its blocks under the summary's first letter,
 * closed until it is opened. The toggle is named by the summary's words and says whether it is open.
 */
const SectionBlock = ({ node, shared, kids }: Part<parse.Section>) => {
  const id = useId();
  const place = use(At);
  const [words] = parse.readBlock(node.summary);
  return (
    <Collapsible asChild defaultOpen={node.open}>
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
          {words?.type === "paragraph" && kids(words.children, PHRASE)}
        </div>
        <CollapsibleContent asChild>
          <div {...stylex.props(sectionStyles.under)}>
            <div {...stylex.props(sectionStyles.body)}>
              {node.children.map((child, at) => (
                <Placed key={at} node={child} shared={shared}>
                  {/* oxlint-disable-next-line react/jsx-no-constructed-context-values -- a string */}
                  <At value={`${place}.${at}`}>{kids([child])}</At>
                </Placed>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

const headings = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
const headingLooks = {
  default: [styles.major, styles.minor],
  message: [styles.major, styles.minor],
  sm: [styles.smallMajor, styles.smallMinor],
  xs: [styles.xsHeading, styles.xsHeading],
};
const draw: { [T in Node["type"]]?: Draw<T> } = {
  text: (node, shared) => {
    const from = node.position?.start.offset ?? 0;
    const lines = shared.softBreaks ? node.value.split("\n") : [node.value];
    return lines.map((line, at) => (
      <Fragment key={at}>
        {at > 0 && <br />}
        <Words value={line} shared={shared} from={from} />
      </Fragment>
    ));
  },
  strong: mark,
  emphasis: mark,
  delete: mark,
  inlineCode: (node, shared) =>
    part(shared, "code", node, { children: node.value }, [
      styles.inlineCode,
      shared.size === "xs" && styles.xsCode,
    ]),
  break: () => <br />,
  link: anchor,
  linkReference: anchor,
  image: anchor,
  imageReference: anchor,
  footnoteReference: (node, shared) => <NoteMark node={node} shared={shared} />,
  footnoteDefinition: (node, shared, kids) =>
    shared.notes === true && <Note node={node} kids={kids} />,
  html: (node, shared) =>
    shared.phrase === true ? (
      <span {...stylex.props(styles.raw)}>{node.value}</span>
    ) : (
      <p {...stylex.props(styles.paragraph, styles.raw)}>{node.value}</p>
    ),
  paragraph: (node, shared, kids) =>
    part(shared, "p", node, { children: kids(node.children, PHRASE) }, [
      styles.paragraph,
      shared.greedy && styles.greedy,
    ]),
  heading: (node, shared, kids) => {
    // From the caller's level on; the look is a step up for the first two depths.
    const { depth } = node;
    const tag =
      headings[Math.min(shared.headingLevel - 1 + depth, 6) - 1] ?? "h6";
    const look = headingLooks[shared.size][depth <= 2 ? 0 : 1];
    return part(shared, tag, node, { children: kids(node.children, PHRASE) }, [
      styles.heading,
      look,
      shared.greedy && styles.greedy,
    ]);
  },
  list: (node, shared, kids) => {
    const children = kids(node.children);
    const start = node.start ?? undefined;
    return node.ordered === true
      ? part(shared, "ol", node, { start, children }, [
          styles.list,
          styles.ordered,
        ])
      : part(shared, "ul", node, { children }, [styles.list, styles.unordered]);
  },
  listItem: (node, shared, kids) => {
    const task = typeof node.checked === "boolean";
    const children = (
      <>
        {task && <TaskBox done={node.checked === true} />}
        {body(node.children, kids)}
      </>
    );
    return part(shared, "li", node, { children }, [
      styles.item,
      task && styles.task,
    ]);
  },
  blockquote: (node, shared, kids) =>
    part(shared, "blockquote", node, { children: kids(node.children) }, [
      styles.quote,
    ]),
  thematicBreak: (node, shared) =>
    part(shared, "hr", node, {}, [], <Separator />),
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
  section: (node, shared, kids) => (
    <SectionBlock node={node} shared={shared} kids={kids} />
  ),
};
const Drawn = ({ node, shared, name }: Omit<Part<Node>, "kids">): ReactNode => {
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
const useStarts = (source: string) => {
  const [cut, setCut] = useState({ source: "", cut: parse.blockStarts("") });
  if (cut.source === source) {
    return cut.cut.starts;
  }
  const next = parse.blockStarts(
    source,
    source.startsWith(cut.source) ? cut.cut : undefined
  );
  setCut({ source, cut: next });
  return next.starts;
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
/** Each block with its place (`3`, and `3.1` for the second block of a section in the fourth). */
const placesOf = (
  blocks: readonly Node[],
  at = ""
): (readonly [string, Node])[] =>
  blocks.flatMap((block, index) => {
    const place = at === "" ? String(index) : `${at}.${index}`;
    return block.type === "section"
      ? placesOf(block.children, place)
      : [[place, block]];
  });
const DEFINED =
  /^[ \t>]*\[(?<note>\^?)(?<label>(?:[^\]\\\n]|\\.){1,999})\]:/gmu;
/**
 * The names an answer defines (parse.ts, `Names`): in the blocks read, and at a line's start in
 * the block still being written.
 */
const namesIn = (blocks: readonly Node[], writing: string) => {
  const all = placesOf(blocks).flatMap(([, block]) => foundIn(block));
  // A link's definition counts once its line is whole (its address may still grow); a note's once
  // its name is.
  const whole = writing.slice(0, writing.lastIndexOf("\n") + 1);
  const of = (type: string, note: string, text: string) => [
    ...all.flatMap((node) =>
      node.type === type && "identifier" in node ? [node.identifier] : []
    ),
    ...[...text.matchAll(DEFINED)].flatMap(({ groups }) =>
      groups?.note === note
        ? [(groups.label ?? "").replaceAll(/\s+/gu, " ").trim().toLowerCase()]
        : []
    ),
  ];
  return {
    links: of("definition", "", whole),
    notes: of("footnoteDefinition", "^", writing),
  };
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
        if (node.type === "table") {
          return names[from + at] ?? words.table;
        }
        if (node.type === "section") {
          return node.summary;
        }
        return FOUND.test(node.type) || node.type === "code"
          ? ""
          : textOf(node).trim();
      })
      .filter((text) => text !== "")
      .join(" ");
    if (said !== "") {
      announce(said);
    }
  }, [blocks, finished, live, names, words.table]);
};
// While written, a table's head waits for its row of dashes. A last
// line that is only the start of a block's mark waits for the characters that decide it: a list's
// number or bullet, a task's box, a heading's, rule's or underline's marks, a note's start, a link's
// definition (never drawn), the start of a section's `<details>` or `</details>`. So do a bracket
// still to be a link, and a mark of emphasis or code, at the very end.
const PIPE = /^ {0,3}\|/u;
const DASHES = /^ {0,3}\|?[ \t]*:?-+:?[ \t]*(?:\||$)/mu;
const CONTAINERS = /^(?:[ \t>]|[-*+](?=[ \t])|\d{1,9}[.)](?=[ \t]))*/u;
const UNDECIDED =
  /^(?:[-*+]|\d{1,9}[.)]?|(?:[-*+=_][ \t]*)+|#{1,6}|\[[ xX]?\]?|\[\^[^\]\s]*\]?:?|\[(?!\^)(?:[^\]\\]|\\.){1,999}\]:.*|<\/?(?:d(?:e(?:t(?:a(?:i(?:ls?)?)?)?)?)?)?)?[ \t]*$/u;
/** `end` less what waits; each pattern is anchored or found from the end, so none scans back. */
const lessWaiting = (end: string) => {
  const note = end.lastIndexOf("[^");
  let to = note !== -1 && !/[\]\s]/u.test(end.slice(note)) ? note : end.length;
  // In code still open, every character is code.
  if (parse.inOpenFence(end)) {
    return end;
  }
  // Twice at most: a bracket's pair, then the marks before it (`**[words]`).
  for (let round = 0; round < 2; round += 1) {
    while (to > 0 && "*_~`[ \t".includes(end.charAt(to - 1))) {
      to -= end.slice(to - 2, to) === "![" ? 2 : 1;
    }
    const bracket = end.lastIndexOf("[", to - 1);
    to = /^\[[^\]]*\]$/u.test(end.slice(bracket, to)) ? bracket : to;
  }
  const line = end.lastIndexOf("\n", to - 1) + 1;
  const last = end.slice(line, to);
  const rest = last.replace(CONTAINERS, "");
  const undecided = last.trim() !== "" && (rest === "" || UNDECIDED.test(rest));
  return end.slice(0, undecided ? line : to);
};
/** The last word of `text`: a bare address in it may still grow. */
const lastWord = (text: string) =>
  text.slice(
    Math.max(...[" ", "\n", "\t"].map((c) => text.lastIndexOf(c))) + 1
  );
const MANY_WORDS = 1000;
/**
 * The block still being written, read again as it grows: at once while that is quick, and once it
 * takes long, when four times its last read has passed since, so reading takes at most a fifth of
 * the time and new words come about every 100 ms however big it is. Its words since the last read
 * fade as one past 1,000 words (`fresh`, where that read ended).
 */
const useEnding = (whole: string, paced: boolean, read: () => Block[]) => {
  const [last, setLast] = useState<{
    whole: string;
    nodes: Block[];
    next: number;
    fresh: number;
  }>({ whole: "", nodes: [], next: 0, fresh: -1 });
  const goesOn = paced && last.whole !== "" && whole.startsWith(last.whole);
  useLayoutEffect(() => {
    const again = () => {
      const start = performance.now();
      const nodes = read();
      const now = performance.now();
      const words = whole.split(/\s+/u).length;
      const fresh = words > MANY_WORDS ? last.whole.length : -1;
      setLast({ whole, nodes, next: now + (now - start) * 4, fresh });
    };
    const stale = goesOn && whole !== last.whole;
    const wait = stale ? last.next - performance.now() : Number.NaN;
    if (wait <= 0) {
      again();
    }
    const timer = wait > 0 ? setTimeout(again, wait) : undefined;
    return () => {
      clearTimeout(timer);
    };
  });
  if (goesOn) {
    return last;
  }
  const now = { whole, nodes: read(), next: 0, fresh: -1 };
  if (paced && whole !== last.whole) {
    setLast(now);
  }
  return now;
};

/**
 * The answer's top-level blocks: the finished ones read once, the one still being written made
 * whole (`ending`, how many), and the last word read. Once written, each block is read with the
 * names the whole answer defines, so its references resolve as CommonMark says.
 */
const useBlocks = (
  children: string,
  streaming: boolean,
  truncated: boolean
) => {
  const source = children.replaceAll(/\r\n?/gu, "\n");
  const starts = useStarts(source);
  const open = streaming || truncated;
  const blocks = open ? starts.slice(0, -1) : starts;
  const read = (names?: parse.Names) =>
    blocks.flatMap((start, at) =>
      parse.readBlock(source.slice(start, starts[at + 1]), { names })
    );
  const plain = read();
  let end = source.slice(open ? starts.at(-1) : source.length);
  // Cut off, a link still being written goes; a row waits for its line's end, a head for its dashes.
  const bracket = end.lastIndexOf("[");
  end =
    truncated && bracket > end.lastIndexOf("]") ? end.slice(0, bracket) : end;
  // A table's head waits for its whole row of dashes, and is never drawn as pipes.
  let whole = lessWaiting(end);
  for (let row = 0; row < 2; row += 1) {
    const complete = whole.slice(0, whole.lastIndexOf("\n") + 1);
    const last = whole.lastIndexOf("\n", whole.length - 2) + 1;
    if (DASHES.test(complete) || !PIPE.test(whole.slice(last))) {
      break;
    }
    whole = whole.slice(0, last);
  }
  // Each block is read with the names the answer defines so far, so a reference or a note's mark
  // is one once its definition has come (a whole line of it), and as written until then.
  const names = namesIn(plain, end);
  const said = names.links.length + names.notes.length > 0;
  const done = said ? read(names) : plain;
  const code = streaming ? parse.openCode(end) : null;
  const ending = useEnding(whole, streaming && code === null, () =>
    open && code === null ? parse.readBlock(whole, { open: true, names }) : []
  );
  const nodes = code ?? ending.nodes;
  const definitions = said
    ? placesOf([...done, ...nodes])
        .flatMap(([, block]) => foundIn(block))
        .flatMap((node) => (node.type === "definition" ? [node] : []))
    : NO_DEFINITIONS;
  return {
    all: [...done, ...nodes],
    ending: nodes.length,
    tail: lastWord(ending.whole),
    fresh: ending.fresh,
    definitions,
  };
};

/**
 * The notes, numbered in the order they are first marked, each with its place and its marks
 * outside the notes.
 */
const notesOf = (all: readonly Node[], prefix: string) => {
  const notes = new Map<string, readonly [string, Of<"footnoteDefinition">]>();
  const marks = new Map<string, string[]>();
  for (const [place, block] of placesOf(all)) {
    for (const node of foundIn(block)) {
      if (node.type === "footnoteDefinition" && !notes.has(node.identifier)) {
        notes.set(node.identifier, [place, node]);
      } else if (node.type === "footnoteReference") {
        const ids = marks.get(node.identifier) ?? [];
        marks.set(node.identifier, ids);
        if (block.type !== "footnoteDefinition") {
          ids.push(markId(prefix, place, node));
        }
      }
    }
  }
  const order = [...marks.keys()];
  const lines = order.map(
    (id) =>
      `${notes.has(id) ? "+" : "-"}${(marks.get(id) ?? []).join(",")} ${id}`
  );
  return {
    listed: order.flatMap((id) => {
      const note = notes.get(id);
      return note === undefined ? [] : [note];
    }),
    value: [prefix, ...lines].join("\n"),
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

const NO_COMPONENTS: MarkdownComponents = {};
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
  const notesShared = { ...shared, notes: true };
  const { all, ending, tail, fresh, definitions } = useBlocks(
    children,
    streaming,
    truncated
  );
  const open = streaming || truncated;
  const prefix = useId();
  const notes = notesOf(all, prefix);
  const names = namesOf(all);
  useSaid(all, streaming, live === "polite", names);
  return (
    <div
      data-slot="markdown"
      aria-busy={streaming || undefined}
      {...stylex.props(styles.root, look !== "default" && styles[look], style)}
    >
      <Definitions value={definitions}>
        <Notes value={notes.value}>
          {all.map((node, at) => {
            const writing = open && at >= all.length - ending;
            return FOUND.test(node.type) ? null : (
              <Placed key={at} node={node} shared={shared}>
                {/* oxlint-disable-next-line react/jsx-no-constructed-context-values -- a string */}
                <At value={String(at)}>
                  <Tail value={writing ? tail : ""}>
                    <Fresh value={writing ? fresh : -1}>
                      <Drawn node={node} shared={shared} name={names[at]} />
                    </Fresh>
                  </Tail>
                </At>
              </Placed>
            );
          })}
          {notes.listed.length > 0 && (
            <Tail value={open ? tail : ""}>
              <ol {...stylex.props(styles.footnotes)}>
                {notes.listed.map(([place, note]) => (
                  <At key={note.identifier} value={place}>
                    <Drawn node={note} shared={notesShared} />
                  </At>
                ))}
              </ol>
            </Tail>
          )}
        </Notes>
      </Definitions>
    </div>
  );
};
