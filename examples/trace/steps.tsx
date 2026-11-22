import {
  Trace,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@grasp-os/ui/components/trace";
import { FileDocIcon, Icon, SearchIcon } from "@grasp-os/ui/lib/icons";
import { size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: { width: "100%", maxWidth: `calc(${size.popupWidth} * 1.6)` },
});

// Steps in every status: done ones quiet, the running one shimmering, a failed one in red with the
// alert, the next one waiting on a faint dot. Each says its status in words to a screen reader.
export default function TraceSteps() {
  return (
    <Trace style={layout.column}>
      <TraceLine>
        <TraceIcon>
          <Icon icon={SearchIcon} />
        </TraceIcon>
        <TraceTitle>Searched the web</TraceTitle>
        <TraceDescription>12 results</TraceDescription>
      </TraceLine>
      <TraceLine>
        <TraceIcon>
          <Icon icon={FileDocIcon} />
        </TraceIcon>
        <TraceTitle>Read pricing-2026.pdf</TraceTitle>
      </TraceLine>
      <TraceLine status="error">
        <TraceIcon />
        <TraceTitle>Failed to open win-loss notes.md</TraceTitle>
      </TraceLine>
      <TraceLine status="running">
        <TraceIcon />
        <TraceTitle>Writing pricing-brief.md</TraceTitle>
      </TraceLine>
      <TraceLine status="pending">
        <TraceIcon />
        <TraceTitle>Share the brief with the team</TraceTitle>
      </TraceLine>
    </Trace>
  );
}
