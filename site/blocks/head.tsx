import { colors, font, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import { iconVars } from "@grasp-os/ui/lib/vars.stylex";
// A page's head, under its title (the title itself is the layout.s <h1>, styled in site/system/styles/site.css):
//
//   lead        one sentence in two inks: the first clause in ink, the rest quiet (the page's
//               description, split at its first full stop)
//   install     what you copy to use it: the registry command (component pages), as the library's
//               Copy field. The import is not repeated here: the Code tab of every stage shows it.
//
// Get started has a statement in the serif instead of a lead (StatementView). Every part rises
// 8px into place once, 90ms after the one before; still with reduced motion.
import * as stylex from "@stylexjs/stylex";

import { siteColors } from "../system/site-tokens.stylex";
import { CopyValue, partStyles } from "./parts";

const styles = stylex.create({
  head: {
    display: "grid",
    marginTop: space["2"],
  },
  // The lead and the install row are there from the first paint. They once rose in on a delayed
  // animation that held its start, and wherever animation time is held back (a background tab, the
  // app's browser pane) they stayed invisible. The resting state is the finished state.
  arrive: {},
  step1: {},
  step2: {},
  step3: {},
  lead: {
    maxWidth: "40rem",
    margin: 0,
    fontSize: font.textLg,
    lineHeight: font.textLgLine,
    color: colors.foreground,
    textWrap: "pretty",
  },
  quiet: {
    color: colors.subtleForeground,
  },
  statement: {
    maxWidth: "40rem",
    margin: 0,
    marginTop: space["1"],
    fontFamily: font.serif,
    fontSize: font.headingMd,
    lineHeight: font.headingMdLine,
    letterSpacing: font.trackingTitle,
    color: colors.foreground,
    textWrap: "pretty",
  },
  statementQuiet: {
    color: siteColors.subtleForegroundLarge,
  },
  // The install pill.
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    columnGap: space["4"],
    rowGap: space["2"],
    marginTop: space["4"],
  },
});

/**
 * The install command as one compact copy control: the library's Copy field, the one copy control
 * every value on the site uses (site/blocks/parts.tsx, CopyValue).
 */
export function InstallControl({
  value,
  said,
  label,
}: {
  value: string;
  said: string;
  label: string;
}) {
  return (
    <CopyValue install value={value} said={said} label={label} size="default" />
  );
}

/** "First sentence. The rest." into its two inks. */
export const splitLead = (text: string): [string, string] => {
  const at = text.indexOf(". ");
  return at === -1 ? [text, ""] : [text.slice(0, at + 1), text.slice(at + 2)];
};

export interface HeadViewProps {
  lead: string;
  /** The install command, shown as one compact copy control (component pages). */
  install?: { value: string; said: string; label: string };
}

export function HeadView({ lead, install }: HeadViewProps) {
  const [first, rest] = splitLead(lead);
  const root = stylex.props(partStyles.block, styles.head);
  const steps = [styles.step1, styles.step2, styles.step3];
  let step = 0;
  const arrive = () => [styles.arrive, steps[step++]];
  return (
    <div {...root} className={`not-prose site-head ${root.className ?? ""}`}>
      <p {...stylex.props(styles.lead, arrive())}>
        {first} {rest && <span {...stylex.props(styles.quiet)}>{rest}</span>}
      </p>
      {install && (
        <div {...stylex.props(styles.row, arrive())}>
          <InstallControl
            value={install.value}
            said={install.said}
            label={install.label}
          />
        </div>
      )}
    </div>
  );
}

/** Get started: the statement in the serif, two inks, in place of a lead. */
export function StatementView({ text }: { text: string }) {
  const [first, rest] = splitLead(text);
  const root = stylex.props(partStyles.block, styles.head);
  return (
    <div {...root} className={`not-prose site-head ${root.className ?? ""}`}>
      <p {...stylex.props(styles.statement, styles.arrive, styles.step1)}>
        {first}{" "}
        {rest && <span {...stylex.props(styles.statementQuiet)}>{rest}</span>}
      </p>
    </div>
  );
}
