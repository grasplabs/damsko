import { CopyIcon, Icon, SettingsIcon } from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";
import { focusRing } from "@grasp-os/ui/lib/styles";
import {
  colors,
  duration,
  font,
  media,
  radius,
  shadow,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import { iconVars } from "@grasp-os/ui/lib/vars.stylex";
// The foundations pages' blocks (Space, Corners, Elevation, Motion, Icons): one compact row per
// token, each with a live sample drawn in the token's own CSS variable, so the page shows what the
// token is rather than a picture of it.
//
//   SampleRowsView  a row per token: the sample, the name as a chip that copies, what it is for
//                   space    a bar as long as the space
//                   corner   a corner sample on a raised square
//                   lift     a shadow sample, a raised square on the soft ground
//                   motion   a dot that moves along a track in the duration and the curve
//                   icon     an icon at the size, or with the stroke
//   IconListView    every icon of the system beside its name, its Hugeicons name and its use
//
// The motion dots are moved by the script in SampleRows.astro: it flips the rows between two ends
// every few seconds, and each dot crosses in its own duration and curve. With reduced motion, or
// without script, the dots stand still at the start.
import * as stylex from "@stylexjs/stylex";
import type { CSSProperties } from "react";

import { siteColors } from "../system/site-tokens.stylex";
import { actionMarker } from "./markers.stylex";
import { CopyLabel, TokenChip, partStyles } from "./parts";
import type { TokenEntry } from "./token-data";

export type SampleKind = "space" | "corner" | "lift" | "motion" | "icon";

// By the block's own room, not the window's: inside the shell a sidebar takes room beside it.
const stackedRows = "@container samples (width < 42rem)";

const styles = stylex.create({
  samples: { containerType: "inline-size", containerName: "samples" },
  group: {
    marginTop: space["8"],
  },
  // A row of the panel: the sample, the name that copies, what it is for.
  // The rows share one set of columns (the list is the grid, each row its subgrid), so the name
  // column is as wide as the longest name with its value and no chip is ever squeezed: a value
  // lay over its name ("--damsko-duration-search-open150ms"). Stacked where the block is narrow,
  // by the block's own room, so the longest name has the whole row.
  list: {
    display: "grid",
    gridTemplateColumns: {
      default: "7.5rem max-content minmax(0, 1fr)",
      [stackedRows]: "minmax(0, 1fr)",
    },
  },
  row: {
    display: "grid",
    gridColumn: "1 / -1",
    gridTemplateColumns: {
      default: "subgrid",
      [stackedRows]: "minmax(0, 1fr)",
    },
    gridTemplateAreas: {
      default: '"sample name use"',
      [stackedRows]: '"sample" "name" "use"',
    },
    alignItems: { default: "center", [stackedRows]: "start" },
    columnGap: space["4"],
    rowGap: space["2"],
    minHeight: 32,
    paddingBlock: space["4"],
    paddingInline: { default: space["6"], [stackedRows]: space["4"] },
  },
  // The lift samples stand on the soft ground, so a white square shows its shadow.
  rowLift: {
    paddingBlock: space["4"],
  },
  noteFirst: {
    marginTop: 0,
  },
  sample: {
    gridArea: "sample",
    display: "flex",
    alignItems: "center",
    minWidth: 0,
    minHeight: 24,
  },
  name: {
    gridArea: "name",
    display: "flex",
    minWidth: 0,
  },
  use: {
    gridArea: "use",
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.bodyForeground,
    textWrap: "pretty",
  },
  // Space: a bar as long as the space, never longer than the column.
  bar: {
    display: "block",
    maxWidth: "100%",
    height: 8,
    backgroundColor: colors.mint,
    borderRadius: radius.full,
  },
  // Corners: a mint square, so its corner shows on every ground.
  corner: {
    display: "block",
    width: 40,
    height: 40,
    backgroundColor: colors.mint,
  },
  cornerWide: {
    width: 64,
    height: 28,
  },
  // Elevation: a white square on the soft ground.
  ground: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: "7.5rem",
    height: 52,
    backgroundColor: colors.muted,
    borderRadius: radius.mark,
    cornerShape: radius.shape,
  },
  raised: {
    display: "block",
    width: 32,
    height: 32,
    backgroundColor: colors.card,
    borderRadius: radius.mark,
    cornerShape: radius.shape,
  },
  swatch: {
    display: "block",
    width: 36,
    height: 36,
    borderRadius: radius.mark,
    cornerShape: radius.shape,
    boxShadow: `inset 0 0 0 1px ${siteColors.chipRing}`,
  },
  // Motion: a track, and a dot that crosses it.
  track: {
    position: "relative",
    display: "block",
    width: "100%",
    maxWidth: "7.5rem",
    height: 8,
    backgroundColor: colors.muted,
    borderRadius: radius.full,
    boxShadow: size.borderStrong,
  },
  mover: {
    position: "absolute",
    inset: 0,
    display: "block",
    transitionProperty: "transform",
  },
  dot: {
    display: "block",
    width: 8,
    height: 8,
    backgroundColor: colors.foreground,
    borderRadius: radius.circle,
  },
  word: {
    fontFamily: font.sans,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    color: colors.foreground,
  },
  // Icons: the icon in ink, at its own size.
  icon: {
    display: "flex",
    color: colors.foreground,
  },
  iconSm: { [iconVars.size]: size.iconSm },
  iconMd: { [iconVars.size]: size.iconDefault },
  // The stroke is shown at the larger size, where its weight is easiest to see.
  iconStroke: {
    [iconVars.size]: size.iconDefault,
    [iconVars.stroke]: size.iconStroke,
  },
  // Every icon: square cells on the panel, four across beside the sidebar, two on a phone. No
  // hairlines between them: a cell lifts on its own soft edge when a pointer is on it.
  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(min(10.5rem, calc(50% - 2px)), 1fr))",
    gap: space["1"],
    padding: space["1"],
  },
  cell: {
    // The filter hides a cell with [hidden]; a display of its own would keep it drawn.
    display: { default: "flex", ":is([hidden])": "none" },
    minWidth: 0,
  },
  // The cell is one button: it opens the copy menu (IconMenuView).
  cellButton: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    width: "100%",
    aspectRatio: "1",
    margin: 0,
    padding: space["4"],
    fontFamily: font.sans,
    color: colors.foreground,
    cursor: "pointer",
    backgroundColor: {
      default: "transparent",
      ":hover": { default: null, [media.hover]: colors.card },
      ":is([aria-expanded=true])": colors.card,
    },
    borderWidth: 0,
    borderRadius: radius.base,
    cornerShape: radius.shape,
    boxShadow: {
      default: "none",
      ":hover": { default: null, [media.hover]: shadow.sm },
      ":is([aria-expanded=true])": shadow.sm,
    },
    transitionProperty: "background-color, box-shadow",
    transitionDuration: {
      default: duration.hover,
      [media.reducedMotion]: "1ms",
    },
    transitionTimingFunction: duration.ease,
    WebkitTapHighlightColor: "transparent",
    [iconVars.size]: size.iconDefault,
  },
  cellGlyph: {
    display: "flex",
  },
  // The name: quiet, centred, one line, space-4 from the cell's foot.
  cellName: {
    position: "absolute",
    insetInline: space["3"],
    bottom: space["4"],
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
    textAlign: "center",
    // A long name in a narrow cell breaks onto a second line rather than being cut.
    overflowWrap: "anywhere",
    textWrap: "balance",
  },
  // The copy menu: one for the page, placed under the cell that opened it.
  menu: {
    position: "fixed",
    left: "var(--icon-menu-x, 0px)",
    top: "var(--icon-menu-y, 0px)",
    right: "auto",
    bottom: "auto",
    boxSizing: "border-box",
    minWidth: "11rem",
    margin: 0,
    padding: space.popupPadding,
    color: colors.foreground,
    backgroundColor: colors.card,
    borderWidth: 0,
    borderRadius: radius.base,
    cornerShape: radius.shape,
    boxShadow: `${size.borderStrong}, ${shadow.md}`,
    opacity: { default: 0, ":popover-open": 1 },
    transform: {
      default: "translateY(-4px)",
      ":popover-open": "none",
      [media.reducedMotion]: "none",
    },
    transitionProperty: "opacity, transform, display, overlay",
    transitionBehavior: "allow-discrete",
    transitionDuration: {
      default: duration.close,
      ":popover-open": duration.hover,
      [media.reducedMotion]: "1ms",
    },
    transitionTimingFunction: duration.ease,
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: space["2"],
    boxSizing: "border-box",
    width: "100%",
    height: {
      default: size.controlDefault,
      [media.pointerCoarse]: size.tapTarget,
    },
    margin: 0,
    paddingInline: space.menuItemPadding,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    // What the copy did, said on the item in the copy chips' colours (./parts.tsx).
    color: {
      default: colors.foreground,
      ':is([data-action-state="done"])': colors.mintDeep,
      ':is([data-action-state="failed"])': colors.destructive,
    },
    textAlign: "start",
    cursor: "copy",
    backgroundColor: {
      default: "transparent",
      ":hover": { default: null, [media.hover]: colors.accent },
    },
    borderWidth: 0,
    borderRadius: `calc(${radius.base} - ${space["1"]})`,
    cornerShape: radius.shape,
    // The one ring, inside the item, as the theme's menu draws it.
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: size.ringWidth,
    outlineColor: colors.ring,
    outlineOffset: `calc(-1 * ${size.ringWidth})`,
    [iconVars.size]: size.iconSm,
  },
});

