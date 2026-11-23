import { Icon, WandSparklesIcon } from "@grasp-os/ui/lib/icons";
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
// Elevation, scene: lifted by what it does. Three agents lie in the page on the edge. Under the
// pointer or the keyboard one rises to medium lift, as if it came towards you; pressed, it settles
// to low lift. Each card says its height as it changes. The lift eases over duration-hover; with
// reduced motion it changes at once.
import * as stylex from "@stylexjs/stylex";

import { liftCard } from "./markers.stylex";

const PHONE = media.maxSm;
const HOVER = media.hover;

const styles = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(3, minmax(0, 1fr))",
      [PHONE]: "minmax(0, 1fr)",
    },
    gap: space["5"],
    margin: 0,
    paddingBlock: { default: space["10"], [PHONE]: space["6"] },
    paddingInline: { default: space["8"], [PHONE]: space["5"] },
    listStyle: "none",
  },
  item: { display: "grid", minWidth: 0 },
  card: {
    display: "grid",
    alignContent: "start",
    rowGap: space["3"],
    minWidth: 0,
    margin: 0,
    padding: space["4"],
    borderWidth: 0,
    borderRadius: radius.base,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    color: colors.bodyForeground,
    fontFamily: font.sans,
    textAlign: "start",
    cursor: "pointer",
    boxShadow: {
      default: size.borderStrong,
      ":hover": { default: null, [HOVER]: shadow.md },
      ":focus-visible": shadow.md,
      ":active": shadow.sm,
    },
    transitionProperty: "box-shadow",
    transitionDuration: {
      default: duration.hover,
      [media.reducedMotion]: "0s",
    },
    transitionTimingFunction: duration.ease,
    WebkitTapHighlightColor: "transparent",
  },
  top: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space["2"],
  },
  mark: {
    display: "grid",
    placeItems: "center",
    width: size.controlSm,
    height: size.controlSm,
    borderRadius: radius.mark,
    cornerShape: radius.shape,
    backgroundColor: colors.muted,
    color: colors.foreground,
  },
  // The card's height, in words: one of three, by its state.
  height: {
    display: "grid",
    fontFamily: font.mono,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
  word: { gridArea: "1 / 1", justifySelf: "end", whiteSpace: "nowrap" },
  rest: {
    visibility: {
      default: "visible",
      [stylex.when.ancestor(":hover", liftCard)]: {
        default: "visible",
        [HOVER]: "hidden",
      },
      [stylex.when.ancestor(":focus-visible", liftCard)]: "hidden",
      [stylex.when.ancestor(":active", liftCard)]: "hidden",
    },
  },
  // Under the pointer or the keyboard, and not while pressed: a press is under the pointer too,
  // and both words stood on each other.
  up: {
    visibility: {
      default: "hidden",
      [stylex.when.ancestor(":is(:hover:not(:active))", liftCard)]: {
        default: "hidden",
        [HOVER]: "visible",
      },
      [stylex.when.ancestor(":is(:focus-visible:not(:active))", liftCard)]:
        "visible",
    },
  },
  down: {
    visibility: {
      default: "hidden",
      [stylex.when.ancestor(":active", liftCard)]: "visible",
    },
  },
  name: {
    margin: 0,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
  },
  line: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
    textWrap: "pretty",
  },
});

const agents = [
  {
    name: "Research agent",
    line: "Reads the week's sources and drafts the summary.",
  },
  {
    name: "Analyst agent",
    line: "Turns the numbers into charts for the board pack.",
  },
  {
    name: "Inbox agent",
    line: "Sorts requests and asks you before it replies.",
  },
];

export default function ElevationHover() {
  return (
    <ul {...stylex.props(styles.grid)}>
      {agents.map((agent) => (
        <li key={agent.name} {...stylex.props(styles.item)}>
          <button
            type="button"
            {...stylex.props(liftCard, styles.card, focusRing)}
          >
            <span {...stylex.props(styles.top)}>
              <span {...stylex.props(styles.mark)}>
                <Icon icon={WandSparklesIcon} />
              </span>
              <span aria-hidden="true" {...stylex.props(styles.height)}>
                <span {...stylex.props(styles.word, styles.rest)}>edge</span>
                <span {...stylex.props(styles.word, styles.up)}>
                  lift-medium
                </span>
                <span {...stylex.props(styles.word, styles.down)}>
                  lift-low
                </span>
              </span>
            </span>
            <span {...stylex.props(styles.name)}>{agent.name}</span>
            {/* A sentence inside a card, not a label: it wraps (the width check reads data-may-wrap). */}
            <span data-may-wrap="" {...stylex.props(styles.line)}>
              {agent.line}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
