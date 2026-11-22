"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from "@grasp-os/ui/components/item";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  stack: { display: "grid", gap: 12, width: "100%", maxWidth: 480 },
});

// Its own buttons at the end of the row, for what is done to this one thing.
export default function ItemWithActions() {
  // Turn on and Turn off answer: the row says which it is now.
  const [twoStep, setTwoStep] = useState(false);
  return (
    <div {...stylex.props(layout.stack)}>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Two-step sign-in</ItemTitle>
          <ItemDescription>
            {twoStep
              ? "On. A code from your phone each time you sign in."
              : "A code from your phone each time you sign in."}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setTwoStep(!twoStep);
            }}
          >
            {twoStep ? "Turn off" : "Turn on"}
          </Button>
        </ItemActions>
      </Item>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Weekly digest</ItemTitle>
          <ItemDescription>Every Monday at 9:00.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <>
            <Button size="sm" variant="ghost">
              Pause
            </Button>
            <Button size="sm" variant="secondary">
              Edit
            </Button>
          </>
        </ItemActions>
      </Item>
    </div>
  );
}
