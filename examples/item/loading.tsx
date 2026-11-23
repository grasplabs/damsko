import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@grasp-os/ui/components/item";
import { Fragment } from "react";

// Before the data: each part given empty waits as a quiet placeholder of its own size, so every
// row already stands as tall as it will.
export default function ItemLoading() {
  return (
    <ItemGroup separated aria-label="Projects">
      {[0, 1, 2].map((row) => (
        <Item key={row} loading>
          <ItemMedia variant="icon" />
          <ItemContent>
            <ItemTitle />
            <ItemDescription />
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  );
}
