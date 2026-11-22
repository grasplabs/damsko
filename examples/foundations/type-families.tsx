import {
  colors,
  font,
  media,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
// Type, scene: three families, three jobs. The serif names things, Geist does the work in two
// weights, and Geist Mono holds whatever has to be typed exactly. Each family shown large, saying
// its own job in its own letters.
import * as stylex from "@stylexjs/stylex";

// By the scene's own room, not the window's: three across only where each family has 13rem or
// more, so its sentence stands on two lines, not five.
const stacked = "@container families (width < 42rem)";

const styles = stylex.create({
  // A container has no width of its own to give: it takes the room it is handed.
  room: {
    width: "100%",
    containerType: "inline-size",
    containerName: "families",
  },
  row: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(3, minmax(0, 1fr))",
      [stacked]: "minmax(0, 1fr)",
    },
  },
  family: {
    display: "grid",
    alignContent: "start",
    rowGap: space["3"],
    minWidth: 0,
    paddingBlock: space["8"],
    paddingInline: { default: space["6"], [media.maxSm]: space["5"] },
    boxShadow: {
      default: `inset calc(-1 * ${size.hairline}) 0 0 ${colors.border}`,
      [stacked]: `inset 0 calc(-1 * ${size.hairline}) 0 ${colors.border}`,
      ":last-child": "none",
    },
  },
  glyphs: {
    margin: 0,
    marginBottom: space["4"],
    fontSize: font.headingXl,
    lineHeight: font.headingXlLine,
    fontWeight: font.weightNormal,
    color: colors.foreground,
  },
  name: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    fontWeight: font.weightMedium,
    color: colors.mutedForeground,
  },
  job: {
    margin: 0,
    fontSize: font.textLg,
    lineHeight: font.textLgLine,
    color: colors.foreground,
    textWrap: "pretty",
  },
  sample: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
    textWrap: "pretty",
  },
  serif: { fontFamily: font.serif, letterSpacing: font.trackingTitle },
  sans: { fontFamily: font.sans },
  mono: { fontFamily: font.mono },
  serifJob: { fontFamily: font.serif },
  medium: { fontWeight: font.weightMedium },
  regular: { fontWeight: font.weightNormal },
});

export default function TypeFamilies() {
  return (
    <div {...stylex.props(styles.room)}>
      <div {...stylex.props(styles.row)}>
        <div {...stylex.props(styles.family)}>
          <p aria-hidden="true" {...stylex.props(styles.glyphs, styles.serif)}>
            Aa
          </p>
          <p {...stylex.props(styles.name)}>Geist Serif, 400</p>
          <p {...stylex.props(styles.job, styles.serifJob)}>
            Names things: a page, a figure, a project.
          </p>
          <p {...stylex.props(styles.sample, styles.serifJob)}>
            Quarterly board report
          </p>
        </div>
        <div {...stylex.props(styles.family)}>
          <p aria-hidden="true" {...stylex.props(styles.glyphs, styles.sans)}>
            Aa
          </p>
          <p {...stylex.props(styles.name)}>Geist, 400 and 500</p>
          <p {...stylex.props(styles.job, styles.sans)}>
            Does the work: every label, line and cell.
          </p>
          <p {...stylex.props(styles.sample, styles.sans)}>
            <span {...stylex.props(styles.medium)}>Approve</span> or decline the
            agent's draft.
          </p>
        </div>
        <div {...stylex.props(styles.family)}>
          <p aria-hidden="true" {...stylex.props(styles.glyphs, styles.mono)}>
            Aa
          </p>
          <p {...stylex.props(styles.name)}>Geist Mono, 400</p>
          <p {...stylex.props(styles.job, styles.mono)}>
            Holds what is typed exactly.
          </p>
          <p {...stylex.props(styles.sample, styles.mono)}>
            run_7f3k · 02:14:09
          </p>
        </div>
      </div>
    </div>
  );
}
