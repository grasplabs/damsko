// Sources: what an answer drew on, folded under it, after shadcn's Sources pattern (apps/v4/content/
// docs/ai-elements/base/sources.mdx), built as shadcn builds it: a Trace with a TraceCollapsible, its
// trigger a TraceLine, and under it a Trace of sources, each a TraceLine in a link. Folded, the
// trigger's title is a pile, the first sources' marks overlapping in a row, then the count ("3
// sources"). Pressed, the list opens under it: one line per source, its mark, its title, and where
// it lives.
// Adapted from shadcn/ui (MIT), see THIRD_PARTY_NOTICES.md.
//
//   <Sources>
//     <SourcesTrigger count={2}>
//       <SourceIcon><Icon icon={FilePdfIcon} /></SourceIcon>
//       <SourceIcon><Icon icon={GlobeIcon} /></SourceIcon>
//     </SourcesTrigger>
//     <SourcesContent>
//       <Source title="Churn by region, Q3" origin="Finance / Reports" href="/files/churn-q3">
//         <SourceIcon><Icon icon={FilePdfIcon} /></SourceIcon>
//       </Source>
//       <Source title="Pricing page" href="https://example.com/pricing">
//         <SourceIcon><Icon icon={GlobeIcon} /></SourceIcon>
//       </Source>
//     </SourcesContent>
//   </Sources>
//
// The trigger is a button named by its count, whose `aria-expanded` says whether the list is open;
// Enter and Space open and close it, and focus stays on it. The list is a list, named, and each
// source is a link round its line that opens it in a new tab (and says so to a screen reader), or a
// button that runs `onOpen` when it has nowhere to go. Where a source lives is read from its checked
// address: a link to another site shows that site's host, never the caller's words, so a source
// cannot name one site and lead to another; `origin` says where a source lives only when its
// address names no host (a path on this site, or none). A source the person cannot open (`locked`)
// or that could not be opened (`gone`) says so and is not a link. The marks are the product's:
// SourceIcon holds whatever it maps a source to (an icon, a favicon, a portrait). Every value is a
// token.
"use client";

import * as stylex from "@stylexjs/stylex";
import { createContext, use } from "react";
import type { ReactNode } from "react";

import { useI18n } from "../lib/i18n";
import { Icon, LockIcon } from "../lib/icons";
import { focusRing, tileEdge, visuallyHidden } from "../lib/styles";
import { colors, duration, media, radius, size } from "../lib/tokens.stylex";
import { citedSource, safeHref } from "../lib/utils";
import type { LayoutStyle } from "../lib/utils";
import { iconVars } from "../lib/vars.stylex";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "./trace";

/** Whether the person can open a source: `open`, `locked` (it is there, but not for them) or `gone`. */
export type SourceAccess = "open" | "locked" | "gone";

// Every prop is documented once, where it is first declared; the props on the docs page are read
// from the types below, so they cannot drift from what the code accepts.

/** Every prop Sources takes. */
export interface SourcesProps {
  /** Its SourcesTrigger, then its SourcesContent. */
  children: ReactNode;
  /** Whether the list is open. Pass it with `onOpenChange` to control it. */
  open?: boolean;
  /**
   * Whether the list starts open, when you do not control it.
   * @default false
   */
  defaultOpen?: boolean;
  /** Runs with the new state when the trigger is pressed. */
  onOpenChange?: (open: boolean) => void;
  /** Where it sits and how wide it is. */
  style?: LayoutStyle;
}

/** Every prop a SourcesTrigger takes. */
export interface SourcesTriggerProps {
  /** How many sources the answer drew on: the trigger says it ("3 sources"). */
  count: number;
  /**
   * The marks in the pile, before the count: a SourceIcon for each of the first few sources (up to
   * five read well). With `asChild`, the one element drawn as the trigger.
   */
  children?: ReactNode;
  /**
   * Draws its one child element as the trigger, with the trigger's behaviour and none of its look.
   * @default false
   */
  asChild?: boolean;
  /** Where it sits. */
  style?: LayoutStyle;
}

/** Every prop a SourcesContent takes. */
export interface SourcesContentProps {
  /** Its Source lines, in the order the answer used them. */
  children: ReactNode;
  /** Where it sits and how wide it is. */
  style?: LayoutStyle;
}

