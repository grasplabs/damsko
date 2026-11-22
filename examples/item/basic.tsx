import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from "@grasp-os/ui/components/item";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 12, width: "100%", maxWidth: 420 },
});

// A name and a line about it. Outlined when the row stands alone, soft on a quieter fill.
export default function ItemBasic() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Quarterly summary</ItemTitle>
          <ItemDescription>Shared with the finance team</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant="muted">
        <ItemContent>
          <ItemTitle>Supplier list for the spring</ItemTitle>
          <ItemDescription>Last edited on 4 November</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  );
}
