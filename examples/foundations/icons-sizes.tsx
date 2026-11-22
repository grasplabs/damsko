import {
  CircleCheckIcon,
  ClockIcon,
  FolderIcon,
  Icon,
  InboxIcon,
  UsersIcon,
  WandSparklesIcon,
} from "@grasp-os/ui/lib/icons";
import {
  colors,
  font,
  media,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import { iconVars } from "@grasp-os/ui/lib/vars.stylex";
// Icons, scene: two sizes and one stroke. A drawing up close shows its line, 1.5 in a 24-unit grid;
// beside it the two sizes sit next to the words they belong with: icon-sm with text-sm in a dense
// row, icon-md with text-md where there is room.
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 2fr) minmax(0, 3fr)",
      [media.maxMd]: "minmax(0, 1fr)",
    },
  },
  close: {
    // Ten times the small size, on its own 24-unit grid, so the one stroke can be seen.
    [iconVars.size]: `calc(${size.iconSm} * 10)`,
    display: "grid",
    placeItems: "center",
    rowGap: space["4"],
    paddingBlock: space["10"],
    paddingInline: space["6"],
    color: colors.foreground,
    boxShadow: {
      default: `inset calc(-1 * ${size.hairline}) 0 0 ${colors.border}`,
      [media.maxMd]: `inset 0 calc(-1 * ${size.hairline}) 0 ${colors.border}`,
    },
  },
  drawing: {
    backgroundImage: `linear-gradient(${colors.border} ${size.hairline}, transparent ${size.hairline}), linear-gradient(90deg, ${colors.border} ${size.hairline}, transparent ${size.hairline})`,
    backgroundSize: `calc(100% / 24) calc(100% / 24)`,
    boxShadow: `inset 0 0 0 ${size.hairline} ${colors.border}`,
  },
  caption: {
    margin: 0,
    fontFamily: font.mono,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
    whiteSpace: "nowrap",
  },
  sizes: {
    display: "grid",
    alignContent: "center",
    rowGap: space["8"],
    paddingBlock: space["8"],
    paddingInline: { default: space["8"], [media.maxSm]: space["5"] },
  },
  size: { display: "grid", rowGap: space["3"] },
  token: {
    margin: 0,
    fontFamily: font.mono,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
  line: {
    display: "flex",
    flexWrap: "wrap",
    columnGap: space["6"],
    rowGap: space["3"],
    margin: 0,
    padding: 0,
    listStyle: "none",
    fontFamily: font.sans,
    color: colors.bodyForeground,
  },
  item: { display: "flex", alignItems: "center", whiteSpace: "nowrap" },
  sm: {
    [iconVars.size]: size.iconSm,
    columnGap: space["1"],
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
  md: {
    [iconVars.size]: size.iconDefault,
    columnGap: space["2"],
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
  },
});

const words = [
  { icon: WandSparklesIcon, text: "Research agent" },
  { icon: ClockIcon, text: "Due Friday" },
  { icon: CircleCheckIcon, text: "3 approved" },
];
const nav = [
  { icon: InboxIcon, text: "Inbox" },
  { icon: FolderIcon, text: "Projects" },
  { icon: UsersIcon, text: "Team" },
];

export default function IconsSizes() {
  return (
    <div {...stylex.props(styles.grid)}>
      <div {...stylex.props(styles.close)}>
        <div {...stylex.props(styles.drawing)}>
          <Icon icon={WandSparklesIcon} />
        </div>
        <p {...stylex.props(styles.caption)}>stroke 1.5 of 24</p>
      </div>
      <div {...stylex.props(styles.sizes)}>
        <div {...stylex.props(styles.size)}>
          <p {...stylex.props(styles.token)}>icon-sm, text-sm</p>
          <ul {...stylex.props(styles.line)}>
            {words.map((entry) => (
              <li key={entry.text} {...stylex.props(styles.item, styles.sm)}>
                <Icon icon={entry.icon} />
                {entry.text}
              </li>
            ))}
          </ul>
        </div>
        <div {...stylex.props(styles.size)}>
          <p {...stylex.props(styles.token)}>icon-md, text-md</p>
          <ul {...stylex.props(styles.line)}>
            {nav.map((entry) => (
              <li key={entry.text} {...stylex.props(styles.item, styles.md)}>
                <Icon icon={entry.icon} />
                {entry.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
