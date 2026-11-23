// Markdown on Streamdown (the Tailwind experiment): the same name and props as the system's own
// Markdown, a thin wrapper round the public `streamdown` package with safe settings on by default:
// raw HTML shows as the text it is (no rehype-raw), no picture is loaded (its alt words show), and a
// link leads only to http, https or mailto (a footnote's `#` stays). Fenced code is drawn by the
// system's CodeBlock, links by its Link, tables by its Table, a rule by its Separator; the rest is
// styled by the Tailwind theme.
//
//   <Markdown>{answer}</Markdown>
//   <Markdown streaming>{partial}</Markdown>
//   <Markdown renderLink={(link) => …}>{answer}</Markdown>
//
// While it streams, Streamdown's own repair (remend) closes what is half-written; once it stops it
// is drawn as written (`mode="static"`), so remend never touches a finished answer. Before either,
// the answer is held to the bounds Streamdown has none of (bounds.ts), and a parser failure draws
// the answer as words (an error boundary), never an empty message.
"use client";

import { Component, createContext, use } from "react";
import type { JSX, ReactNode } from "react";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { defaultRehypePlugins, Streamdown } from "streamdown";
import type { Components, ExtraProps, StreamdownProps } from "streamdown";

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "../../components/code-block";
import { Link } from "../../components/link";
import { Separator } from "../../components/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/table";
import { cn } from "../../lib-tw/utils";
import type { LayoutClass } from "../../lib-tw/utils";
import { bounded } from "./bounds";

/** A link in the answer, as the host's renderer sees it. */
export interface MarkdownLink {
  /** The address exactly as the source has it, any scheme. */
  href: string;
  /** The address's scheme, in lower case (`javascript`, `https`); empty for none. */
  scheme: string;
  /** The link's title, when the source gives one. */
  title?: string;
  /** What the link says; for a picture, its alt words. */
  children: ReactNode;
  /** `link` for `[words](url)`, `autolink` for a bare address, `image` for a picture. */
  type: "link" | "image" | "autolink";
}

/** Draws a link in Markdown's place, or gives undefined to leave it to Markdown. */
export type MarkdownLinkRenderer = (link: MarkdownLink) => ReactNode;

/** How a single newline inside a paragraph is drawn. Only `space` is Streamdown's own. */
export type MarkdownSoftBreaks = "space" | "line" | "auto";

/** Every prop a Markdown takes: the system's Markdown's, the same names. */
export interface MarkdownProps {
  /** The Markdown: the agent's answer, or as much of it as has arrived. */
  children: string;
  /** The answer is still being written: Streamdown closes what is half-written at its end. */
  streaming?: boolean;
  /** The answer was cut off part way. Streamdown has no tidy for a cut answer: drawn as written. */
  truncated?: boolean;
  /** How a screen reader hears it while it is written. Streamdown has no live region: kept for the API. */
  live?: "polite" | "off";
  /** `default`, `message`, `sm` or `xs`, as the system's Markdown. */
  size?: "default" | "message" | "sm" | "xs";
  /** The outline level a `#` heading takes; `##` is one deeper, down to `h6`. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Only `space` (CommonMark's) is drawn: Streamdown has no line-break option without a plugin. */
  softBreaks?: MarkdownSoftBreaks;
  /** Fenced code past this many lines is folded under Show more. */
  codeMaxLines?: number | false;
  /** The host draws the answer's links and pictures, before Markdown's own filter. */
  renderLink?: MarkdownLinkRenderer;
  /** Layout only. */
  className?: LayoutClass;
}

const LinkContext = createContext<MarkdownLinkRenderer | null>(null);

/** Lets a part around many answers draw their links (a citation's chip, a router's link). */
export const MarkdownLinkProvider = ({
  renderLink,
  children,
}: {
  renderLink: MarkdownLinkRenderer;
  children: ReactNode;
}) => <LinkContext value={renderLink}>{children}</LinkContext>;

/** The address's scheme as a browser reads it, in lower case; empty for none. */
const schemeOf = (url: string) =>
  /^(?<scheme>[a-z][a-z0-9+.-]*):/iu
    .exec(url.trim())
    ?.groups?.scheme?.toLowerCase() ?? "";

const SAFE = new Set(["http", "https", "mailto"]);
const INCOMPLETE = "streamdown:incomplete-link";

// Sanitized by rehype-sanitize's own schema, every link address kept for the `a` below to judge
// (and the host's renderLink: a citation's `cite:`, a router's path); no rehype-raw (Streamdown then
// escapes raw HTML as text) and no harden.
const footnotes = defaultRehypePlugins.undoubleClobberPrefix;
const rehypePlugins: NonNullable<StreamdownProps["rehypePlugins"]> = [
  [
    rehypeSanitize,
    { ...defaultSchema, protocols: { ...defaultSchema.protocols, href: null } },
  ],
  ...(footnotes === undefined ? [] : [footnotes]),
];

