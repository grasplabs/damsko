import { Button } from "@grasp-os/ui/components/button";
import { CheckIcon, Icon, XIcon } from "@grasp-os/ui/lib/icons";
import { colors, font, media, space } from "@grasp-os/ui/lib/tokens.stylex";
// The two sides of a guideline's example: the words to write and the words not to, each drawn in
// the real component. A side is told by its mark and its word, never by colour alone. Used by the
// Writing and Accessibility guidelines' examples (examples/guidelines/).
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

const styles = stylex.create({
  pair: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [media.md]: "repeat(2, minmax(0, 1fr))",
    },
    gap: space["6"],
    alignItems: "start",
    width: "100%",
    minWidth: 0,
  },
  side: { display: "grid", gap: space["3"], minWidth: 0, margin: 0 },
  caption: {
    display: "flex",
    alignItems: "center",
    gap: space["2"],
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    fontWeight: font.weightMedium,
    color: colors.mutedForeground,
  },
  why: { fontWeight: font.weightNormal },
  specimen: {
    display: "grid",
    justifyItems: "start",
    gap: space["3"],
    minWidth: 0,
  },
});

interface SideProps {
  /** The real component, with these words. */
  children: ReactNode;
  /** A few words on why, after the side's own word ("says what it does"). */
  why?: string;
}

/** The words to write. */
export const Write = ({ children, why }: SideProps) => (
  <figure data-side="write" {...stylex.props(styles.side)}>
    <figcaption {...stylex.props(styles.caption)}>
      <Icon icon={CheckIcon} />
      <span>Write</span>
      {why === undefined ? null : (
        <span {...stylex.props(styles.why)}>{why}</span>
      )}
    </figcaption>
    <div {...stylex.props(styles.specimen)}>{children}</div>
  </figure>
);

/** The words not to write. Its specimen is the real component too, so the fault is seen where it lives. */
export const Not = ({ children, why }: SideProps) => (
  <figure data-side="not" {...stylex.props(styles.side)}>
    <figcaption {...stylex.props(styles.caption)}>
      <Icon icon={XIcon} />
      <span>Not</span>
      {why === undefined ? null : (
        <span {...stylex.props(styles.why)}>{why}</span>
      )}
    </figcaption>
    <div {...stylex.props(styles.specimen)}>{children}</div>
  </figure>
);

/** Both sides, beside each other from tablet width, stacked below it. */
export const Pair = ({ children }: { children: ReactNode }) => (
  <div {...stylex.props(styles.pair)}>{children}</div>
);

/** The pair by itself, so this file draws as an example too: every file under examples is a page. */
const PairExample = () => (
  <Pair>
    <Write why="says what it does">
      <Button>Save changes</Button>
    </Write>
    <Not why="says nothing">
      <Button>OK</Button>
    </Not>
  </Pair>
);

export default PairExample;
