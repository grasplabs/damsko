import {
  Item,
  ItemGroup,
  ItemContent,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
} from "@grasp-os/ui/components/item";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 420 },
});

// With `href` the whole row is one link, with a chevron at its end; a hairline between plain rows.
export default function ItemLinks() {
  return (
    <div {...stylex.props(layout.box)}>
      <ItemGroup aria-label="Settings">
        <Item href="#profile">
          <ItemContent>
            <ItemTitle>Profile</ItemTitle>
            <ItemDescription>Name, photo and time zone</ItemDescription>
          </ItemContent>
        </Item>
        <ItemSeparator />
        <Item href="#notifications">
          <ItemContent>
            <ItemTitle>Notifications</ItemTitle>
            <ItemDescription>What reaches you, and where</ItemDescription>
          </ItemContent>
        </Item>
        <ItemSeparator />
        <Item href="#billing">
          <ItemContent>
            <ItemTitle>Billing</ItemTitle>
            <ItemDescription>Plan, invoices and payment</ItemDescription>
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  );
}
