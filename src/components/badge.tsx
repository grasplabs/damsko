// Badge: a short status in a pill: a soft tinted fill, the system's edge, and words
// in the variant's colour. It says how something stands; it does nothing when pressed, unless it is
// drawn as a link (`asChild`).
// Adapted from shadcn/ui (MIT), see THIRD_PARTY_NOTICES.md.
//
//   <Badge>Draft</Badge>
//   <Badge variant="success" icon={CheckIcon}>Ready</Badge>
//   <Badge variant="destructive" size="sm">Failed</Badge>
//   <Badge loading={sending} icon={CheckIcon}>{sending ? "Sending" : "Invited"}</Badge>
//   <Badge dot variant="destructive">3 errors</Badge>        how serious, as a dot
//   <Badge tooltip="Support can open this workspace until Friday.">Staff access</Badge>
//   <Badge asChild variant="info"><a href="/changelog">New</a></Badge>
//
// `dot` is how serious something is, as a small dot in the variant's colour beside words in the
// text's colour, for a page full of them: a page of errors is not painted red. Alone (no words),
// the dot is named for a screen reader by the I18nProvider (`badge.dot`). In forced colours each
// variant keeps its own shape: destructive and success a full dot, warning a ring, default and
// info a dash.
//
// For a label that sorts or names something, use a Tag. Every value is a token. A caller may set
// layout only (the `style` prop).
"use client";

import * as stylex from "@stylexjs/stylex";
import { renderElement } from "@ui-sdk/react/primitive";
import { isValidElement } from "react";
import type { ReactNode } from "react";

import { useI18n } from "../lib/i18n";
import { Icon, LoaderIcon } from "../lib/icons";
import type { IconData } from "../lib/icons";
import { focusRing, hyphenate } from "../lib/styles";
import {
  colors,
  duration,
  font,
  media,
  radius,
  size as sizes,
  space,
} from "../lib/tokens.stylex";
import { isBlank } from "../lib/utils";
import type { LayoutStyle } from "../lib/utils";
import { iconVars } from "../lib/vars.stylex";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

/** How it stands: a plain fact, done or fine, worth a look, failed or blocked, a note. */
export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "info";
/** `default` 22px, `sm` 18px for a dense table. */
export type BadgeSize = "sm" | "default";

/** Every prop a Badge takes. */
export interface BadgeProps {
  /**
   * The status, in a word or two, in sentence case ("Needs review"). It says it, never the colour
   * alone. With `dot`, what happened or how many ("3 errors"); leave it out for the dot alone. With
   * `asChild`, the one element to draw as the badge (`<a href>`), holding the words.
   */
  children?: ReactNode;
  /**
   * How it stands: `default` for a plain fact, `success` when it is done or fine, `warning` when
   * someone should look, `destructive` when it failed or is blocked, `info` for a note.
   * @default "default"
   */
  variant?: BadgeVariant;
  /**
   * How serious something is: a dot in the variant's colour beside words in the text's colour,
   * for a page full of them (captured logs), in place of the tinted pill.
   * @default false
   */
  dot?: boolean;
  /**
   * The height: `default` 22px, `sm` 18px for a dense table.
   * @default "default"
   */
  size?: BadgeSize;
  /**
   * An icon before the words, in their colour, from lib/icons. Not drawn with `asChild`: put an
   * `<Icon />` in the element before its words.
   */
  icon?: IconData;
  /**
   * Working on it ("Sending", "Being removed"): a turning mark in the icon's place, still with
   * reduced motion. A badge given `loading`, true or false, says its words politely as they
   * change (a status), once each. Give it an icon for when it settles, and its width stays put.
   * Not drawn with `asChild`.
   */
  loading?: boolean;
  /**
   * What the status means, for whoever wonders: the badge becomes a stop for the keyboard and shows
   * these words in a tooltip on hover and on focus, said as its description. It still looks like a
   * badge, not a button, and nothing happens when it is pressed. A pill only.
   */
  tooltip?: ReactNode;
  /**
   * Draw the one element given as the child (`<a href>`, a router's link) as the badge, with its
   * look: a link stays a link, with the keyboard's ring. Its words are its own; an icon goes in it
   * as an `<Icon />` before them, and `icon` and `loading` are not drawn.
   * @default false
   */
  asChild?: boolean;
  /**
   * The dot's name when it stands alone (`dot`, no words). With words it is not said.
   * @default "Note", "Done", "Warning", "Error" or "Info", by variant (`badge.dot`)
   */
  "aria-label"?: string;
  /** Layout only: margins and alignment. The look belongs to the badge. */
  style?: LayoutStyle;
}

