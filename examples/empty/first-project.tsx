// The first project, as it arrives where an empty state stood: the action and top examples show it
// once their button is pressed. The button that brought it is gone, so the list takes the focus it
// held. Draws by itself too (every file here is a page).
"use client";

import { Badge } from "@grasp-os/ui/components/badge";
import { fadeIn, focusRingInset } from "@grasp-os/ui/lib/styles";
import { colors, font, radius, size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef } from "react";

const styles = stylex.create({
  place: {
    position: "relative",
    display: "grid",
    alignContent: "start",
    width: "100%",
    maxWidth: 560,
    minHeight: 264,
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: size.borderStrong,
    overflow: "hidden",
    fontFamily: font.sans,
  },
  list: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  // Empty's picture's columns, to the pixel: a mark at 16px, the name from 40px, the status at
  // 64% and a fact at 87%, 36px tall.
  row: {
    display: "grid",
    gridTemplateColumns: "16px 24px calc(64% - 40px) 23% minmax(0, 1fr)",
    alignItems: "center",
    minWidth: 0,
    height: 36,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.bodyForeground,
    backgroundColor: colors.card,
  },
  mark: {
    gridColumn: 2,
    boxSizing: "border-box",
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: colors.card,
    boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${colors.mutedForeground} 55%, transparent)`,
  },
  name: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: colors.foreground,
  },
  when: {
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
    whiteSpace: "nowrap",
  },
});

export default function FirstProject() {
  const list = useRef<HTMLUListElement>(null);
  useEffect(() => {
    list.current?.focus();
  }, []);
  return (
    <div {...stylex.props(styles.place)}>
      <ul
        ref={list}
        tabIndex={-1}
        aria-label="Projects"
        {...stylex.props(styles.list, focusRingInset)}
      >
        <li {...stylex.props(styles.row, fadeIn)}>
          <span aria-hidden="true" {...stylex.props(styles.mark)} />
          <span {...stylex.props(styles.name)}>Q3 pipeline report</span>
          <span>
            <Badge size="sm" variant="success">
              Ready
            </Badge>
          </span>
          <span {...stylex.props(styles.when)}>Today</span>
        </li>
      </ul>
    </div>
  );
}