/** Addresses as written: the sanitizer above drops an unsafe one, and no picture is drawn as one. */
const urlTransform = (url: string) => url;

const sizes = {
  default: "gap-4 text-base text-body-foreground",
  message:
    "gap-4 text-(length:--damsko-message-text) leading-(--damsko-message-text-line) text-foreground",
  sm: "gap-3 text-sm text-body-foreground",
  xs: "gap-2 text-(length:--damsko-message-text) leading-(--damsko-message-text-line) text-muted-foreground",
};

const headingSizes = {
  default: ["text-lg", "text-base"],
  message: ["text-lg", "text-base"],
  sm: ["text-base", "text-sm"],
  xs: [
    "text-(length:--damsko-message-text) leading-(--damsko-message-text-line)",
    "text-(length:--damsko-message-text) leading-(--damsko-message-text-line)",
  ],
} as const;

type Size = NonNullable<MarkdownProps["size"]>;
type Props<Tag extends keyof JSX.IntrinsicElements> =
  JSX.IntrinsicElements[Tag] & ExtraProps;

/** The elements Streamdown draws, as the system's parts, for one answer's size and settings. */
const TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

/** The words a hast node holds below it, as a list, whatever it is. */
const childrenOf = (node: unknown): unknown[] =>
  typeof node === "object" &&
  node !== null &&
  "children" in node &&
  Array.isArray(node.children)
    ? node.children
    : [];

/** The words of a hast node, for a code block's source. */
const textOf = (node: unknown): string => {
  if (typeof node !== "object" || node === null) {
    return "";
  }
  if ("value" in node && typeof node.value === "string") {
    return node.value;
  }
  return childrenOf(node).map(textOf).join("");
};

/** A fenced block's language, from its code element's class (`language-ts`). */
const languageOf = (code: unknown): string => {
  const properties =
    typeof code === "object" && code !== null && "properties" in code
      ? code.properties
      : undefined;
  const classes =
    typeof properties === "object" &&
    properties !== null &&
    "className" in properties
      ? properties.className
      : undefined;
  return (
    (Array.isArray(classes) ? classes : [])
      .map(String)
      .find((each) => each.startsWith("language-"))
      ?.slice("language-".length) ?? "text"
  );
};

