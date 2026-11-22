import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@grasp-os/ui/components/chain-of-thought";
import { size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: { width: "100%", maxWidth: `calc(${size.popupWidth} * 1.6)` },
});

// A finished run, settled into its one line with the run's time. A press opens the steps.
export default function ChainOfThoughtBasic() {
  return (
    <ChainOfThought style={layout.column}>
      <ChainOfThoughtHeader>
        Searched 3 times, read 2 files and changed 1 file · 14s
      </ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        <ChainOfThoughtStep
          label="Searched the web"
          description="pricing pages of 4 competitors"
        />
        <ChainOfThoughtStep label="Searched the drive" description="pricing" />
        <ChainOfThoughtStep
          label="Searched the team chat"
          description="#sales, last 30 days"
        />
        <ChainOfThoughtStep label="Read pricing-2026.pdf" />
        <ChainOfThoughtStep label="Read win-loss notes.md" />
        <ChainOfThoughtStep
          label="Changed pricing-brief.md"
          description="+42 −8 lines"
        />
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
}
