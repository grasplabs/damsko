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
// row already stands as tall as it will. A bare icon (ItemMedia's default) waits as a block the
// icon's size.
export default function ItemLoading() {
  return (
    <>
      <ItemGroup aria-label="Projects">
        {[0, 1, 2].map((row) => (
          <Fragment key={row}>
            {row > 0 && <ItemSeparator />}
            <Item loading>
              <ItemMedia variant="icon" />
              <ItemContent>
                <ItemTitle />
                <ItemDescription />
              </ItemContent>
            </Item>
          </Fragment>
        ))}
      </ItemGroup>
      <ItemGroup aria-label="Files">
        <Item loading size="xs">
          <ItemMedia />
          <ItemContent>
            <ItemTitle />
          </ItemContent>
        </Item>
      </ItemGroup>
    </>
  );
}
