// The small list the empty and error examples stand in for: three projects as rows. An example
// shows the state, then (once its action is pressed) the list the state stood in for, so the
// first row is seen arriving where the state was. Draws by itself too (every file here is a page).
"use client";

import { Badge } from "@grasp-os/ui/components/badge";
import { fadeIn, focusRingInset } from "@grasp-os/ui/lib/styles";
import { colors, font, radius, size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef } from "react";

const styles = stylex.create({
  // The place a list stands in: one box, whether it holds rows or says why it does not. A state
  // gives it its height; a whole list hugs its rows (holding the state's height, three rows sat
  // over a blank band once a search was cleared).
  place: {
    position: "relative",
    display: "grid",
    alignContent: "start",
    width: "100%",
    maxWidth: 560,
    borderRadius: radius.base,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: size.borderStrong,
    overflow: "hidden",
    fontFamily: font.sans,
  },
  // A list still mostly empty keeps room for the rows to come, drawn under the ones it has.
  waiting: { minHeight: 264 },
  // Over the picture of the rows to come: a real row covers its own picture exactly.
  list: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  // A row's columns are the picture's, to the pixel (Empty's `rows`): a mark at 16px, the name
  // from 40px, the status at 64% and a fact at 87%, 36px tall with its line. So the first real row
  // covers its own picture and nothing jumps.
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
    // A line between rows; the last row's edge is the place's own, so it draws none (now the place
    // hugs its rows, its line would double the place's edge).
    boxShadow: {
      default: `inset 0 calc(-1 * ${size.hairline}) 0 ${colors.border}`,
      ":last-child": "none",
    },
  },
  // The row's box, drawn as the picture draws it: an outline that shows in light as in dark
  // (the edge alone all but vanished in light).
  mark: {
    gridColumn: 2,
    boxSizing: "border-box",
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: colors.card,
    boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${colors.mutedForeground} 55%, transparent)`,
  },
  when: {
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
    whiteSpace: "nowrap",
  },
  name: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: colors.foreground,
  },
});

export const projects = [
  // Dates as short as the picture's column has room for at a phone's width: "Monday" was cut.
  { name: "Q3 pipeline report", state: "Ready", when: "Today" },
  { name: "Churn interviews", state: "Draft", when: "Mon" },
  { name: "Pricing page", state: "Archived", when: "3 Nov" },
] as const;

/** The box a list stands in. */
/** `waiting`: the list is still mostly empty, so its box keeps the height it will have. */
export const Place = ({
  children,
  waiting = false,
}: {
  children: React.ReactNode;
  waiting?: boolean;
}) => (
  <div {...stylex.props(styles.place, waiting && styles.waiting)}>
    {children}
  </div>
);

/**
 * `arrived`: the list has just taken the place of a state whose button was pressed. That button is
 * gone, so the list takes the focus it held: the keyboard stays where the eye is.
 */
export const ProjectList = ({
  only,
  arrived = false,
}: {
  only?: number;
  arrived?: boolean;
}) => {
  const list = useRef<HTMLUListElement>(null);
  useEffect(() => {
    if (arrived) {
      list.current?.focus();
    }
  }, [arrived]);
  return (
    <ul
      ref={list}
      tabIndex={arrived ? -1 : undefined}
      aria-label="Projects"
      {...stylex.props(styles.list, focusRingInset)}
    >
      {projects.slice(0, only ?? projects.length).map((project) => (
        <li key={project.name} {...stylex.props(styles.row, arrived && fadeIn)}>
          <span aria-hidden="true" {...stylex.props(styles.mark)} />
          <span {...stylex.props(styles.name)}>{project.name}</span>
          <span>
            <Badge
              size="sm"
              variant={project.state === "Ready" ? "success" : "default"}
            >
              {project.state}
            </Badge>
          </span>
          <span {...stylex.props(styles.when)}>{project.when}</span>
        </li>
      ))}
    </ul>
  );
};

export default function Projects() {
  return (
    <Place>
      <ProjectList />
    </Place>
  );
}
