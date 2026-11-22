"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Task,
  TaskContent,
  TaskItem,
  TaskTrigger,
} from "@grasp-os/ui/components/task";
import { CircleCheckIcon } from "@grasp-os/ui/lib/icons";
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
  tasks: { width: "100%" },
});

interface Plan {
  title: [string, string];
  steps: [string, string][];
  /** How many steps of the tasks before it there are. */
  first: number;
}

const tasks: Plan[] = [
  {
    title: ["Finding the project files", "Found the project files"],
    steps: [
      ["Searching for generateMetadata", "Searched for generateMetadata"],
      ["Reading app/layout.tsx", "Read app/layout.tsx"],
      ["Reading app/page.tsx", "Read app/page.tsx"],
    ],
    first: 0,
  },
  {
    title: ["Updating the page metadata", "Updated the page metadata"],
    steps: [
      ["Editing app/layout.tsx", "Edited app/layout.tsx"],
      ["Editing app/page.tsx", "Edited app/page.tsx"],
    ],
    first: 3,
  },
];

const total = 5;

// One task, `finished` of its steps done: open while it runs, unless the person folds it.
const TaskRow = ({ task, finished }: { task: Plan; finished: number }) => {
  const [open, setOpen] = useState<boolean>();
  const running = finished < task.steps.length;
  return (
    <Task open={open ?? running} onOpenChange={setOpen}>
      <TaskTrigger
        title={running ? task.title[0] : task.title[1]}
        status={running ? "running" : undefined}
        icon={running ? undefined : CircleCheckIcon}
      />
      <TaskContent>
        {task.steps.slice(0, finished + 1).map(([present, past], index) => (
          <TaskItem
            key={past}
            status={index < finished ? undefined : "running"}
          >
            {index < finished ? past : present}
          </TaskItem>
        ))}
      </TaskContent>
    </Task>
  );
};

// Tasks as they run: each step arrives running and finishes; a task's title turns to the past tense
// once its last step is done, and it closes. Press Next to finish the running step.
export default function TaskLive() {
  const [done, setDone] = useState(0);
  return (
    <div {...stylex.props(layout.column)}>
      <div {...stylex.props(layout.tasks)}>
        {tasks
          .filter((task) => done >= task.first)
          .map((task) => (
            <TaskRow
              key={task.title[1]}
              task={task}
              finished={done - task.first}
            />
          ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setDone((was) => (was >= total ? 0 : was + 1));
        }}
      >
        {done >= total ? "Start again" : "Next"}
      </Button>
    </div>
  );
}