const v = (entry: TokenEntry) => `var(${entry.cssVar})`;
const isColour = (value: string) => value.startsWith("oklch(");

/** The sample for one token, drawn in its own variable. */
function Sample({ kind, entry }: { kind: SampleKind; entry: TokenEntry }) {
  switch (kind) {
    case "space": {
      return <span style={{ width: v(entry) }} {...stylex.props(styles.bar)} />;
    }
    case "corner": {
      // The shape token is shown on a square with the one corner; the others round it themselves.
      const shape = entry.name === "radius-shape";
      const whole =
        entry.name === "radius-full" || entry.name === "radius-circle";
      const style: CSSProperties = {
        borderRadius: shape ? "var(--damsko-radius)" : v(entry),
        // A pill and a circle are round by their radius alone, as the parts that use them are: the
        // squircle laid over them drew a rounded rectangle and a rounded square.
        cornerShape: shape
          ? v(entry)
          : whole
            ? "round"
            : "var(--damsko-radius-shape)",
      };
      return (
        <span
          style={style}
          {...stylex.props(
            styles.corner,
            entry.name === "radius-full" && styles.cornerWide
          )}
        />
      );
    }
    case "lift": {
      if (isColour(entry.value)) {
        return (
          <span
            style={{ backgroundColor: v(entry) }}
            {...stylex.props(styles.swatch)}
          />
        );
      }
      return (
        <span {...stylex.props(styles.ground)}>
          <span
            style={{ boxShadow: v(entry) }}
            {...stylex.props(styles.raised)}
          />
        </span>
      );
    }
    case "motion": {
      if (entry.name === "swap-blur") {
        return (
          <span style={{ filter: v(entry) }} {...stylex.props(styles.word)}>
            Saved
          </span>
        );
      }
      if (entry.name === "swap-scale") {
        return (
          <span style={{ scale: v(entry) }} {...stylex.props(styles.word)}>
            Saved
          </span>
        );
      }
      const curve = entry.name.startsWith("ease");
      const style: CSSProperties = {
        // A curve crosses in the arrival's time, so its shape can be read; a duration crosses in the one ease.
        transitionDuration: curve ? "var(--damsko-duration-arrive)" : v(entry),
        transitionTimingFunction: curve ? v(entry) : "var(--damsko-ease)",
      };
      return (
        <span {...stylex.props(styles.track)}>
          <span
            data-motion-mover=""
            style={style}
            {...stylex.props(styles.mover)}
          >
            <span {...stylex.props(styles.dot)} />
          </span>
        </span>
      );
    }
    case "icon": {
      const size =
        entry.name === "icon-sm"
          ? styles.iconSm
          : entry.name === "icon-stroke"
            ? styles.iconStroke
            : styles.iconMd;
      return (
        <span {...stylex.props(styles.icon, size)}>
          <Icon icon={SettingsIcon} />
        </span>
      );
    }
  }
}