const FORCED = media.forcedColors;
const REDUCED = media.reducedMotion;

const turn = stylex.keyframes({
  from: { transform: "rotate(0turn)" },
  to: { transform: "rotate(1turn)" },
});

const styles = stylex.create({
  badge: {
    [iconVars.size]: sizes.badgeIcon,
    [iconVars.stroke]: sizes.iconStroke,
    display: "inline-flex",
    alignItems: "center",
    gap: space["1"],
    boxSizing: "border-box",
    maxWidth: "100%",
    margin: 0,
    paddingInline: sizes.badgePadding,
    fontFamily: font.sans,
    fontSize: font.textXs,
    fontWeight: font.weightMedium,
    letterSpacing: "normal",
    textDecoration: "none",
    // A long status wraps rather than being cut off, and the pill grows with it. It breaks a word
    // only when the word alone is wider than the column. In a table's cell it stays in one piece:
    // the table scrolls sideways instead.
    whiteSpace: {
      default: "normal",
      ":is([data-slot=table-cell] *)": "nowrap",
    },
    overflowWrap: "break-word",
    textWrap: "balance",
    verticalAlign: "middle",
    // In forced colours fills and shadows are dropped, so an outline draws the pill there, inside
    // it, so it adds no size.
    outline: { default: "none", [FORCED]: "1px solid currentColor" },
    outlineOffset: -1,
  },
  // One line of words fills the height, with round ends; more lines grow it, with rounded corners.
  default: {
    minHeight: sizes.badgeHeight,
    paddingBlock: `calc((${sizes.badgeHeight} - ${font.textXsLine}) / 2)`,
    lineHeight: font.textXsLine,
    borderRadius: `calc(${sizes.badgeHeight} / 2)`,
  },
  sm: {
    minHeight: sizes.badgeHeightSm,
    paddingBlock: 0,
    lineHeight: sizes.badgeHeightSm,
    borderRadius: `calc(${sizes.badgeHeightSm} / 2)`,
  },
  // Default: white on a light ground, a veil on a dark one. Every variant has the system's edge.
  variantDefault: {
    color: colors.foreground,
    backgroundColor: colors.secondary,
    boxShadow: sizes.borderStrong,
  },
  success: {
    color: colors.success,
    backgroundColor: colors.successSubtle,
    boxShadow: sizes.borderStrong,
  },
  warning: {
    color: colors.warning,
    backgroundColor: colors.warningSubtle,
    boxShadow: sizes.borderStrong,
  },
  destructive: {
    color: colors.destructive,
    backgroundColor: colors.destructiveSubtle,
    boxShadow: sizes.borderStrong,
  },
  info: {
    color: colors.info,
    backgroundColor: colors.infoSubtle,
    boxShadow: sizes.borderStrong,
  },
  // A badge drawn as a link: the pointer's cursor, and its words underlined under it.
  link: {
    cursor: "pointer",
    textDecoration: {
      default: "none",
      ":hover": { default: null, [media.hover]: "underline" },
    },
  },
  // A badge with a tooltip: the help cursor under a pointer, and no look of a button.
  explained: { cursor: "help" },
  words: { minWidth: 0 },
  // The working mark: the icon's box, turning; standing still with reduced motion.
  turning: {
    display: "inline-flex",
    flexShrink: 0,
    animationName: { default: turn, [REDUCED]: "none" },
    animationDuration: duration.spin,
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
});

// The dot: how serious, beside words that stay in the text's colour.
const dotStyles = stylex.create({
  mark: {
    display: "inline-flex",
    alignItems: "center",
    gap: space["2"],
    minWidth: 0,
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
  dot: {
    flexShrink: 0,
    boxSizing: "border-box",
    width: sizes.severityDot,
    height: sizes.severityDot,
    borderRadius: radius.circle,
    forcedColorAdjust: "none",
  },
  destructive: {
    backgroundColor: { default: colors.destructive, [FORCED]: "CanvasText" },
  },
  success: {
    backgroundColor: { default: colors.success, [FORCED]: "CanvasText" },
  },
  // In forced colours a ring, so warning and destructive never rest on colour alone.
  warning: {
    backgroundColor: { default: colors.warning, [FORCED]: "Canvas" },
    boxShadow: { default: null, [FORCED]: "inset 0 0 0 1.5px CanvasText" },
  },
  // Info and default are quiet: the text's own faint colour, a dash in forced colours.
  quiet: {
    backgroundColor: {
      default: colors.subtleForeground,
      [FORCED]: "CanvasText",
    },
    height: { default: sizes.severityDot, [FORCED]: "2px" },
    borderRadius: { default: radius.circle, [FORCED]: 0 },
  },
  words: { minWidth: 0, overflowWrap: "anywhere" },
});

const pillLooks = {
  default: styles.variantDefault,
  success: styles.success,
  warning: styles.warning,
  destructive: styles.destructive,
  info: styles.info,
} as const;

const dotLooks = {
  default: dotStyles.quiet,
  success: dotStyles.success,
  warning: dotStyles.warning,
  destructive: dotStyles.destructive,
  info: dotStyles.quiet,
} as const;

/** `dot`: the dot in the variant's colour, and the words beside it, or the dot alone, named. */
const Dot = ({
  variant,
  children,
  named,
  style,
}: {
  variant: BadgeVariant;
  children: ReactNode;
  named: string | undefined;
  style: LayoutStyle | undefined;
}) => {
  const { badge: words } = useI18n();
  const alone = isBlank(children);
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      data-dot=""
      {...stylex.props(dotStyles.mark, style)}
    >
      <span
        // Alone, the dot is the thing said; beside words, the words say it.
        role={alone ? "img" : undefined}
        aria-label={alone ? (named ?? words.dot[variant]) : undefined}
        aria-hidden={alone ? undefined : true}
        {...stylex.props(dotStyles.dot, dotLooks[variant])}
      />
      {alone ? null : (
        <span {...stylex.props(dotStyles.words)}>{children}</span>
      )}
    </span>
  );
};

/** Before the words: the working mark while loading, else the icon. */
const Mark = ({ icon, loading }: { icon?: IconData; loading: boolean }) => {
  if (loading) {
    return (
      <span
        aria-hidden="true"
        data-slot="badge-loading"
        {...stylex.props(styles.turning)}
      >
        <Icon icon={LoaderIcon} />
      </span>
    );
  }
  return icon ? <Icon icon={icon} /> : null;
};

/** The words, and the mark before them. A badge that may be loading is a polite status. */
const Inside = ({
  icon,
  loading,
  children,
}: {
  icon: IconData | undefined;
  loading: boolean | undefined;
  children: ReactNode;
}) => (
  <>
    <Mark icon={icon} loading={loading === true} />
    <span
      role={loading === undefined ? undefined : "status"}
      {...stylex.props(styles.words)}
    >
      {children}
    </span>
  </>
);

/** A short status in a pill, or how serious something is as a dot. */
export const Badge = ({
  children,
  variant = "default",
  dot = false,
  size = "default",
  icon,
  loading,
  tooltip,
  asChild = false,
  "aria-label": named,
  style,
}: BadgeProps) => {
  if (dot) {
    return (
      <Dot variant={variant} named={named} style={style}>
        {children}
      </Dot>
    );
  }
  const explained = !isBlank(tooltip);
  // With `asChild`, the caller's one element (a link) is drawn as the badge.
  const element =
    asChild && isValidElement<{ children?: ReactNode }>(children)
      ? children
      : undefined;
  const linked = element !== undefined;
  const look = stylex.props(
    styles.badge,
    hyphenate,
    size === "sm" ? styles.sm : styles.default,
    pillLooks[variant],
    linked && styles.link,
    explained && styles.explained,
    (explained || linked) && focusRing,
    style
  );
  const own = {
    "data-slot": "badge",
    "data-variant": variant,
    "data-loading": loading === true ? "" : undefined,
    ...look,
  };
  // Drawn as the caller's element (a link), the badge's look, mark and words go onto it.
  const pill =
    element === undefined ? (
      <span
        {...own}
        // An explained badge is a stop, so its tooltip (its description) reaches the keyboard too.
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the tooltip describes it, as a Key-value icon's does
        tabIndex={explained ? 0 : undefined}
      >
        <Inside icon={icon} loading={loading}>
          {children}
        </Inside>
      </span>
    ) : (
      // Its own words stay its own: an icon goes inside it, as `<Icon />` before the words.
      renderElement("span", own, element)
    );
  if (!explained) {
    return pill;
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>{pill}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
};
