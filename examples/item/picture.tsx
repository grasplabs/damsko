import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGrid,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "@grasp-os/ui/components/item";
import { CoinsIcon, Icon, UsersIcon } from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";
import { colors, radius, space } from "@grasp-os/ui/lib/tokens.stylex";
import { iconVars } from "@grasp-os/ui/lib/vars.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  grid: { maxWidth: 640 },
  // Tiles in one row stand at one height: each tile's picture and words keep to the top of their
  // lines, so the pictures line up whatever the words under them take.
  top: { alignSelf: "flex-start" },
  // The picture takes the tile's width.
  media: { flexGrow: 1, minWidth: 0 },
  // A collection's picture: one of the system's icons, large, on the soft ground.
  picture: {
    [iconVars.size]: space[10],
    display: "flex",
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: "2 / 1",
    borderRadius: radius.mark,
    cornerShape: radius.shape,
    backgroundColor: colors.muted,
    color: colors.mutedForeground,
  },
});

const collections: {
  id: string;
  icon: IconData;
  name: string;
  line: string;
}[] = [
  {
    id: "pricing",
    icon: CoinsIcon,
    name: "Pricing",
    line: "How we price each plan, and what changed this year.",
  },
  {
    id: "people",
    icon: UsersIcon,
    name: "People and teams",
    line: "Who owns what, and who to ask.",
  },
];

// Knowledge's collections as tiles, each one link: a picture over its name and one line. The
// picture is an ItemMedia in the tile's ItemHeader, so it stands above the words at their width.
export default function ItemPicture() {
  return (
    <ItemGrid aria-label="Collections" style={layout.grid}>
      {collections.map((collection) => (
        <Item key={collection.id} variant="outline" href={`#${collection.id}`}>
          <ItemHeader style={layout.top}>
            <ItemMedia align="center" style={layout.media}>
              <span aria-hidden="true" {...stylex.props(layout.picture)}>
                <Icon icon={collection.icon} />
              </span>
            </ItemMedia>
          </ItemHeader>
          <ItemContent style={layout.top}>
            <ItemTitle>{collection.name}</ItemTitle>
            <ItemDescription>{collection.line}</ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGrid>
  );
}