/**
 * One group of tokens with a live sample each: a quiet label with its note, then a row per token.
 */
export function SampleRowsView({
  kind,
  label,
  note,
  tokens,
}: {
  kind: SampleKind;
  label?: string;
  note?: string;
  tokens: TokenEntry[];
}) {
  const root = stylex.props(
    partStyles.block,
    styles.samples,
    label ? styles.group : null
  );
  // A block that opens with its note sits under its heading as a paragraph would (prose.css).
  const opensWithNote = !label && note ? " site-opens-with-note" : "";
  return (
    <section
      {...root}
      className={`not-prose${opensWithNote} ${root.className ?? ""}`}
      data-motion-rows={kind === "motion" ? "" : undefined}
    >
      {(label || note) && (
        <div {...stylex.props(partStyles.headed)}>
          {label && <h3 {...stylex.props(partStyles.heading)}>{label}</h3>}
          {note && (
            <p {...stylex.props(partStyles.note, !label && styles.noteFirst)}>
              {note}
            </p>
          )}
        </div>
      )}
      <ul {...stylex.props(partStyles.panel, styles.list)}>
        {tokens.map((entry) => (
          <li
            key={entry.name}
            {...stylex.props(
              partStyles.panelRow,
              styles.row,
              kind === "lift" && styles.rowLift
            )}
          >
            <span aria-hidden="true" {...stylex.props(styles.sample)}>
              <Sample kind={kind} entry={entry} />
            </span>
            <span {...stylex.props(styles.name)}>
              <TokenChip name={entry.name} />
              <span className="site-visually-hidden">
                , in StyleX {entry.stylex}
              </span>
            </span>
            <p {...stylex.props(styles.use)}>{entry.use}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export interface IconEntry {
  /** The name a component imports: `Tick`. */
  name: string;
  /** The Hugeicons drawing it is. */
  source: string;
  /** What it means in the product. */
  use: string;
  icon: IconData;
}

/** The import line and the JSX a cell's menu copies. */
export const iconImport = (name: string) =>
  `import { ${name} } from "@grasp-os/ui/lib/icons";`;
export const iconJsx = (name: string) => `<Icon icon={${name}} />`;

/**
 * Every icon of the system as a grid of square cells: the icon and its name. A cell is one button
 * that opens the copy menu (IconMenuView): its name, its import, its JSX. The filter above
 * (TokenFilterView) narrows the cells; each carries its name, its drawing and its use as words.
 */
export function IconListView({ icons }: { icons: IconEntry[] }) {
  const root = stylex.props(partStyles.block, partStyles.panel, styles.grid);
  return (
    <ul
      aria-label="Every icon"
      {...root}
      className={`not-prose ${root.className ?? ""}`}
      data-token-list=""
    >
      {icons.map((entry) => (
        <li
          key={entry.name}
          data-token-row=""
          data-token-words={`${entry.name} ${entry.source} ${entry.use}`.toLowerCase()}
          {...stylex.props(styles.cell)}
        >
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded="false"
            aria-controls="icon-menu"
            title={`${entry.name}: ${entry.use}`}
            data-icon-cell={entry.name}
            data-may-wrap=""
            {...stylex.props(styles.cellButton, focusRing)}
          >
            <span aria-hidden="true" {...stylex.props(styles.cellGlyph)}>
              <Icon icon={entry.icon} />
            </span>
            <span {...stylex.props(styles.cellName)}>{entry.name}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** The one copy menu of the icons grid, filled and placed by its script (site/blocks/blocks.ts). */
export function IconMenuView() {
  const items = [
    { what: "name", label: "Copy name" },
    { what: "import", label: "Copy import" },
    { what: "jsx", label: "Copy JSX" },
  ];
  return (
    <div
      id="icon-menu"
      popover="auto"
      role="menu"
      aria-label="Copy"
      data-icon-menu=""
      {...stylex.props(partStyles.block, styles.menu)}
    >
      {items.map((item) => (
        <button
          key={item.what}
          type="button"
          role="menuitem"
          tabIndex={-1}
          data-icon-copy={item.what}
          data-copy=""
          {...stylex.props(actionMarker, styles.menuItem)}
        >
          <CopyLabel icon={CopyIcon}>{item.label}</CopyLabel>
        </button>
      ))}
    </div>
  );
}
