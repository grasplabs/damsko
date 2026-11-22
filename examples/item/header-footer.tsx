import { Badge } from "@grasp-os/ui/components/badge";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemTitle,
} from "@grasp-os/ui/components/item";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 420 },
});

// A line of its own above or under the row's parts: a label and a status at its ends.
export default function ItemHeaderFooter() {
  return (
    <div {...stylex.props(layout.box)}>
      <Item variant="outline">
        <ItemHeader>
          <span>Invoice 2041</span>
          <Badge variant="success">Paid</Badge>
        </ItemHeader>
        <ItemContent>
          <ItemTitle>Northwind Studio</ItemTitle>
          <ItemDescription>€1,240 for October</ItemDescription>
        </ItemContent>
        <ItemFooter>
          <span>Sent on 2 November</span>
        </ItemFooter>
      </Item>
    </div>
  );
}
