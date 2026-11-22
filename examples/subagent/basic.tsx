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

const styles = stylex.create({
  column: { width: "100%", maxWidth: `calc(${size.popupWidth} * 1.6)` },
  found: { margin: 0 },
});

// A finished run, open on the tool calls the subagent made and what it found.
export default function SubagentBasic() {
  return (
    <Subagent defaultOpen style={styles.column}>
      <SubagentHeader name="Ran the research agent" icon={CircleCheckIcon} />
      <SubagentContent>
        <SubagentTools>
          <SubagentTool>
            <TraceIcon>
              <Icon icon={CircleCheckIcon} />
            </TraceIcon>
            <TraceTitle>Ran grep -rn cacheKey scripts</TraceTitle>
          </SubagentTool>
          <SubagentTool>
            <TraceIcon>
              <Icon icon={CircleCheckIcon} />
            </TraceIcon>
            <TraceTitle>
              Ran sed -n 13,15p scripts/optimize-images.ts
            </TraceTitle>
          </SubagentTool>
        </SubagentTools>
        <p {...stylex.props(styles.found)}>
          The cache is keyed on the commit SHA.
        </p>
      </SubagentContent>
    </Subagent>
  );
}
