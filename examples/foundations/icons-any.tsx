import { Button } from "@grasp-os/ui/components/button";
import { directional, Icon } from "@grasp-os/ui/lib/icons";
import { font, media, space } from "@grasp-os/ui/lib/tokens.stylex";
import {
  ArrowRight03Icon,
  Briefcase01Icon,
  FloppyDiskIcon,
  HelpCircleIcon,
  Plug01Icon,
} from "@hugeicons/core-free-icons";
// Icons, scene: a drawing the house set does not hold. The product imports it from Hugeicons, the
// package lib/icons draws from, and draws it through the same Icon: the holder's size, stroke and
// colour, like any icon of the set. An arrow is marked directional where it is named, so it turns
// round in right-to-left text.
import * as stylex from "@stylexjs/stylex";

const NextIcon = directional(ArrowRight03Icon);

const styles = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [media.maxMd]: "minmax(0, 1fr)",
    },
    rowGap: space["6"],
    columnGap: space["8"],
    padding: { default: space["8"], [media.maxSm]: space["5"] },
  },
  part: { display: "grid", alignContent: "start", rowGap: space["3"] },
  row: { display: "flex", flexWrap: "wrap", gap: space["2"] },
  caption: {
    margin: 0,
    fontFamily: font.mono,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
  },
});

export default function IconsAny() {
  return (
    <div {...stylex.props(styles.grid)}>
      <div {...stylex.props(styles.part)}>
        <p {...stylex.props(styles.caption)}>@hugeicons/core-free-icons</p>
        <div {...stylex.props(styles.row)}>
          <Button variant="outline">
            <Icon icon={FloppyDiskIcon} />
            Save draft
          </Button>
          <Button variant="outline">
            <Icon icon={Briefcase01Icon} />
            Clients
          </Button>
          <Button variant="outline">
            <Icon icon={Plug01Icon} />
            Connect
          </Button>
          <Button variant="ghost" size="icon" aria-label="Help">
            <Icon icon={HelpCircleIcon} />
          </Button>
        </div>
      </div>
      <div {...stylex.props(styles.part)}>
        <p {...stylex.props(styles.caption)}>directional</p>
        <div {...stylex.props(styles.row)}>
          <Button variant="outline">
            Next
            <Icon icon={NextIcon} />
          </Button>
          <div dir="rtl" lang="ar">
            <Button variant="outline">
              التالي
              <Icon icon={NextIcon} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
