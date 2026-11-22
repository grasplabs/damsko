import { colors, font, size, space } from "@grasp-os/ui/lib/tokens.stylex";
// The states row: the life of an action, in order (rest, hover, keyboard focus, pressed, working,
// done, failed, disabled). One specimen to a cell, every cell as wide as the widest specimen in
// the row, at least space-4 apart; cells wrap whole, balanced over the lines, and are never
// squeezed (site/blocks/states-layout.ts measures the row; without script the CSS columns hold).
// Each specimen is the part's real example, at least 44px tall, with its name above it, centred, on
// one line; no rule lines ("the name should be above the comp"). Hover,
// keyboard focus and pressed are forced from the part's own CSS (site/behaviour/force-states.ts);
// the others are its props. The row stands still. Under it, a switch shows the row for each
// variant.
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

import { segmentStyles } from "./stage";

const styles = stylex.create({
  holder: {
    width: "100%",
    containerType: "inline-size",
  },
  grid: {
    display: { default: "grid", ":is([hidden])": "none" },
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 11rem), 1fr))",
    // Every line of cells as tall as the tallest, so a row's cells are one size whatever a state
    // adds (a failed switch's words under it).
    gridAutoRows: "1fr",
    rowGap: space["8"],
    columnGap: space["4"],
    width: "100%",
  },
  cell: {
    display: "grid",
    // The name, then the specimen; a taller neighbour's room goes to the specimen, so the names of
    // one line stay level.
    gridTemplateRows: "auto 1fr",
    justifyItems: "center",
    rowGap: space["3"],
    minWidth: 0,
  },
  specimen: {
    display: "grid",
    placeItems: "center",
    minHeight: size.tapTarget,
    width: "100%",
  },
  // Wide parts (cards, prompt inputs, tables, dialogs): one specimen to a line, the full width, its
  // caption above it at the start.
  columnGrid: {
    gridAutoRows: "auto",
    gridTemplateColumns: "minmax(0, 1fr)",
    rowGap: space["6"],
  },
  columnCell: {
    justifyItems: "stretch",
  },
  columnLabel: {
    textAlign: "start",
  },
  end: {
    marginInlineStart: "auto",
  },
  label: {
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
    textAlign: "center",
    whiteSpace: "nowrap",
  },
});

export interface StateCellProps {
  label: string;
  /** A pseudo-state forced from the part's own CSS: "hover", "focus-visible" or "active". */
  force?: string;
  /** One specimen to a line, its caption above (a wide part). */
  column?: boolean;
  children: ReactNode;
}

export function StateCell({ label, force, column, children }: StateCellProps) {
  return (
    <div
      role="group"
      aria-label={label}
      data-state-cell=""
      {...stylex.props(styles.cell, column && styles.columnCell)}
    >
      <span
        aria-hidden="true"
        data-state-caption=""
        {...stylex.props(styles.label, column && styles.columnLabel)}
      >
        {label}
      </span>
      <div
        data-force={force}
        data-state-specimen=""
        data-agent-hidden=""
        {...stylex.props(styles.specimen)}
      >
        {children}
      </div>
    </div>
  );
}

/** One set of cells; with a choice of variants, one set is shown at a time. A set for the checks
 * only (`check`) is never offered by the switch, so it stays hidden. */
export function StateGrid({
  option,
  hidden,
  check = false,
  column,
  children,
}: {
  option?: string;
  hidden?: boolean;
  check?: boolean;
  column?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      {...stylex.props(styles.holder)}
      data-option={option}
      data-option-check={check ? "" : undefined}
      hidden={hidden}
    >
      <div
        data-state-grid={column ? "column" : ""}
        {...stylex.props(styles.grid, column && styles.columnGrid)}
      >
        {children}
      </div>
    </div>
  );
}

/** Under the stage: the switch between variants, at the end of the line. */
export function StatesFoot({
  choose,
}: {
  choose?: { label: string; options: { id: string; label: string }[] };
}) {
  if (!choose) {
    return null;
  }
  return (
    <div
      role="radiogroup"
      aria-label={choose.label}
      {...stylex.props(segmentStyles.track, styles.end)}
    >
      {choose.options.map((option, index) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={index === 0 ? "true" : "false"}
          tabIndex={index === 0 ? 0 : -1}
          data-option-choice={option.id}
          {...stylex.props(segmentStyles.segment)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
