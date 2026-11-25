"use client";

import { ScrollArea } from "@grasp-os/ui/components/scroll-area";
import {
  SortableList,
  SortableListHandle,
  SortableListItem,
} from "@grasp-os/ui/components/sortable-list";
import { Text } from "@grasp-os/ui/components/text";
import { colors, radius, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  frame: {
    width: "100%",
    maxWidth: 320,
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
    backgroundColor: colors.card,
  },
  area: { height: 200 },
  list: { margin: space["2"] },
});

const columns = [
  "Name",
  "Owner",
  "Status",
  "Priority",
  "Due",
  "Created",
  "Updated",
  "Team",
  "Labels",
  "Estimate",
  "Cycle",
  "Project",
];

// A longer list in a box that scrolls: a drag near the box's top or bottom edge scrolls it, so an
// item goes to a place the box does not show yet.
export default function SortableListScrolling() {
  const [order, setOrder] = useState(columns);
  return (
    <div {...stylex.props(layout.frame)}>
      <ScrollArea style={layout.area}>
        <SortableList
          aria-label="Columns, in order"
          value={order}
          onValueChange={setOrder}
          style={layout.list}
        >
          {order.map((column) => (
            <SortableListItem key={column} value={column}>
              <SortableListHandle aria-label={`Move ${column}`} />
              <Text size="sm" color="default">
                {column}
              </Text>
            </SortableListItem>
          ))}
        </SortableList>
      </ScrollArea>
    </div>
  );
}
