import { Avatar, AvatarFallback } from "@grasp-os/ui/components/avatar";
import {
  Item,
  ItemGroup,
  ItemMedia,
  ItemContent,
  ItemSeparator,
  ItemTitle,
  ItemDetail,
  ItemDescription,
} from "@grasp-os/ui/components/item";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 560 },
});

// A name and a quieter word on its line (`detail`): who it is to you, or its role.
export default function ItemWithDetail() {
  return (
    <div {...stylex.props(layout.box)}>
      <ItemGroup aria-label="Members">
        <Item size="xs">
          <ItemMedia align="center">
            <Avatar name="Anna de Vries" size="xs" decorative>
              <AvatarFallback />
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>
              Anna de Vries
              <ItemDetail>You</ItemDetail>
            </ItemTitle>
            <ItemDescription>anna@northwind.example</ItemDescription>
          </ItemContent>
        </Item>
        <ItemSeparator />
        <Item size="xs">
          <ItemMedia align="center">
            <Avatar name="Ravi Menon" size="xs" decorative>
              <AvatarFallback />
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>
              Ravi Menon
              <ItemDetail>Admin</ItemDetail>
            </ItemTitle>
            <ItemDescription>ravi@northwind.example</ItemDescription>
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  );
}