const componentsFor = (
  size: Size,
  headingLevel: number,
  codeMaxLines: number | false,
  streaming: boolean,
  renderLink: MarkdownLinkRenderer | null
): Components => {
  const heading = (depth: number) => {
    const Heading = ({ children }: Props<"h1">) => {
      const Tag = TAGS[Math.min(5, headingLevel + depth - 2)] ?? "h6";
      return (
        <Tag
          className={cn(
            "text-foreground m-0 font-medium text-balance",
            depth === 1 ? headingSizes[size][0] : headingSizes[size][1]
          )}
        >
          {children}
        </Tag>
      );
    };
    Heading.displayName = `MarkdownHeading${depth}`;
    return Heading;
  };
  return {
    h1: heading(1),
    h2: heading(2),
    h3: heading(3),
    h4: heading(4),
    h5: heading(5),
    h6: heading(6),
    p: ({ children }: Props<"p">) => (
      <p className={cn("m-0", streaming ? "text-wrap" : "text-pretty")}>
        {children}
      </p>
    ),
    strong: ({ children }: Props<"strong">) => (
      <strong className="text-foreground font-medium">{children}</strong>
    ),
    em: ({ children }: Props<"em">) => <em className="italic">{children}</em>,
    del: ({ children }: Props<"del">) => (
      <del className="text-muted-foreground line-through">{children}</del>
    ),
    inlineCode: ({ children }: Props<"code">) => (
      <code
        className={cn(
          "corner-squircle bg-code-bg text-foreground isolate rounded-sm px-1 font-mono [direction:ltr]",
          size === "xs"
            ? "text-[calc(var(--damsko-message-text)*0.92)]"
            : "text-(length:--damsko-text-sm)"
        )}
      >
        {children}
      </code>
    ),
    // Fenced code: the system's CodeBlock, its words read from the tree Streamdown drew.
    pre: ({ node }: Props<"pre">) => {
      const [code] = childrenOf(node);
      const language = languageOf(code);
      const value = textOf(code).replace(/\n$/u, "");
      return (
        <CodeBlock language={language} streaming={streaming}>
          <CodeBlockHeader>
            <CodeBlockTitle />
            <CodeBlockActions>
              <CodeBlockCopyButton value={value} />
            </CodeBlockActions>
          </CodeBlockHeader>
          <CodeBlockContent lineNumbers maxLines={codeMaxLines}>
            {value}
          </CodeBlockContent>
        </CodeBlock>
      );
    },
    ul: ({ children }: Props<"ul">) => (
      <ul className="m-0 flex list-disc flex-col gap-1 ps-6">{children}</ul>
    ),
    ol: ({ children, start }: Props<"ol">) => (
      <ol start={start} className="m-0 flex list-decimal flex-col gap-1 ps-6">
        {children}
      </ol>
    ),
    li: ({ children }: Props<"li">) => (
      <li className="marker:text-muted-foreground ps-1">{children}</li>
    ),
    // A task's box: read only, in Checkbox's look, never a control.
    input: ({ checked, type }: Props<"input">) =>
      type === "checkbox" ? (
        <span
          aria-hidden="true"
          data-checked={checked === true ? "" : undefined}
          className="corner-squircle data-checked:bg-primary me-2 inline-block size-(--damsko-checkbox-box) rounded-xs align-[-2px] shadow-[inset_0_0_0_1px_var(--damsko-control-border)] data-checked:shadow-none"
        />
      ) : null,
    blockquote: ({ children }: Props<"blockquote">) => (
      <blockquote className="border-border text-muted-foreground m-0 flex flex-col gap-2 border-s-2 border-solid ps-4">
        {children}
      </blockquote>
    ),
    hr: () => <Separator />,
    table: ({ children }: Props<"table">) => <Table>{children}</Table>,
    thead: ({ children }: Props<"thead">) => (
      <TableHeader>{children}</TableHeader>
    ),
    tbody: ({ children }: Props<"tbody">) => <TableBody>{children}</TableBody>,
    tr: ({ children }: Props<"tr">) => <TableRow>{children}</TableRow>,
    th: ({ children }: Props<"th">) => <TableHead>{children}</TableHead>,
    td: ({ children }: Props<"td">) => <TableCell>{children}</TableCell>,
    // A picture is never loaded: its alt words, unless the host draws it.
    img: ({ alt, src }: Props<"img">): ReactNode => {
      const drawn = renderLink?.({
        href: typeof src === "string" ? src : "",
        scheme: schemeOf(typeof src === "string" ? src : ""),
        children: alt,
        type: "image",
      });
      return drawn === undefined ? <span>{alt}</span> : drawn;
    },
    a: ({ href = "", title, children }: Props<"a">): ReactNode => {
      // Still being written: words until its address is whole.
      if (href === INCOMPLETE) {
        return <span>{children}</span>;
      }
      const text = typeof children === "string" ? children : "";
      const drawn = renderLink?.({
        href,
        scheme: schemeOf(href),
        title,
        children,
        type: text === href || `mailto:${text}` === href ? "autolink" : "link",
      });
      if (drawn !== undefined) {
        return drawn;
      }
      if (href.startsWith("#")) {
        return <Link href={href}>{children}</Link>;
      }
      return SAFE.has(schemeOf(href)) ? (
        <Link href={href} external={!href.startsWith("mailto:")}>
          {children}
        </Link>
      ) : (
        <span>{children}</span>
      );
    },
  };
};

/** A parser that fails draws the answer as its own words: an answer is always drawn. */
class Fallback extends Component<
  { source: string; children: ReactNode },
  { failed: boolean }
> {
  constructor(props: { source: string; children: ReactNode }) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override render(): ReactNode {
    return this.state.failed ? (
      <p className="m-0 whitespace-pre-wrap">{this.props.source}</p>
    ) : (
      this.props.children
    );
  }
}

/** An agent's answer, drawn from Markdown by Streamdown, safely. */
export const Markdown = ({
  children,
  streaming = false,
  size = "default",
  headingLevel = 1,
  codeMaxLines = 18,
  renderLink,
  className,
}: MarkdownProps) => {
  const provided = use(LinkContext);
  const source = bounded(children);
  return (
    <Fallback key={source.length === 0 ? "empty" : "answer"} source={children}>
      <Streamdown
        mode={streaming ? "streaming" : "static"}
        isAnimating={streaming}
        parseIncompleteMarkdown={streaming}
        rehypePlugins={rehypePlugins}
        urlTransform={urlTransform}
        linkSafety={{ enabled: false }}
        controls={false}
        components={componentsFor(
          size,
          headingLevel,
          codeMaxLines,
          streaming,
          renderLink ?? provided
        )}
        className={cn(
          "flex min-w-0 flex-col space-y-0 font-sans wrap-anywhere whitespace-normal",
          sizes[size],
          className
        )}
      >
        {source}
      </Streamdown>
    </Fallback>
  );
};
