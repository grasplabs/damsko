"use client";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@grasp-os/ui/components/item";
import { Icon, PlusIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 420 },
});

// A row that is one button, out of use (`disabled`): dimmed as a disabled Button is, and it takes
// no press. Its description says why, and is said with its name.
export default function ItemDisabled() {
  return (
    <div {...stylex.props(layout.box)}>
      <Item variant="outline" size="sm" disabled onClick={() => undefined}>
        <ItemMedia>
          <Icon icon={PlusIcon} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Add a field</ItemTitle>
          <ItemDescription>A form holds 20 fields at most</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  );
}
