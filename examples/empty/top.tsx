"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@grasp-os/ui/components/empty";
import { Icon, PlusIcon } from "@grasp-os/ui/lib/icons";
import { colors, radius, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { Place } from "./clearing";
import FirstProject from "./first-project";

const layout = stylex.create({
  place: {
    width: "100%",
    maxWidth: 520,
    height: 344,
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: size.borderStrong,
    overflow: "hidden",
  },
  made: { display: "grid", gap: space[3], width: "100%", maxWidth: 520 },
  back: { justifySelf: "start" },
});

// A list fills from the top: the words stand where its first row will land, from the start edge,
// and the rows to come are drawn under them. Press New report: the first one lands where the
// words stood. Start over brings the state back.
export default function EmptyTop() {
  const [made, setMade] = useState(false);
  if (made) {
    return (
      <div {...stylex.props(layout.made)}>
        <FirstProject />
        <Button
          size="sm"
          variant="ghost"
          style={layout.back}
          onClick={() => {
            setMade(false);
          }}
        >
          Start over
        </Button>
      </div>
    );
  }
  return (
    <div {...stylex.props(layout.place)}>
      <Place shape="rows" align="start">
        <EmptyHeader>
          <EmptyTitle>No reports yet</EmptyTitle>
          <EmptyDescription>
            Reports appear here once a review is closed.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setMade(true);
            }}
          >
            <Icon icon={PlusIcon} />
            New report
          </Button>
        </EmptyContent>
      </Place>
    </div>
  );
}
