import { colors, space } from "@grasp-os/ui/lib/tokens.stylex";
// A component's guidance on its page, one Do / Don't block: what always holds and what never to do.
// The same lists as Rules, in the same look; the words come from the page's own
// <Intent always never> (site/guidance.ts).
import * as stylex from "@stylexjs/stylex";

import { siteSize } from "../system/site-tokens.stylex";
import { partStyles } from "./parts";
import { List, ruleStyles } from "./rules";

export interface GuidanceViewProps {
  /** The column of what to do: the page's Always rules. */
  does: string[];
  /** The column of what not to do: the page's Never rules. */
  donts: string[];
  doTitle?: string;
  dontTitle?: string;
}

/** A page's guidance as one Do / Don't block: two short columns, stacked on a phone. */
export function GuidanceView({
  does,
  donts,
  doTitle = "Do",
  dontTitle = "Don't",
}: GuidanceViewProps) {
  const root = stylex.props(partStyles.block, ruleStyles.lists);
  return (
    <div
      data-intent=""
      data-guidance=""
      {...root}
      className={`not-prose ${root.className ?? ""}`}
    >
      {does.length > 0 && <List title={doTitle} items={does} mark="do" />}
      {donts.length > 0 && <List title={dontTitle} items={donts} mark="dont" />}
    </div>
  );
}

/** Components that could do the same job, each with its page's sentence, two to a row. On a component's
 * page (`title` given: "Could be taken for", the group's name) the page's own row is marked. */
export function ChooseView({
  rows,
  title,
}: {
  rows: { title: string; lines: string[]; current?: boolean }[];
  title?: string;
}) {
  const root = stylex.props(partStyles.block, ruleStyles.lists);
  const lists = (
    <div
      data-choose=""
      {...root}
      className={`not-prose ${root.className ?? ""}`}
    >
      {rows.map((row) => (
        <div
          key={row.title}
          data-current={row.current ? "" : undefined}
          {...stylex.props(row.current && chooseStyles.current)}
        >
          <List title={row.title} items={row.lines} />
        </div>
      ))}
    </div>
  );
  if (title === undefined) {
    return lists;
  }
  return (
    <section data-could-be="" {...stylex.props(chooseStyles.group)}>
      <p {...stylex.props(partStyles.heading, chooseStyles.label)}>{title}</p>
      {lists}
    </section>
  );
}

const chooseStyles = stylex.create({
  group: {
    display: "grid",
    rowGap: space["3"],
    marginBlockStart: space["6"],
  },
  label: { margin: 0, color: colors.mutedForeground },
  // The page's own row: a mint mark down its start, as the sidebar marks where you are.
  current: {
    paddingInlineStart: space["3"],
    boxShadow: `inset ${siteSize.frameMark} 0 0 ${colors.mint}`,
  },
});
