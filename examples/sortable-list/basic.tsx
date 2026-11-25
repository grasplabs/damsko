"use client";

import {
  SortableList,
  SortableListHandle,
  SortableListItem,
} from "@grasp-os/ui/components/sortable-list";
import { Text } from "@grasp-os/ui/components/text";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const steps: Record<string, string> = {
  welcome: "Welcome",
  ai: "Its AI",
  people: "Its people",
  tools: "Its tools",
  review: "Review",
};

const layout = stylex.create({
  list: { width: "100%", maxWidth: 320 },
});

// The order kept in state: each item moves by its handle, and the new order comes back once it
// is put down. Drag a handle, or focus one and press Space, the arrows, then Space.
export default function SortableListBasic() {
  const [order, setOrder] = useState(Object.keys(steps));
  return (
    <SortableList
      aria-label="Onboarding steps, in order"
      value={order}
      onValueChange={setOrder}
      style={layout.list}
    >
      {order.map((id) => (
        <SortableListItem key={id} value={id}>
          <SortableListHandle aria-label={`Move ${steps[id] ?? id}`} />
          <Text size="sm" color="default">
            {steps[id]}
          </Text>
        </SortableListItem>
      ))}
    </SortableList>
  );
}
