"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@grasp-os/ui/components/empty";
import { Icon, PlusIcon } from "@grasp-os/ui/lib/icons";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import FirstProject from "./first-project";

const layout = stylex.create({
  made: { display: "grid", gap: space[3], width: "100%", maxWidth: 560 },
  back: { justifySelf: "start" },
});

// The way on belongs to the state: one Button under the sentence, its words saying what it does.
// Press it: the first project arrives where its picture was. Start over brings the state back.
export default function EmptyAction() {
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
    <Empty size="lg">
      <EmptyHeader>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>
          Projects appear here once someone in the workspace creates one.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant="default"
          onClick={() => {
            setMade(true);
          }}
        >
          <Icon icon={PlusIcon} />
          New project
        </Button>
      </EmptyContent>
    </Empty>
  );
}
