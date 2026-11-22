import {
  Subagent,
  SubagentContent,
  SubagentHeader,
  SubagentTool,
  SubagentTools,
} from "@grasp-os/ui/components/subagent";
import { TraceIcon, TraceTitle } from "@grasp-os/ui/components/trace";
import { CircleCheckIcon, Icon } from "@grasp-os/ui/lib/icons";
import { size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: { width: "100%", maxWidth: `calc(${size.popupWidth} * 1.6)` },
});

// A run under way: its line runs, and it shows the tool calls so far, the last one still running.
export default function SubagentRunning() {
  return (
    <Subagent defaultOpen style={layout.column}>
      <SubagentHeader name="Running the research agent" status="running" />
      <SubagentContent>
        <SubagentTools>
          <SubagentTool>
            <TraceIcon>
              <Icon icon={CircleCheckIcon} />
            </TraceIcon>
            <TraceTitle>Ran grep -rn cacheKey scripts</TraceTitle>
          </SubagentTool>
          <SubagentTool status="running">
            <TraceIcon />
            <TraceTitle>
              Running sed -n 13,15p scripts/optimize-images.ts
            </TraceTitle>
          </SubagentTool>
        </SubagentTools>
      </SubagentContent>
    </Subagent>
  );
}