/** Every prop a Source takes. */
export interface SourceProps {
  /** Its title, as the thing calls itself ("Churn by region, Q3"): the link's words. */
  title: string;
  /**
   * Where it opens, in a new tab: an http, https or mailto address, or a path on this site. Any
   * other (`javascript:`, `data:`, `//elsewhere`) leads nowhere and the title is words, as a link
   * in Markdown is. Leave it out for a source with nowhere to go. An address on another site shows
   * its host after the title.
   */
  href?: string;
  /**
   * Runs when the person opens it. With `href` the link still goes there; without, the line is a
   * button that only runs this.
   */
  onOpen?: () => void;
  /**
   * Where it lives, in a few quiet words ("Finance / Reports"), for a source whose address names no
   * host: a path on this site, or none. A link to another site shows that site's host instead.
   */
  origin?: string;
  /**
   * Whether the person can open it. `locked` says it is there but not for them; `gone` that it
   * could not be opened. Neither is a link.
   * @default "open"
   */
  access?: SourceAccess;
  /** Its mark: a SourceIcon. */
  children?: ReactNode;
  /** Where it sits and how wide it is. */
  style?: LayoutStyle;
}

/** Every prop a SourceIcon takes. */
export interface SourceIconProps {
  /** What stands on the tile: an `<Icon />`, a site's favicon, a portrait. */
  children: ReactNode;
  /** Where it sits. */
  style?: LayoutStyle;
}

const HOVER = media.hover;

const styles = stylex.create({
  // The pile in the trigger's title: the first mark at the line's start, each next one over the
  // one before.
  marks: {
    display: "inline-flex",
    alignItems: "center",
    verticalAlign: "middle",
    paddingInlineStart: size.sourcesPileOverlap,
    marginInlineEnd: size.sourcesPileOverlap,
  },
  // "6 sources" is one label: it never breaks between the number and the word.
  count: { whiteSpace: "nowrap" },
  list: { display: "grid", minWidth: 0 },
  // A source that opens: the link or button round its line, as wide as its line, its words in ink
  // under the pointer.
  press: {
    display: "flex",
    justifySelf: "start",
    maxWidth: "100%",
    minWidth: 0,
    margin: 0,
    padding: 0,
    borderWidth: 0,
    borderRadius: radius.mark,
    backgroundColor: "transparent",
    color: {
      default: "inherit",
      ":hover": { default: null, [HOVER]: colors.foreground },
    },
    fontFamily: "inherit",
    fontSize: "inherit",
    lineHeight: "inherit",
    letterSpacing: "inherit",
    textAlign: "start",
    textDecoration: "none",
    cursor: "pointer",
    transitionProperty: "color",
    transitionDuration: duration.hover,
    transitionTimingFunction: duration.ease,
  },
  // Locked: a picture only after the title; the words after it say the person cannot open it.
  lock: {
    [iconVars.size]: size.sourcesMarkInline,
    display: "inline-flex",
    verticalAlign: "-2px",
    marginInlineStart: `calc(${size.sourcesPileOverlap} / 2)`,
  },
  gone: { color: colors.destructive },
  tile: {
    position: "relative",
    display: "inline-grid",
    placeItems: "center",
    flexShrink: 0,
    boxSizing: "border-box",
    overflow: "hidden",
    cornerShape: radius.shape,
    color: colors.bodyForeground,
  },
  // In a line: the mark alone, in the line's mark seat.
  tileLine: {
    width: size.iconSm,
    height: size.iconSm,
    borderRadius: radius.mark,
    color: "inherit",
  },
  tilePile: {
    [iconVars.size]: size.sourcesMarkInline,
    [iconVars.stroke]: size.iconStroke,
    width: size.sourcesPileMark,
    height: size.sourcesPileMark,
    marginInlineStart: `calc(-1 * ${size.sourcesPileOverlap})`,
    borderRadius: radius.mark,
    backgroundColor: colors.card,
  },
  // Locked or gone: the mark stays, quieter.
  tileQuiet: { color: colors.subtleForeground, opacity: 0.72 },
});

// A SourceIcon in the trigger's pile, not a line: larger, on a tile, overlapping the one before.
const PileContext = createContext(false);
// The access of the Source a SourceIcon is in: a locked or gone source's mark is quieter.
const AccessContext = createContext<SourceAccess>("open");

