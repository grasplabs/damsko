import { focusRingText } from "@grasp-os/ui/lib/styles";
import {
  colors,
  duration,
  font,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
// The foundations pages as an experience: each page opens on a live scene of the foundation itself,
// shows it at work in real parts, and keeps the full token list behind one closed row.
//
//   SceneView      a scene: a heading and one quiet line, then a framed, live picture drawn by an
//                  example in examples/foundations/ (made live by site/system/Island.astro). No
//                  code tab: a scene shows what a foundation is, the token list says how to use it.
//                  ground  paper  the page's own ground, with the system's edge
//                          soft   the soft ground, for parts that stand on it
//                          night  the night ground, in dark colours
//                          bare   no frame: the scene draws its own
//   ReferenceView  "Every token" as one closed row (a <details>, so it opens without script and
//                  find-in-page opens it too), the token groups inside it.
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

import { rowMarker } from "./markers.stylex";
import { partStyles } from "./parts";

export type SceneGround = "paper" | "soft" | "night" | "bare";

const styles = stylex.create({
  scene: {
    marginTop: space["12"],
  },
  first: {
    marginTop: space["8"],
  },
  head: {
    display: "grid",
    rowGap: space["1"],
    marginBottom: space["5"],
  },
  frame: {
    position: "relative",
    overflow: "clip",
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
    isolation: "isolate",
  },
  paper: { backgroundColor: colors.card },
  soft: { backgroundColor: colors.muted },
  night: {
    colorScheme: "dark",
    backgroundColor: colors.brandNight,
    color: colors.bodyForeground,
  },
  bare: { overflow: "visible", borderRadius: 0, boxShadow: "none" },

  reference: {
    marginTop: space["12"],
    boxShadow: `inset 0 1px 0 ${colors.border}, inset 0 -1px 0 ${colors.border}`,
  },
  summary: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space["4"],
    minHeight: 56,
    fontFamily: font.sans,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
    cursor: "pointer",
    listStyle: "none",
    borderRadius: radius.sm,
    cornerShape: radius.shape,
    "::-webkit-details-marker": { display: "none" },
  },
  count: {
    marginInlineStart: space["2"],
    fontSize: font.textSm,
    fontWeight: font.weightNormal,
    color: colors.mutedForeground,
  },
  sign: {
    flexShrink: 0,
    fontSize: font.textBase,
    color: colors.mutedForeground,
    transitionProperty: "transform",
    transitionDuration: duration.mark,
    transitionTimingFunction: duration.ease,
    transform: {
      default: "none",
      [stylex.when.ancestor("[open]", rowMarker)]: "rotate(45deg)",
    },
  },
  body: {
    paddingBottom: space["8"],
  },
});

export function SceneView({
  title,
  note,
  ground = "paper",
  first = false,
  children,
}: {
  title?: string;
  note?: string;
  ground?: SceneGround;
  first?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      data-scene=""
      {...stylex.props(partStyles.block, styles.scene, first && styles.first)}
    >
      {(title || note) && (
        <div {...stylex.props(styles.head)}>
          {title && <h3 {...stylex.props(partStyles.heading)}>{title}</h3>}
          {note && <p {...stylex.props(partStyles.note)}>{note}</p>}
        </div>
      )}
      <div
        data-scene-frame={ground}
        {...stylex.props(styles.frame, styles[ground])}
      >
        {children}
      </div>
    </section>
  );
}

export function ReferenceView({
  label = "Every token",
  count,
  children,
}: {
  label?: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <details data-reference="" {...stylex.props(rowMarker, styles.reference)}>
      <summary {...stylex.props(styles.summary, focusRingText)}>
        <span>
          {label}
          {count !== undefined && (
            <span {...stylex.props(styles.count)}>{count}</span>
          )}
        </span>
        <span aria-hidden="true" {...stylex.props(styles.sign)}>
          +
        </span>
      </summary>
      <div {...stylex.props(styles.body)}>{children}</div>
    </details>
  );
}
