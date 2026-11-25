import { CheckIcon, Icon, XIcon } from "@grasp-os/ui/lib/icons";
import { focusRingText } from "@grasp-os/ui/lib/styles";
import {
  colors,
  duration,
  media,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import { iconVars } from "@grasp-os/ui/lib/vars.stylex";
// The rules that belong to no single example: at most four Always and four Never, in two columns,
// each under its heading (the page's h3) in plain sentences on hairlines. A Do list's heading carries a tick
// and a Don't list's a cross: the one mark and colour here, so the two read at a glance. A rule that a section above shows links to it. Each section's own note holds its own rule.
import * as stylex from "@stylexjs/stylex";
import { Fragment } from "react";

import { partStyles, rich } from "./parts";

export const ruleStyles = stylex.create({
  lists: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [media.maxSm]: "minmax(0, 1fr)",
    },
    columnGap: space["8"],
    rowGap: space["8"],
    marginTop: space["6"],
  },
  tag: { paddingBottom: space["2"] },
  // A heading with its mark: the tick or cross before the word, on its line.
  marked: {
    [iconVars.size]: size.iconSm,
    [iconVars.stroke]: size.iconStroke,
    display: "flex",
    alignItems: "center",
    gap: space["2"],
  },
  mark: { display: "inline-flex", flexShrink: 0 },
  markDo: { color: colors.success },
  markDont: { color: colors.destructive },
  list: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    boxShadow: `inset 0 -1px 0 ${colors.border}`,
  },
  item: {
    paddingBlock: space["3"],
    color: colors.bodyForeground,
    textWrap: "pretty",
    boxShadow: `inset 0 1px 0 ${colors.border}`,
  },
  link: {
    color: colors.foreground,
    textDecorationLine: "underline",
    textDecorationThickness: 1,
    textUnderlineOffset: 3,
    textDecorationColor: {
      default: `color-mix(in oklch, ${colors.foreground} 30%, transparent)`,
      ":hover": { default: null, [media.hover]: colors.foreground },
    },
    transitionProperty: "text-decoration-color",
    transitionDuration: duration.hover,
    transitionTimingFunction: duration.ease,
    borderRadius: radius.xs,
    cornerShape: radius.shape,
  },
});

/** A rule, with an optional link: "Say how it went, on the button: [the life of an action](#every-state)." */
const sentence = (text: string) =>
  text.split(/(\[[^\]]+\]\([^)]+\))/u).map((part, index) => {
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/u.exec(part);
    return link ? (
      <a
        key={index}
        href={link[2]}
        {...stylex.props(ruleStyles.link, focusRingText)}
      >
        {link[1]}
      </a>
    ) : (
      <Fragment key={index}>{rich(part)}</Fragment>
    );
  });

/** One titled list of sentences on hairlines: Rules' Always and Never, and Intent's lists (intent.tsx). */
export function List({
  title,
  items,
  mark,
}: {
  title: string;
  items: string[];
  mark?: "do" | "dont";
}) {
  return (
    <div>
      {/* A title may be a link to the component it names (the Choosing page). */}
      <h3
        {...stylex.props(
          partStyles.heading,
          ruleStyles.tag,
          mark !== undefined && ruleStyles.marked
        )}
      >
        {mark !== undefined && (
          <span
            aria-hidden="true"
            data-mark={mark}
            {...stylex.props(
              ruleStyles.mark,
              mark === "do" ? ruleStyles.markDo : ruleStyles.markDont
            )}
          >
            <Icon icon={mark === "do" ? CheckIcon : XIcon} />
          </span>
        )}
        {sentence(title)}
      </h3>
      <ul {...stylex.props(ruleStyles.list)}>
        {items.map((item) => (
          <li key={item} {...stylex.props(ruleStyles.item)}>
            {sentence(item)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RulesView({
  always = [],
  never = [],
}: {
  always?: string[];
  never?: string[];
}) {
  if (always.length > 4 || never.length > 4) {
    throw new Error(
      "Rules: at most four Always and four Never. Put the others in their sections' notes."
    );
  }
  const root = stylex.props(partStyles.block, ruleStyles.lists);
  return (
    <div {...root} className={`not-prose ${root.className ?? ""}`}>
      {always.length > 0 && <List title="Always" items={always} mark="do" />}
      {never.length > 0 && <List title="Never" items={never} mark="dont" />}
    </div>
  );
}