/** The sources one answer drew on: a Trace whose one row opens on the list. */
export const Sources = ({
  children,
  open,
  defaultOpen,
  onOpenChange,
  style,
}: SourcesProps) => (
  <Trace style={style}>
    <TraceCollapsible
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {children}
    </TraceCollapsible>
  </Trace>
);

/** The trigger: the pile of the first sources' marks and the count. Pressing it opens and closes the list. */
export const SourcesTrigger = ({
  count,
  children,
  asChild = false,
  style,
}: SourcesTriggerProps) => {
  const words = useI18n().sources;
  if (asChild) {
    return (
      <TraceCollapsibleTrigger asChild style={style}>
        {children}
      </TraceCollapsibleTrigger>
    );
  }
  return (
    <TraceCollapsibleTrigger style={style}>
      <TraceLine>
        <TraceTitle>
          {children !== undefined && (
            <span aria-hidden="true" {...stylex.props(styles.marks)}>
              <PileContext value>{children}</PileContext>
            </span>
          )}
          <span {...stylex.props(styles.count)}>{words.count(count)}</span>
        </TraceTitle>
      </TraceLine>
    </TraceCollapsibleTrigger>
  );
};

/** The list the trigger opens: one Source per line. The browser's find opens it when it holds the words found. */
export const SourcesContent = ({ children, style }: SourcesContentProps) => {
  const words = useI18n().sources;
  return (
    <TraceCollapsibleContent style={style}>
      <div
        role="list"
        aria-label={words.heading}
        data-slot="sources-content"
        {...stylex.props(styles.list)}
      >
        <Trace>{children}</Trace>
      </div>
    </TraceCollapsibleContent>
  );
};

/** One source: a line with its mark, its title and where it lives, in a link or a button that opens it. */
export const Source = ({
  title,
  href,
  onOpen,
  origin,
  access = "open",
  children,
  style,
}: SourceProps) => {
  const words = useI18n().sources;
  // The address comes from a model or a tool: only one that leads somewhere safe is a link, and
  // where it lives is read from it, never taken from the caller's words for another site.
  const safe = safeHref(href, { relative: true });
  const host = citedSource(href)?.host;
  const where = host ?? (origin === "" ? undefined : origin);
  const live = access === "open" && (safe !== null || onOpen !== undefined);
  let note: ReactNode = where;
  if (access === "gone") {
    note = (
      <span {...stylex.props(styles.gone)}>
        {where === undefined ? words.gone : `${where}. ${words.gone}`}
      </span>
    );
  } else if (access === "locked") {
    note = where === undefined ? words.locked : `${where} · ${words.locked}`;
  }
  const line = (
    <TraceLine style={style}>
      <TraceIcon>
        <AccessContext value={access}>{children}</AccessContext>
      </TraceIcon>
      <TraceTitle>
        <span data-slot="source-title">{title}</span>
        {access === "locked" && (
          <span aria-hidden="true" {...stylex.props(styles.lock)}>
            <Icon icon={LockIcon} />
          </span>
        )}
      </TraceTitle>
      {note !== undefined && <TraceDescription>{note}</TraceDescription>}
      {safe !== null && live && (
        <span {...stylex.props(visuallyHidden)}> {words.newTab}</span>
      )}
    </TraceLine>
  );
  let press: ReactNode = line;
  if (live && safe !== null) {
    press = (
      <a
        href={safe}
        target="_blank"
        rel="noreferrer"
        data-slot="source-link"
        onClick={onOpen}
        {...stylex.props(styles.press, focusRing)}
      >
        {line}
      </a>
    );
  } else if (live) {
    press = (
      <button
        type="button"
        data-slot="source-link"
        onClick={onOpen}
        {...stylex.props(styles.press, focusRing)}
      >
        {line}
      </button>
    );
  }
  return (
    <div role="listitem" data-slot="source" {...stylex.props(styles.list)}>
      {press}
    </div>
  );
};

/** A source's mark: in a line, the mark alone; in the trigger's pile, on a tile, overlapping. */
export const SourceIcon = ({ children, style }: SourceIconProps) => {
  const inPile = use(PileContext);
  const access = use(AccessContext);
  return (
    <span
      aria-hidden="true"
      data-slot="source-icon"
      {...stylex.props(
        styles.tile,
        inPile ? [tileEdge, styles.tilePile] : styles.tileLine,
        access !== "open" && styles.tileQuiet,
        style
      )}
    >
      {children}
    </span>
  );
};
