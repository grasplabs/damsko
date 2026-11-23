import { Snippet } from "@grasp-os/ui/components/snippet";
import { CheckIcon, CircleAlertIcon, Icon } from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";
import {
  colors,
  duration,
  font,
  media,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
// The small parts every block is made of, in one place: the tag, code in a sentence, and the
// chips. One system for code and values, two forms only:
//
//   in a sentence   `useAction()`        Geist Mono 13, ink on code-fill, never a ring
//   a chip          [quiet] [36px]       24px, a full pill, mono 13: a value or a prop to type
//
// A chip is a value (raised, with a 1px ring) or a prop's name (code-fill, 500, no ring). What you
// copy is never a chip: it is the library's Copy field (CopyValue, TokenChip), the install line's
// look, copied by the site's one copy behaviour (site/behaviour/copy.ts). A type ("string") is plain
// mono, muted, never a chip. Meaning is prose.
import * as stylex from "@stylexjs/stylex";
import { Fragment } from "react";
import type { ReactNode } from "react";

import { siteColors, siteSize } from "../system/site-tokens.stylex";
import { actionMarker } from "./markers.stylex";
import { token } from "./token-data";

const shown = "[data-action-shown]";
const swapping = '[data-action-state="swap"]';

export const partStyles = stylex.create({
  // The ground every block starts from, so nothing is inherited from the page's prose.
  block: {
    fontFamily: font.sans,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    fontWeight: font.weightNormal,
    color: colors.bodyForeground,
    overflowWrap: "break-word",
  },
  // A heading inside a block (a token group, the rules' Always and Never): the page's h3, one size
  // and weight wherever an h3 stands (site/system/styles/prose.css), never the inherited tracking.
  heading: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    fontWeight: font.weightMedium,
    letterSpacing: 0,
    color: colors.foreground,
  },
  // The one line under a block's heading: what the group is, quietly.
  note: {
    margin: 0,
    marginTop: space["1"],
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightNormal,
    color: colors.mutedForeground,
    textWrap: "pretty",
  },
  // A block's heading and note stand space-4 above its panel.
  headed: {
    marginBottom: space["4"],
  },
  // The panel every token display stands on: the stage's ground, the soft edge, the one corner.
  // No border line; rows inside are split by hairlines that nothing fills against.
  panel: {
    padding: 0,
    listStyle: "none",
    backgroundColor: siteColors.stageBg,
    borderRadius: radius.base,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
  },
  // A row of a panel: a hairline above every row but the first.
  panelRow: {
    boxShadow: {
      default: `inset 0 1px 0 ${colors.border}`,
      ":first-child": "none",
    },
  },
  tag: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    fontWeight: font.weightMedium,
    letterSpacing: siteSize.trackingTag,
    textTransform: "uppercase",
    color: colors.mutedForeground,
  },
  code: {
    // Must not grow the line it stands in: the box is no taller than the text.
    paddingBlock: 1,
    paddingInline: 6,
    fontFamily: font.mono,
    fontSize: font.textXs,
    lineHeight: 1,
    fontWeight: font.weightNormal,
    color: colors.foreground,
    backgroundColor: colors.codeBg,
    borderRadius: radius.mark,
    cornerShape: radius.shape,
    boxShadow: "none",
    whiteSpace: "nowrap",
    boxDecorationBreak: "clone",
  },
  // Longer than 24 characters: it may break anywhere rather than run out of its column.
  codeLong: {
    whiteSpace: "normal",
    overflowWrap: "anywhere",
  },
  type: {
    fontFamily: font.mono,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
  chip: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    boxSizing: "border-box",
    height: size.chip,
    maxWidth: "100%",
    margin: 0,
    paddingBlock: 0,
    paddingInline: 10,
    fontFamily: font.mono,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    fontWeight: font.weightNormal,
    color: colors.foreground,
    whiteSpace: "nowrap",
    backgroundColor: colors.card,
    borderWidth: 0,
    borderStyle: "none",
    borderRadius: radius.full,
    boxShadow: `inset 0 0 0 1px ${siteColors.chipRing}`,
    verticalAlign: "middle",
    textDecorationLine: "none",
  },
  name: {
    fontWeight: font.weightMedium,
    backgroundColor: colors.codeBg,
    boxShadow: "none",
  },
  swatch: {
    flexShrink: 0,
    width: 12,
    height: 12,
    borderRadius: radius.circle,
    boxShadow: `inset 0 0 0 0.75px ${siteColors.chipRing}`,
  },
  // The default of a prop: a live dot inside its chip.
  dot: {
    flexShrink: 0,
    width: 6,
    height: 6,
    borderRadius: radius.circle,
    backgroundColor: colors.mint,
    boxShadow: `0 0 0 3px color-mix(in oklch, ${colors.mint} 22%, transparent)`,
  },
  value: {
    color: colors.mutedForeground,
  },
  arrow: {
    fontFamily: font.mono,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.subtleForeground,
  },

  // A token's field and its short value after it, on one line.
  tokenLine: {
    display: "inline-flex",
    alignItems: "center",
    gap: space["2"],
    maxWidth: "100%",
    minWidth: 0,
    verticalAlign: "middle",
  },
  // The holder of a Copy field drawn on the server: no box of its own, so the field stands in the
  // layout as if it were alone.
  copyField: {
    display: "contents",
  },

  // ---- The one copy behaviour: what changes on the control ---------------------------------------
  // (site/behaviour/copy.ts: data-action-state is the crossfade, data-action-shown the words worn.)
  label: {
    display: "inline-block",
    fontFamily: {
      default: "inherit",
      [stylex.when.ancestor(shown, actionMarker)]: font.sans,
    },
    fontWeight: {
      default: "inherit",
      [stylex.when.ancestor(shown, actionMarker)]: font.weightMedium,
    },
    opacity: { default: 1, [stylex.when.ancestor(swapping, actionMarker)]: 0 },
    filter: {
      default: "none",
      [stylex.when.ancestor(swapping, actionMarker)]: {
        default: size.swapBlur,
        [media.reducedMotion]: "none",
      },
    },
    transform: {
      default: "none",
      [stylex.when.ancestor(swapping, actionMarker)]: {
        default: `scale(${size.swapScale})`,
        [media.reducedMotion]: "none",
      },
    },
    transitionProperty: "opacity, filter, transform",
    transitionDuration: duration.swap,
    transitionTimingFunction: duration.ease,
  },
  // What stands beside the words (a swatch, a value, an icon, the tick) crosses with them.
  beside: {
    opacity: { default: 1, [stylex.when.ancestor(swapping, actionMarker)]: 0 },
    transitionProperty: "opacity",
    transitionDuration: duration.swap,
    transitionTimingFunction: duration.ease,
  },
  // Shown at rest, gone while the result shows (a swatch, a value, the copy icon).
  rest: {
    display: {
      default: null,
      [stylex.when.ancestor(shown, actionMarker)]: "none",
    },
  },
  tick: {
    display: {
      default: "none",
      [stylex.when.ancestor('[data-action-shown="done"]', actionMarker)]:
        "block",
    },
  },
  failedMark: {
    display: {
      default: "none",
      [stylex.when.ancestor('[data-action-shown="failed"]', actionMarker)]:
        "block",
    },
  },
});

