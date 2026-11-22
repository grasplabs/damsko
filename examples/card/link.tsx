import {
  CardDescription,
  CardLink,
  CardMedia,
  CardTitle,
} from "@grasp-os/ui/components/card";
import { CoinsIcon, Icon, UsersIcon } from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";
import { colors, space } from "@grasp-os/ui/lib/tokens.stylex";
import { iconVars } from "@grasp-os/ui/lib/vars.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 15rem), 1fr))",
    gap: space[4],
    width: "100%",
    maxWidth: 640,
  },
  // A collection's tile: one of the system's icons, large, on the soft ground.
  tile: {
    [iconVars.size]: space[10],
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: "2 / 1",
    backgroundColor: colors.muted,
    color: colors.mutedForeground,
  },
});

const Tile = ({ icon }: { icon: IconData }) => (
  <span aria-hidden="true" {...stylex.props(layout.tile)}>
    <Icon icon={icon} />
  </span>
);

// Knowledge's collections, each a card that is one link: hovered or focused by the keys, its tile
// dims and its title is underlined. Nothing lifts or moves.
export default function CardLinkExample() {
  return (
    <div {...stylex.props(layout.grid)}>
      <CardLink href="#pricing">
        <CardMedia>
          <Tile icon={CoinsIcon} />
        </CardMedia>
        <CardTitle>Pricing</CardTitle>
        <CardDescription>
          How we price each plan, and what changed this year.
        </CardDescription>
      </CardLink>
      <CardLink href="#people">
        <CardMedia>
          <Tile icon={UsersIcon} />
        </CardMedia>
        <CardTitle>People and teams</CardTitle>
        <CardDescription>Who owns what, and who to ask.</CardDescription>
      </CardLink>
    </div>
  );
}
