"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Queue,
  QueueItem,
  QueueItemContent,
  QueueItemIndicator,
  QueueList,
  QueueSection,
  QueueSectionContent,
  QueueSectionLabel,
  QueueSectionTrigger,
} from "@grasp-os/ui/components/queue";
import { ListIcon } from "@grasp-os/ui/lib/icons";
import { size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  column: {
    display: "grid",
    justifyItems: "start",
    gap: space["3"],
    width: "100%",
    maxWidth: `calc(${size.popupWidth} * 1.6)`,
  },
  queue: { width: "100%" },
});

/** A to-do's line: done (no status) before the one in progress, waiting after it. */
const statusOf = (index: number, current: number) => {
  if (index < current) {
    return undefined;
  }
  return index === current ? "running" : "pending";
};

const todos = [
  "Add a dark variant to the theme tokens",
  "Read the theme from a cookie",
  "Add a toggle to the settings page",
  "Check contrast on the charts",
];

// To-dos as the assistant works through them: the one in progress runs, the ones after it wait, and
// each stays on its line once done, ticked and said once. Press Next to finish the one in progress.
export default function QueueLive() {
  const [current, setCurrent] = useState(0);
  const left = todos.length - current;
  return (
    <div {...stylex.props(layout.column)}>
      <Queue style={layout.queue}>
        <QueueSection>
          <QueueSectionTrigger>
            <QueueSectionLabel count={left} label="to do" icon={ListIcon} />
          </QueueSectionTrigger>
          <QueueSectionContent>
            <QueueList>
              {todos.map((todo, index) => (
                <QueueItem key={todo} status={statusOf(index, current)}>
                  <QueueItemIndicator completed={index < current} />
                  <QueueItemContent>{todo}</QueueItemContent>
                </QueueItem>
              ))}
            </QueueList>
          </QueueSectionContent>
        </QueueSection>
      </Queue>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setCurrent((was) => (was >= todos.length ? 0 : was + 1));
        }}
      >
        {current >= todos.length ? "Start again" : "Next"}
      </Button>
    </div>
  );
}
