"use client";

import { Inspector } from "@grasp-os/ui/blocks/inspector-01/inspector-01";
import { Button } from "@grasp-os/ui/components/button";
import {
  ClockIcon,
  DatabaseIcon,
  FileIcon,
  Icon,
  ListIcon,
  MailIcon,
  PlayIcon,
  SquareIcon,
  TagIcon,
  TextCursorInputIcon,
  UserSparklesIcon,
} from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";
import { size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  panel: { width: "100%", maxWidth: size.sidePanelWidth, height: 640 },
});

interface Tool {
  id: string;
  icon: IconData;
  name: string;
  detail: string;
  locked?: string;
}

const more: Tool[] = [
  { id: "mail", icon: MailIcon, name: "Send email", detail: "Write" },
  {
    id: "files",
    icon: FileIcon,
    name: "Shared documents",
    detail: "Read only",
  },
];

// An agent's settings from data: a head, then sections of rows. Add brings a tool, its bin takes it
// away again (every tool is given one; a locked tool shows none), and an empty section is one row
// that adds the first.
export default function InspectorBasic() {
  const [running, setRunning] = useState(false);
  const [tools, setTools] = useState<Tool[]>([
    {
      id: "records",
      icon: DatabaseIcon,
      name: "Team records",
      detail: "Read only",
      locked: "Cannot be removed",
    },
  ]);
  const next = more.find((tool) => !tools.some((had) => had.id === tool.id));
  return (
    <Inspector
      aria-label="Agent details"
      style={layout.panel}
      icon={UserSparklesIcon}
      title="Monday briefing"
      description="Reads last week's records and writes a one-page summary for the team."
      meta={["By Amara Okafor", running ? "Running now" : "Updated 18h ago"]}
      actions={
        <Button
          size="sm"
          onClick={() => {
            setRunning((was) => !was);
          }}
        >
          <Icon icon={running ? SquareIcon : PlayIcon} />
          {running ? "Stop" : "Run agent"}
        </Button>
      }
      sections={[
        {
          id: "triggers",
          title: "Triggers",
          description:
            "What starts the agent: a schedule, an event or a person.",
          rows: [
            {
              id: "monday",
              icon: ClockIcon,
              name: "Every Monday at 08:00",
              detail: "Schedule",
            },
            {
              id: "last-run",
              icon: PlayIcon,
              name: "Last run",
              detail: "Nov 23, 2026, 10:13 AM",
            },
            {
              id: "first-run",
              icon: PlayIcon,
              name: "First run, started by hand from the shared reports mailbox",
              detail: "Nov 16, 2026, 9:02 AM",
              onClick: () => {
                setRunning(true);
              },
            },
          ],
        },
        {
          id: "inputs",
          title: "Inputs",
          description: "What the agent asks for each time it runs.",
          rows: [
            {
              id: "team",
              icon: TextCursorInputIcon,
              name: "Team name",
              detail: "Text",
              locked: "Cannot be changed",
            },
            {
              id: "projects",
              icon: ListIcon,
              name: "Projects to include",
              detail: "List",
            },
            {
              id: "priority",
              icon: TagIcon,
              name: "Priority",
              detail: "Category",
            },
          ],
        },
        {
          id: "tools",
          title: "Tools",
          description: "What the agent may use while it works.",
          onAdd:
            next === undefined
              ? undefined
              : () => {
                  setTools((was) => [...was, next]);
                },
          rows: tools.map((tool) => ({
            ...tool,
            onRemove: () => {
              setTools((was) => was.filter((each) => each.id !== tool.id));
            },
          })),
        },
        {
          id: "context",
          title: "Context",
          description: "Files and notes the agent reads before it starts.",
          emptyText: "Add context",
        },
      ]}
    />
  );
}
