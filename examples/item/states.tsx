import { Item, ItemContent, ItemTitle } from "@grasp-os/ui/components/item";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: 160, maxWidth: "100%" },
});

// One item in one state. The docs draw it once per state; a row with `href` is the one that
// answers a pointer, so hover, keyboard focus and pressed are forced from its own CSS.
export default function ItemState({
  variant = "default",
}: {
  variant?: "default" | "outline" | "muted";
}) {
  return (
    <div {...stylex.props(layout.box)}>
      <Item href="#billing" variant={variant} size="sm">
        <ItemContent>
          <ItemTitle>Billing</ItemTitle>
        </ItemContent>
      </Item>
    </div>
  );
}
