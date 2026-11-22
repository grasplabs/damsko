// Plan: the steps an assistant decides on before it starts, and how far it has got, as shadcn's Plan
// pattern (apps/v4/content/docs/ai-elements/base/plan.mdx) builds it: a Trace with one
// TraceCollapsible, its line the plan's title and progress, running while the plan streams, the
// steps a Trace of TraceLines under it. Every look and announcement is Trace's.
// Adapted from shadcn/ui (MIT), see THIRD_PARTY_NOTICES.md.
//
//   <Plan isStreaming>
//     <PlanHeader icon={ClipboardListIcon}>
//       <PlanTitle>Plan: move the dialogs to the new primitives</PlanTitle>
//       <PlanDescription>2 of 4 done</PlanDescription>
//     </PlanHeader>
//     <PlanAction><Button size="xs" variant="secondary">Edit</Button></PlanAction>
//     <PlanContent>
//       <TraceLine><TraceIcon /><TraceTitle>Replace the imports</TraceTitle></TraceLine>
//       <TraceLine status="pending"><TraceIcon /><TraceTitle>Run the type checker</TraceTitle></TraceLine>
//     </PlanContent>
//   </Plan>
//
// The header's line is the trigger, a button with `aria-expanded`; Enter and Space open and close
// it. A button cannot sit inside it, so PlanAction stands beside it, at the end of its row. While
// the plan streams, the line runs: its title shimmers and a screen reader hears it is working. A
// step that finishes or fails after the first draw is said once (Trace). A caller may set layout only
// (the `style` prop).
"use client";

import * as stylex from "@stylexjs/stylex";
import { createContext, use } from "react";
import type { ReactNode } from "react";

import { Icon } from "../lib/icons";
import type { IconData } from "../lib/icons";
import { space } from "../lib/tokens.stylex";
import type { LayoutStyle } from "../lib/utils";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "./trace";

/** Every prop a Plan takes. */
export interface PlanProps {
  /** Its PlanHeader, PlanAction, PlanContent and PlanFooter. */
  children: ReactNode;
  /**
   * The plan is still being written or worked through: its line runs.
   * @default false
   */
  isStreaming?: boolean;
  /**
   * Open on its steps at first.
   * @default false
   */
  defaultOpen?: boolean;
  /** Open now. Pass it with `onOpenChange` to open and close it yourself. */
  open?: boolean;
  /** Runs when the header opens or closes it. */
  onOpenChange?: (open: boolean) => void;
  /** Where it sits and how wide it is. */
  style?: LayoutStyle;
}

/** Every prop a PlanHeader takes. */
export interface PlanHeaderProps {
  /** Its PlanTitle, then its PlanDescription. */
  children: ReactNode;
  /** A mark before the title, from lib/icons. */
  icon?: IconData;
}

/** Every prop a PlanTitle takes. */
export interface PlanTitleProps {
  /** The plan's goal ("Plan: add dark mode"). It shimmers while the plan streams. */
  children: string;
}

/** Every prop a PlanDescription takes. */
export interface PlanDescriptionProps {
  /** How far it has got, quiet after the title ("2 of 4 done"). */
  children: ReactNode;
}

/** Every prop a PlanAction takes. */
export interface PlanActionProps {
  /** A Button for the plan as a whole ("Edit"), at the end of the header's row. */
  children: ReactNode;
  /** Layout only: where it sits. */
  style?: LayoutStyle;
}

/** Every prop a PlanContent takes. */
export interface PlanContentProps {
  /** The steps, each a TraceLine, after a paragraph about the plan if it needs one. */
  children: ReactNode;
}

/** Every prop a PlanFooter takes. */
export interface PlanFooterProps {
  /** What stands under the plan, open or closed: a Button to start it. */
  children: ReactNode;
  /** Layout only: where it sits. */
  style?: LayoutStyle;
}

const styles = stylex.create({
  // The header's line and its action share the first row; the steps and the footer run under both.
  rows: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    alignItems: "center",
    columnGap: space["2"],
    minWidth: 0,
  },
  action: {
    display: "flex",
    gridColumn: 2,
    gridRow: 1,
    alignItems: "center",
    gap: space["1"],
  },
  across: { gridColumn: "1 / -1", minWidth: 0 },
  footer: {
    display: "flex",
    gridColumn: "1 / -1",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space["2"],
    paddingBlockStart: space["2"],
  },
});

// Whether the plan streams, for its header's line.
const StreamingContext = createContext(false);

/** A plan: a line with its title and progress that opens on its steps. */
export const Plan = ({
  children,
  isStreaming = false,
  defaultOpen,
  open,
  onOpenChange,
  style,
}: PlanProps) => (
  <Trace style={style}>
    <TraceCollapsible
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
    >
      <div data-slot="plan" {...stylex.props(styles.rows)}>
        <StreamingContext value={isStreaming}>{children}</StreamingContext>
      </div>
    </TraceCollapsible>
  </Trace>
);

/** The plan's line, which opens it: its mark, title and progress, running while the plan streams. */
export const PlanHeader = ({ children, icon }: PlanHeaderProps) => {
  const streaming = use(StreamingContext);
  return (
    <TraceCollapsibleTrigger>
      <TraceLine status={streaming ? "running" : undefined}>
        {icon === undefined ? null : (
          <TraceIcon>
            <Icon icon={icon} />
          </TraceIcon>
        )}
        {children}
      </TraceLine>
    </TraceCollapsibleTrigger>
  );
};

/** The plan's goal, in one line. */
export const PlanTitle = ({ children }: PlanTitleProps) => (
  <TraceTitle>{children}</TraceTitle>
);

/** How far the plan has got, quiet after its title. */
export const PlanDescription = ({ children }: PlanDescriptionProps) => (
  <TraceDescription>{children}</TraceDescription>
);

/** An action on the whole plan, beside its line. */
export const PlanAction = ({ children, style }: PlanActionProps) => (
  <div data-slot="plan-action" {...stylex.props(styles.action, style)}>
    {children}
  </div>
);

/** What opens under the line: the steps. */
export const PlanContent = ({ children }: PlanContentProps) => (
  <div data-slot="plan-content" {...stylex.props(styles.across)}>
    <TraceCollapsibleContent>
      <Trace>{children}</Trace>
    </TraceCollapsibleContent>
  </div>
);

/** What stands under the plan, open or closed. */
export const PlanFooter = ({ children, style }: PlanFooterProps) => (
  <div data-slot="plan-footer" {...stylex.props(styles.footer, style)}>
    {children}
  </div>
);
