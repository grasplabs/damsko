import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@grasp-os/ui/components/trace";
import { size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: { width: "100%", maxWidth: `calc(${size.popupWidth} * 1.6)` },
  // The steps a step closer to the line than the panel's own spacing.
  steps: { marginBlock: `calc(${space["1"]} - ${space["2"]})` },
});

const steps = [
  { title: "Searched the web", description: "pricing pages of 4 competitors" },
  { title: "Searched the drive", description: "pricing" },
  { title: "Searched the team chat", description: "#sales, last 30 days" },
  { title: "Read pricing-2026.pdf" },
  { title: "Read win-loss notes.md" },
  { title: "Changed pricing-brief.md", description: "+42 −8 lines" },
];

// A finished run behind its one line: a press opens the steps, each a mark on the dotted line, its
// title and a quiet note.
export default function TraceChainOfThought() {
  return (
    <Trace style={layout.column}>
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceTitle>
              Searched 3 times, read 2 files and changed 1 file · 14s
            </TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <Trace style={layout.steps}>
            {steps.map((step) => (
              <TraceLine key={step.title}>
                <TraceIcon />
                <TraceTitle>{step.title}</TraceTitle>
                {step.description === undefined ? null : (
                  <TraceDescription>{step.description}</TraceDescription>
                )}
              </TraceLine>
            ))}
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
}
