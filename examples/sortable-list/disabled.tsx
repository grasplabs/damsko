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
  stack: { display: "grid", gap: 24, width: "100%", maxWidth: 320 },
});

const tracks = ["Intro", "Morning", "Noon", "Evening"];

// One item held in place (the intro always plays first): it cannot be picked up, and the others
// still move past it. Below, a whole list out of use, with why.
export default function SortableListDisabled() {
  const [order, setOrder] = useState(tracks);
  return (
    <div {...stylex.props(layout.stack)}>
      <SortableList
        aria-label="Playlist"
        value={order}
        onValueChange={setOrder}
      >
        {order.map((track) => (
          <SortableListItem
            key={track}
            value={track}
            disabled={track === "Intro"}
          >
            <SortableListHandle aria-label={`Move ${track}`} />
            <Text size="sm" color="default">
              {track}
            </Text>
          </SortableListItem>
        ))}
      </SortableList>
      <div>
        <SortableList
          aria-label="Published playlist"
          value={tracks}
          onValueChange={() => null}
          disabled
        >
          {tracks.map((track) => (
            <SortableListItem key={track} value={track}>
              <SortableListHandle aria-label={`Move ${track}`} />
              <Text size="sm" color="default">
                {track}
              </Text>
            </SortableListItem>
          ))}
        </SortableList>
        <Text size="sm" color="muted">
          Published: unpublish it to change the order.
        </Text>
      </div>
    </div>
  );
}
