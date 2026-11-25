"use client";

import {
  SortableList,
  SortableListHandle,
  SortableListItem,
} from "@grasp-os/ui/components/sortable-list";
import { Text } from "@grasp-os/ui/components/text";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  list: { width: "100%", maxWidth: 320 },
});

const steps = ["ترحيب", "المراجعة", "النشر"];

// Right to left: the handle stands at the line's start, on the right; Up and Down move an item as
// they do in any language.
export default function SortableListRtl() {
  const [order, setOrder] = useState(steps);
  return (
    <div dir="rtl" lang="ar">
      <SortableList
        aria-label="الخطوات"
        value={order}
        onValueChange={setOrder}
        style={layout.list}
      >
        {order.map((step) => (
          <SortableListItem key={step} value={step}>
            <SortableListHandle aria-label={`نقل ${step}`} />
            <Text size="sm" color="default">
              {step}
            </Text>
          </SortableListItem>
        ))}
      </SortableList>
    </div>
  );
}
