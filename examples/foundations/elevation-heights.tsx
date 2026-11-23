import { Badge } from "@grasp-os/ui/components/badge";
import { Button } from "@grasp-os/ui/components/button";
import { Input } from "@grasp-os/ui/components/input";
import { SearchIcon } from "@grasp-os/ui/lib/icons";
import {
  colors,
  font,
  media,
  radius,
  shadow,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
// Elevation, scene: one edge and three lifts, at work on one screen. A list lies in the page on
// the edge; a field and its button stand off it on low lift; an approval card floats on medium
// lift; a dialog comes over everything on high lift. Each says its height in a small label.
import * as stylex from "@stylexjs/stylex";

const PHONE = media.maxSm;

const styles = stylex.create({
  screen: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(12, minmax(0, 1fr))",
      [PHONE]: "minmax(0, 1fr)",
    },
    columnGap: space["4"],
    rowGap: { default: space["6"], [PHONE]: space["8"] },
    paddingBlock: { default: space["10"], [PHONE]: space["6"] },
    paddingInline: { default: space["10"], [PHONE]: space["4"] },
    fontFamily: font.sans,
    color: colors.bodyForeground,
  },
  layer: {
    display: "grid",
    rowGap: space["2"],
    minWidth: 0,
    alignContent: "start",
  },
  toolbar: {
    gridColumn: { default: "1 / 13", [PHONE]: "auto" },
    gridRow: { default: "1", [PHONE]: "auto" },
  },
  list: {
    gridColumn: { default: "1 / 9", [PHONE]: "auto" },
    gridRow: { default: "2 / 4", [PHONE]: "auto" },
  },
  card: {
    gridColumn: { default: "7 / 13", [PHONE]: "auto" },
    gridRow: { default: "2", [PHONE]: "auto" },
    marginTop: { default: space["10"], [PHONE]: 0 },
    zIndex: 1,
  },
  dialog: {
    gridColumn: { default: "4 / 12", [PHONE]: "auto" },
    gridRow: { default: "3 / 5", [PHONE]: "auto" },
    marginTop: { default: space["16"], [PHONE]: 0 },
    zIndex: 2,
  },
  // On a wide screen a floating layer's name sits under it, at its end, on the open ground.
  below: {
    order: { default: 1, [PHONE]: 0 },
    justifySelf: { default: "end", [PHONE]: "start" },
  },
  // The height's name, quiet, above what wears it.
  label: {
    margin: 0,
    fontFamily: font.mono,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
  tools: { display: "flex", gap: space["2"], alignItems: "center" },
  field: { flexGrow: 1, minWidth: 0 },

  // The list lies in the page: raised, with the edge only.
  sheet: {
    minWidth: 0,
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: size.borderStrong,
    overflow: "hidden",
  },
  sheetHead: {
    margin: 0,
    paddingBlock: space["3"],
    paddingInline: space["4"],
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
  },
  rows: { margin: 0, padding: 0, listStyle: "none" },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space["3"],
    paddingBlock: space["3"],
    paddingInline: space["4"],
    boxShadow: `inset 0 ${size.hairline} 0 ${colors.border}`,
  },
  rowWords: { display: "grid", minWidth: 0 },
  rowTitle: {
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.foreground,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  rowWho: {
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },

  // The approval floats: medium lift.
  float: {
    display: "grid",
    rowGap: space["2"],
    minWidth: 0,
    padding: space["4"],
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    justifyItems: "start",
    backgroundColor: colors.card,
    boxShadow: shadow.md,
  },
  // The dialog comes over everything: high lift.
  over: {
    display: "grid",
    rowGap: space["2"],
    minWidth: 0,
    padding: space["5"],
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: shadow.lg,
  },
  title: {
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
  actions: {
    justifySelf: "stretch",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: space["2"],
    marginTop: space["2"],
  },
});

const reports = [
  {
    title: "Q3 revenue summary",
    who: "Research agent",
    variant: "success",
    state: "Ready",
  },
  {
    title: "Churn by plan",
    who: "Analyst agent",
    variant: "info",
    state: "Drafting",
  },
  {
    title: "Board pack, October",
    who: "Anna de Vries",
    variant: "default",
    state: "Draft",
  },
  {
    title: "Hiring plan 2027",
    who: "Planning agent",
    variant: "warning",
    state: "Waiting",
  },
] as const;

export default function ElevationHeights() {
  return (
    <div {...stylex.props(styles.screen)}>
      <div {...stylex.props(styles.layer, styles.toolbar)}>
        <p {...stylex.props(styles.label)}>lift-low</p>
        <div {...stylex.props(styles.tools)}>
          <Input
            type="search"
            icon={SearchIcon}
            placeholder="Search"
            aria-label="Search reports"
            style={styles.field}
          />
          <Button variant="default">New report</Button>
        </div>
      </div>

      <div {...stylex.props(styles.layer, styles.list)}>
        <p {...stylex.props(styles.label)}>edge</p>
        <div {...stylex.props(styles.sheet)}>
          <p {...stylex.props(styles.sheetHead)}>Reports</p>
          <ul {...stylex.props(styles.rows)}>
            {reports.map((report) => (
              <li key={report.title} {...stylex.props(styles.row)}>
                <span {...stylex.props(styles.rowWords)}>
                  <span {...stylex.props(styles.rowTitle)}>{report.title}</span>
                  <span {...stylex.props(styles.rowWho)}>{report.who}</span>
                </span>
                <Badge variant={report.variant} size="sm">
                  {report.state}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div {...stylex.props(styles.layer, styles.card)}>
        <p {...stylex.props(styles.label, styles.below)}>lift-medium</p>
        <div {...stylex.props(styles.float)}>
          <Badge variant="warning" size="sm">
            Waiting for you
          </Badge>
          <p {...stylex.props(styles.title)}>
            Send the churn report to 4 people
          </p>
          <p {...stylex.props(styles.line)}>
            The analyst agent finished it at 09:40.
          </p>
          <div {...stylex.props(styles.actions)}>
            <Button size="sm" variant="outline">
              Decline
            </Button>
            <Button size="sm" variant="default">
              Approve
            </Button>
          </div>
        </div>
      </div>

      <div {...stylex.props(styles.layer, styles.dialog)}>
        <p {...stylex.props(styles.label, styles.below)}>lift-high</p>
        <div
          role="group"
          aria-label="Publish the board pack"
          {...stylex.props(styles.over)}
        >
          <p {...stylex.props(styles.title)}>Publish the board pack</p>
          <p {...stylex.props(styles.line)}>
            Everyone in the workspace can read it once it is published.
          </p>
          <div {...stylex.props(styles.actions)}>
            <Button variant="outline">Cancel</Button>
            <Button variant="default">Publish</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
