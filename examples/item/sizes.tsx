import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from "@grasp-os/ui/components/item";
import { FolderIcon, Icon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 12, width: "100%", maxWidth: 420 },
});

// 16px of room by default; 12px above and below for a dense list.
export default function ItemSizes() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Item variant="outline">
        <ItemMedia variant="icon">
          <Icon icon={FolderIcon} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Spring launch</ItemTitle>
          <ItemDescription>8 files</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant="outline" size="sm">
        <ItemMedia variant="icon">
          <Icon icon={FolderIcon} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Spring launch</ItemTitle>
          <ItemDescription>8 files</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  );
}
