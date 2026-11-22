import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from "@grasp-os/ui/components/item";
import { Icon, InboxIcon, SettingsIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 12, width: "100%", maxWidth: 420 },
});

// An icon in a square says what kind of thing it is, before its name.
export default function ItemIcon() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Item variant="outline">
        <ItemMedia variant="icon">
          <Icon icon={InboxIcon} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Shared inbox</ItemTitle>
          <ItemDescription>12 messages waiting</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant="outline">
        <ItemMedia variant="icon">
          <Icon icon={SettingsIcon} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Workspace settings</ItemTitle>
          <ItemDescription>Members, roles and billing</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  );
}
