import { Button } from "@grasp-os/ui/components/button";
import { Tag } from "@grasp-os/ui/components/tag";
import {
  colors,
  font,
  media,
  radius,
  shadow,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
// Corners, scene: capped at half the height. Real parts in a row, shortest first. Each takes the one
// corner, but never more than half its own height, so a tag and the small buttons come out as pills
// and only the tallest parts show the corner whole.
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  stage: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-end",
    justifyContent: "center",
    columnGap: { default: space["5"], [media.maxSm]: space["4"] },
    rowGap: space["8"],
    margin: 0,
    paddingBlock: space["10"],
    paddingInline: { default: space["8"], [media.maxSm]: space["4"] },
    listStyle: "none",
  },
  part: { display: "grid", justifyItems: "center", rowGap: space["3"] },
  facts: {
    display: "grid",
    justifyItems: "center",
    fontFamily: font.mono,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
    whiteSpace: "nowrap",
    fontVariantNumeric: "tabular-nums",
  },
  corner: { color: colors.foreground },
  card: {
    display: "grid",
    alignContent: "end",
    rowGap: space["1"],
    width: `calc(${radius.base} * 7)`,
    minHeight: `calc(${radius.base} * 5)`,
    padding: space["4"],
    borderRadius: radius.base,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: shadow.sm,
    fontFamily: font.sans,
  },
  title: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
  },
  line: {
    margin: 0,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
});

function Facts({ tall, corner }: { tall: number; corner: number }) {
  return (
    <span {...stylex.props(styles.facts)}>
      <span>{tall}px tall</span>
      <span {...stylex.props(styles.corner)}>corner {corner}</span>
    </span>
  );
}

export default function CornersCap() {
  return (
    <ul {...stylex.props(styles.stage)}>
      <li {...stylex.props(styles.part)}>
        <Tag>Draft</Tag>
        <Facts tall={24} corner={12} />
      </li>
      <li {...stylex.props(styles.part)}>
        <Button size="xs" variant="outline">
          Try again
        </Button>
        <Facts tall={28} corner={14} />
      </li>
      <li {...stylex.props(styles.part)}>
        <Button size="sm" variant="outline">
          Open
        </Button>
        <Facts tall={32} corner={16} />
      </li>
      <li {...stylex.props(styles.part)}>
        <Button variant="outline">Share</Button>
        <Facts tall={36} corner={18} />
      </li>
      <li {...stylex.props(styles.part)}>
        <Button size="lg" variant="default">
          Approve
        </Button>
        <Facts tall={44} corner={20} />
      </li>
      <li {...stylex.props(styles.part)}>
        <div {...stylex.props(styles.card)}>
          <p {...stylex.props(styles.title)}>Q3 review</p>
          <p {...stylex.props(styles.line)}>Report, 12 pages</p>
        </div>
        <Facts tall={100} corner={20} />
      </li>
    </ul>
  );
}
