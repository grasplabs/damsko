// Subagent: work an assistant handed to another agent, shown as that run:
// a Trace with one
// TraceCollapsible, its line the run ("Ran the research agent"), under it the task it was given, the
// tool calls it made as a nested Trace, its output and what it found. Every look and announcement is
// Trace's; the model is a Badge, the output's shape a CodeBlock. It knows nothing of any agent: it
// shows what it is given.
// Adapted from shadcn/ui (MIT), see THIRD_PARTY_NOTICES.md.
//
//   <Subagent defaultOpen>
//     <SubagentHeader name="Ran the research agent" model="model-name" />
//     <SubagentContent>
//       <SubagentInstructions>Find out why the build is slow.</SubagentInstructions>
//       <SubagentTools>
//         <SubagentTool><TraceIcon /><TraceTitle>Ran grep -rn cacheKey scripts</TraceTitle></SubagentTool>
//       </SubagentTools>
//       <p>The cache is keyed on the commit.</p>
//     </SubagentContent>
//   </Subagent>
//
// The run's title is in the tense of its status: Running … while it runs (`status="running"`),
// Ran … once done, Failed to run … when it failed. The line is a button with `aria-expanded`; Enter
// and Space open and close it. A tool call or the run that finishes or fails after the first draw is
// said once (Trace). A caller may set layout only (the `style` prop).
"use client";

import * as stylex from "@stylexjs/stylex";
import { useId } from "react";
import type { ReactNode } from "react";

import { useI18n } from "../lib/i18n";
import { Icon } from "../lib/icons";
import type { IconData } from "../lib/icons";
import { colors, font, space } from "../lib/tokens.stylex";
import type { LayoutStyle } from "../lib/utils";
import { Badge } from "./badge";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "./code-block";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "./trace";
import type { TraceLineProps, TraceLineStatus } from "./trace";

/** Every prop a Subagent takes. */
export interface SubagentProps {
  /** Its SubagentHeader, then its SubagentContent. */
  children: ReactNode;
  /**
   * Open on the run at first.
   * @default false
   */
  defaultOpen?: boolean;
  /** Open now. Pass it with `onOpenChange` to open and close it yourself. */
  open?: boolean;
  /** Runs when the line opens or closes it. */
  onOpenChange?: (open: boolean) => void;
  /** Where it sits and how wide it is. */
  style?: LayoutStyle;
}

/** Every prop a SubagentHeader takes. */
export interface SubagentHeaderProps {
  /** The run, in the tense of its status ("Running the research agent", "Ran the research agent"). */
  name: string;
  /** The model the subagent ran on, as a Badge after the name. */
  model?: string;
  /** Where the run stands. Without one it is done. */
  status?: TraceLineStatus;
  /** Its mark, from lib/icons. Without one, the run's status mark. */
  icon?: IconData;
  /** Anything else in the line after the name: a TraceDescription with how long it ran. */
  children?: ReactNode;
}

/** Every prop a SubagentContent takes. */
export interface SubagentContentProps {
  /** Its SubagentInstructions, SubagentTools, SubagentOutput and what the subagent found, a step apart. */
  children: ReactNode;
}

/** Every prop a SubagentInstructions takes. */
export interface SubagentInstructionsProps {
  /** The task the subagent was given, in words. */
  children: string;
}

/** Every prop a SubagentTools takes. */
export interface SubagentToolsProps {
  /** Its SubagentTools, one for each tool call, in the order they were made. */
  children: ReactNode;
  /** Where it sits. */
  style?: LayoutStyle;
}

/** Every prop a SubagentTool takes: a TraceLine's. */
export type SubagentToolProps = TraceLineProps;

/** Every prop a SubagentOutput takes. */
export interface SubagentOutputProps {
  /** The shape of what the subagent returns, as TypeScript. */
  schema: string;
}

const styles = stylex.create({
  content: {
    display: "grid",
    rowGap: space["3"],
    minWidth: 0,
    paddingBlockEnd: space["2"],
  },
  instructions: {
    display: "grid",
    rowGap: space["1"],
    minWidth: 0,
  },
  label: {
    margin: 0,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    fontWeight: font.weightMedium,
    color: colors.mutedForeground,
  },
  text: {
    margin: 0,
    color: colors.foreground,
    overflowWrap: "anywhere",
  },
});

/** A subagent's run: a line that opens on what it was asked, what it did and what it found. */
export const Subagent = ({
  children,
  defaultOpen,
  open,
  onOpenChange,
  style,
}: SubagentProps) => (
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

/** The run's line, which opens it: its mark, the run, the model. */
export const SubagentHeader = ({
  name,
  model,
  status,
  icon,
  children,
}: SubagentHeaderProps) => (
  <TraceCollapsibleTrigger>
    <TraceLine status={status}>
      <TraceIcon>
        {icon === undefined ? undefined : <Icon icon={icon} />}
      </TraceIcon>
      <TraceTitle>{name}</TraceTitle>
      {model === undefined || model === "" ? null : (
        <Badge size="sm">{model}</Badge>
      )}
      {children}
    </TraceLine>
  </TraceCollapsibleTrigger>
);

/** What opens under the line, a step apart. */
export const SubagentContent = ({ children }: SubagentContentProps) => (
  <TraceCollapsibleContent>
    <div {...stylex.props(styles.content)}>{children}</div>
  </TraceCollapsibleContent>
);

/** The task the subagent was given, under its label. */
export const SubagentInstructions = ({
  children,
}: SubagentInstructionsProps) => {
  const words = useI18n().subagent;
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      data-slot="subagent-instructions"
      {...stylex.props(styles.instructions)}
    >
      <p id={id} {...stylex.props(styles.label)}>
        {words.instructions}
      </p>
      <p {...stylex.props(styles.text)}>{children}</p>
    </section>
  );
};

/** The tool calls the subagent made. */
export const SubagentTools = ({ children, style }: SubagentToolsProps) => (
  <Trace style={style}>{children}</Trace>
);

/** One tool call the subagent made: a line, in the tense of its status. */
export const SubagentTool = (props: SubagentToolProps) => (
  <TraceLine {...props} />
);

/** The shape of what the subagent returns, as code named Output schema. */
export const SubagentOutput = ({ schema }: SubagentOutputProps) => {
  const words = useI18n().subagent;
  return (
    <div data-slot="subagent-output">
      <CodeBlock language="typescript">
        <CodeBlockHeader>
          <CodeBlockTitle>{words.output}</CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockCopyButton value={schema} />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent wrap maxLines={12}>
          {schema}
        </CodeBlockContent>
      </CodeBlock>
    </div>
  );
};
