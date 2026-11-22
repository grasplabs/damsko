// Task: one piece of work an assistant does, behind one line that opens on the steps it took and the
// files it touched, as shadcn's Task pattern (apps/v4/content/docs/ai-elements/base/task.mdx) builds
// it: a Trace with a TraceCollapsible, the steps a Trace of TraceLines under it. Every look and
// announcement is Trace's; a file named in a step is a small chip.
// Adapted from shadcn/ui (MIT), see THIRD_PARTY_NOTICES.md.
//
//   <Task>
//     <TaskTrigger title="Found the project files" />
//     <TaskContent>
//       <TaskItem icon={SearchIcon}>Searched for page.tsx</TaskItem>
//       <TaskItem icon={FileIcon}>Read <TaskItemFile>app/page.tsx</TaskItemFile></TaskItem>
//     </TaskContent>
//   </Task>
//
// It starts open. Its title is in the present tense while it runs ("Updating the page metadata",
// `status="running"`) and in the past once done ("Updated the page metadata"); several tasks stand
// one under another, each closing once it is done. The trigger is a button with `aria-expanded`;
// Enter and Space open and close it. A step that finishes or fails after the first draw is said once
// (Trace). A caller may set layout only (the `style` prop).
"use client";

import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

import { Icon } from "../lib/icons";
import type { IconData } from "../lib/icons";
import { colors, font, media, radius, size, space } from "../lib/tokens.stylex";
import type { LayoutStyle } from "../lib/utils";
import { iconVars } from "../lib/vars.stylex";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "./trace";
import type { TraceLineStatus } from "./trace";

/** Every prop a Task takes. */
export interface TaskProps {
  /** Its TaskTrigger, then its TaskContent. */
  children: ReactNode;
  /**
   * Open on its steps at first.
   * @default true
   */
  defaultOpen?: boolean;
  /** Open now. Pass it with `onOpenChange` to open and close it yourself. */
  open?: boolean;
  /** Runs when the trigger opens or closes it. */
  onOpenChange?: (open: boolean) => void;
  /** Where it sits and how wide it is. */
  style?: LayoutStyle;
}

/** Every prop a TaskTrigger takes. */
export interface TaskTriggerProps {
  /** What the task does or did, in the tense of its status ("Updating the page metadata"). */
  title: string;
  /** Where the task stands, from its steps: `running` while one runs, `error` once one failed. Without one it is done. */
  status?: TraceLineStatus;
  /** A mark before the title, from lib/icons. */
  icon?: IconData;
  /** Its own line in place of the mark and title: a TraceLine. */
  children?: ReactNode;
}

/** Every prop a TaskContent takes. */
export interface TaskContentProps {
  /** Its TaskItems, in the order they were taken. */
  children: ReactNode;
}

/** Every prop a TaskItem takes. */
export interface TaskItemProps {
  /** What the step did, as a sentence in the tense of its status, with a TaskItemFile for a file it names. */
  children: ReactNode;
  /** Where the step stands. Without one it is done. */
  status?: TraceLineStatus;
  /** Its mark, from lib/icons. Without one, the step's status mark. */
  icon?: IconData;
}

/** Every prop a TaskItemFile takes. */
export interface TaskItemFileProps {
  /** The file's name, with an `<Icon />` before it if it helps. */
  children: ReactNode;
}

const styles = stylex.create({
  // A file in a step's words: a small chip on the line, a step smaller than the words.
  file: {
    [iconVars.size]: size.badgeIcon,
    [iconVars.stroke]: size.iconStroke,
    display: "inline-flex",
    alignItems: "center",
    gap: space["1"],
    maxWidth: "100%",
    boxSizing: "border-box",
    verticalAlign: "middle",
    paddingInline: space["2"],
    borderWidth: size.hairline,
    borderStyle: "solid",
    borderColor: { default: colors.border, [media.forcedColors]: "CanvasText" },
    borderRadius: radius.mark,
    cornerShape: radius.shape,
    backgroundColor: colors.muted,
    color: colors.foreground,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    overflowWrap: "anywhere",
  },
});

/** One piece of work, behind a line that opens on its steps. */
export const Task = ({
  children,
  defaultOpen = true,
  open,
  onOpenChange,
  style,
}: TaskProps) => (
  <Trace style={style}>
    <TraceCollapsible
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
    >
      {children}
    </TraceCollapsible>
  </Trace>
);

/** The line that opens the task: its mark and title, and the chevron. */
export const TaskTrigger = ({
  title,
  status,
  icon,
  children,
}: TaskTriggerProps) => (
  <TraceCollapsibleTrigger>
    {children ?? (
      <TraceLine status={status}>
        {icon === undefined ? null : (
          <TraceIcon>
            <Icon icon={icon} />
          </TraceIcon>
        )}
        <TraceTitle>{title}</TraceTitle>
      </TraceLine>
    )}
  </TraceCollapsibleTrigger>
);

/** What opens under the line: the task's steps. */
export const TaskContent = ({ children }: TaskContentProps) => (
  <TraceCollapsibleContent>
    <Trace>{children}</Trace>
  </TraceCollapsibleContent>
);

/** One step the task took: its mark and what it did. */
export const TaskItem = ({ children, status, icon }: TaskItemProps) => (
  <TraceLine status={status}>
    <TraceIcon>
      {icon === undefined ? undefined : <Icon icon={icon} />}
    </TraceIcon>
    <TraceTitle>{children}</TraceTitle>
  </TraceLine>
);

/** A file the task touched, named in a step's words as a small chip. */
export const TaskItemFile = ({ children }: TaskItemFileProps) => (
  <span data-slot="task-item-file" {...stylex.props(styles.file)}>
    {children}
  </span>
);