export function Tag({
  children,
  as = "p",
}: {
  children: ReactNode;
  as?: "p" | "span" | "h2" | "h3";
}) {
  const Element = as;
  return <Element {...stylex.props(partStyles.tag)}>{children}</Element>;
}

const LONG = 24;

/**
 * Code in a sentence. Over 24 characters it may break, so it never runs out of its column; with
 * `wraps`, at any length (a narrow table cell, where even a short run can be wider than the cell).
 */
export function InlineCode({
  children,
  wraps = false,
}: {
  children: string;
  wraps?: boolean;
}) {
  return (
    <code
      data-code=""
      {...stylex.props(
        partStyles.code,
        (wraps || children.length > LONG) && partStyles.codeLong
      )}
    >
      {children}
    </code>
  );
}

/** Plain words with `code` in backticks, as written in a page's data. `wraps`: see InlineCode. */
export function rich(text: string, wraps = false): ReactNode {
  return text.split(/(`[^`]+`)/u).map((part, index) =>
    part.startsWith("`") && part.endsWith("`") && part.length > 2 ? (
      <InlineCode key={index} wraps={wraps}>
        {part.slice(1, -1)}
      </InlineCode>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    )
  );
}

/** The inside of every copy control: what it shows at rest, then "Copied" or "Could not copy". */
export function CopyLabel({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: IconData;
}) {
  return (
    <>
      {icon && (
        <span {...stylex.props(partStyles.rest, partStyles.beside)}>
          <Icon icon={icon} />
        </span>
      )}
      <span {...stylex.props(partStyles.tick, partStyles.beside)}>
        <Icon icon={CheckIcon} />
      </span>
      <span {...stylex.props(partStyles.failedMark, partStyles.beside)}>
        <Icon icon={CircleAlertIcon} />
      </span>
      <span data-action-label="" {...stylex.props(partStyles.label)}>
        {children}
      </span>
    </>
  );
}

/**
 * A value you copy, as the library's own Snippet, drawn here on the server with no React in the
 * browser. Its holder carries the site's copy attributes, so the site's one copy behaviour
 * (site/behaviour/copy.ts) copies it and marks its button's result (data-status) for
 * duration-hold, which the Snippet's ground follows: the same look, from the same styles, as the
 * component in a product. A press anywhere on the field, or Enter or Space on its button, copies.
 */
export function CopyValue({
  value,
  label,
  said,
  size = "sm",
  swatch,
  install = false,
}: {
  value: string;
  /** The button's name: what it copies ("Copy --damsko-mint"). */
  label?: string;
  /** What a screen reader hears once it is copied. */
  said?: string;
  size?: "sm" | "default";
  /** A colour before the value: any CSS colour. */
  swatch?: string;
  /** The page head's install line (prose.css spaces the heading under it). */
  install?: boolean;
}) {
  return (
    <span
      data-copy={value}
      data-copy-said={said ?? `Copied ${value}`}
      data-install={install ? "" : undefined}
      {...stylex.props(partStyles.copyField)}
    >
      <Snippet
        value={value}
        aria-label={label ?? `Copy ${value}`}
        size={size}
        swatch={swatch}
      />
    </span>
  );
}

export function ValueChip({
  children,
  isDefault = false,
}: {
  children: ReactNode;
  isDefault?: boolean;
}) {
  return (
    <span data-chip="" {...stylex.props(partStyles.chip)}>
      {isDefault && (
        <span aria-hidden="true" {...stylex.props(partStyles.dot)} />
      )}
      {children}
      {isDefault && (
        <span className="site-visually-hidden"> (the default)</span>
      )}
    </span>
  );
}

export function NameChip({ children }: { children: ReactNode }) {
  return (
    <span data-chip="" {...stylex.props(partStyles.chip, partStyles.name)}>
      {children}
    </span>
  );
}

const isColour = (value: string) => value.startsWith("oklch(");

/**
 * A token: its CSS name as a Copy field, its colour in the field's swatch when it is a colour, and
 * a short value after it, quiet (`--damsko-radius` 20px). Copies the name.
 */
export function TokenChip({ name }: { name: string }) {
  const entry = token(name);
  const colour = isColour(entry.value);
  const short =
    !colour && entry.value.length <= 8 && !entry.dark ? entry.value : null;
  return (
    <span data-token-chip="" {...stylex.props(partStyles.tokenLine)}>
      <CopyValue
        value={entry.cssVar}
        swatch={colour ? `var(${entry.cssVar})` : undefined}
      />
      {short && (
        <span {...stylex.props(partStyles.type)}>
          <span className="site-visually-hidden">, </span>
          {short}
        </span>
      )}
    </span>
  );
}

/**
 * One item of a row of values, as a page writes it:
 *   "@radius"    a token chip that copies --damsko-radius
 *   "~string"    a type, plain
 *   "→"          an arrow between two values
 *   "36px"       a value chip
 */
export function ChipItem({ spec }: { spec: string }) {
  if (spec.startsWith("@")) {
    return <TokenChip name={spec.slice(1)} />;
  }
  if (spec.startsWith("~")) {
    return <span {...stylex.props(partStyles.type)}>{spec.slice(1)}</span>;
  }
  if (spec === "→") {
    return (
      <span aria-label="becomes" {...stylex.props(partStyles.arrow)}>
        →
      </span>
    );
  }
  return <ValueChip>{spec}</ValueChip>;
}
