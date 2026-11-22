// Tag: a short label that sorts or names something ("Design", "Q3"): a pill 24px tall with 8px at
// each end, the words in small type. A soft fill, or an outline beside other tags that are chosen.
// With `onRemove` it carries a small button that takes it away, as a filter or a chosen value does.
//
//   <Tag>Design</Tag>
//   <Tag variant="outline" icon={LinkIcon}>Shared</Tag>
//   <Tag onRemove={() => drop("design")}>Design</Tag>
//
// For how something stands (ready, failed), use a Badge. A caller may set layout only (the `style`
// prop). The remove button's name comes from the I18nProvider (`tag.remove`, `tag.removeNamed`).
import * as stylex from "@stylexjs/stylex";
import type { MouseEvent, ReactNode } from "react";

import { useI18n } from "../lib/i18n";
import { Icon, XIcon } from "../lib/icons";
import type { IconData } from "../lib/icons";
import { focusRing, tapTarget } from "../lib/styles";
import {
  colors,
  duration,
  font,
  media,
  radius,
  size,
  space,
} from "../lib/tokens.stylex";
import type { LayoutStyle } from "../lib/utils";
import { iconVars, motionVars } from "../lib/vars.stylex";

/** Every prop a Tag takes. */
export interface TagProps {
  /**
   * Its words: one or two, in sentence case. Too long for the room, they end in an ellipsis, and
   * text words carry their whole text as a `title`, so what the ellipsis hides can still be read.
   */
  children: ReactNode;
  /**
   * `soft` filled, the usual tag. `outline` an edge alone, quieter, for tags beside chosen ones.
   * @default "soft"
   */
  variant?: "soft" | "outline";
  /**
   * `default` 24px beside body text, `sm` 20px in a dense row or a table.
   * @default "default"
   */
  size?: "default" | "sm";
  /** An icon before the words, from lib/icons. */
  icon?: IconData;
  /**
   * Takes the tag away: shows a small button after the words that runs this. Its name is "Remove"
   * and the words when they are text. Focus then moves to the next tag's remove button in the same
   * row, or the one before when it was the last. When no tag is left, move focus yourself, to the
   * field that adds them.
   */
  onRemove?: () => void;
  /** Layout only: margins and alignment. The look belongs to the tag. */
  style?: LayoutStyle;
}

const styles = stylex.create({
  tag: {
    [iconVars.size]: size.tagIcon,
    [iconVars.stroke]: size.iconStroke,
    display: "inline-flex",
    alignItems: "center",
    gap: space["1"],
    boxSizing: "border-box",
    maxWidth: "100%",
    paddingInline: space.tagPadding,
    borderRadius: radius.full,
    fontFamily: font.sans,
    fontWeight: font.weightMedium,
    color: colors.foreground,
    whiteSpace: "nowrap",
    verticalAlign: "middle",
    // Forced colours drop the fill and the edge: a line keeps the pill, inside it.
    outline: {
      default: "none",
      [media.forcedColors]: "1px solid currentColor",
    },
    outlineOffset: -1,
  },
  default: {
    height: size.tagHeight,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
  sm: {
    height: size.tagHeightSm,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
  },
  soft: {
    backgroundColor: colors.tagBg,
  },
  outline: {
    boxShadow: size.borderStrong,
  },
  // With a remove button, the end is the button's own room.
  removable: {
    paddingInlineEnd: space["1"],
  },
  words: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  remove: {
    position: "relative",
    display: "inline-grid",
    placeItems: "center",
    flexShrink: 0,
    boxSizing: "border-box",
    width: size.iconSm,
    height: size.iconSm,
    margin: 0,
    padding: 0,
    borderWidth: 0,
    borderRadius: radius.full,
    color: {
      default: colors.mutedForeground,
      ":hover": { default: null, [media.hover]: colors.foreground },
    },
    backgroundColor: {
      default: "transparent",
      ":hover": { default: null, [media.hover]: colors.tagBg },
    },
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
    transitionProperty: "color, background-color",
    transitionDuration: motionVars.mark,
    transitionTimingFunction: duration.ease,
  },
});

// After a remove, the keyboard lands on a neighbour's remove button instead of the page: the next
// in the row, or the one before. Found before the tag goes, focused once it has.
const keepFocus = (event: MouseEvent<HTMLButtonElement>) => {
  const all = [
    ...(event.currentTarget
      .closest("[data-slot=tag]")
      ?.parentElement?.querySelectorAll<HTMLButtonElement>(
        "[data-slot=tag] > [data-slot=tag-remove]"
      ) ?? []),
  ];
  const at = all.indexOf(event.currentTarget);
  const next = all[at + 1] ?? all[at - 1];
  if (!next) {
    return;
  }
  requestAnimationFrame(() => {
    if (next.isConnected) {
      next.focus();
    }
  });
};

export const Tag = ({
  children,
  variant = "soft",
  size: sized = "default",
  icon,
  onRemove,
  style,
}: TagProps) => {
  const { tag: words } = useI18n();
  const removable = onRemove !== undefined;
  return (
    <span
      data-slot="tag"
      {...stylex.props(
        styles.tag,
        sized === "sm" ? styles.sm : styles.default,
        variant === "outline" ? styles.outline : styles.soft,
        removable && styles.removable,
        style
      )}
    >
      {icon && <Icon icon={icon} />}
      {/* The whole text, for a cut tag: no measuring. */}
      <span
        title={typeof children === "string" ? children : undefined}
        {...stylex.props(styles.words)}
      >
        {children}
      </span>
      {removable && (
        <button
          type="button"
          aria-label={
            typeof children === "string"
              ? words.removeNamed(children)
              : words.remove
          }
          data-slot="tag-remove"
          onClick={(event) => {
            keepFocus(event);
            onRemove();
          }}
          {...stylex.props(styles.remove, focusRing)}
        >
          <span aria-hidden="true" {...stylex.props(tapTarget)} />
          <Icon icon={XIcon} />
        </button>
      )}
    </span>
  );
};
