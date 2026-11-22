import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@grasp-os/ui/components/chain-of-thought";
import { SearchIcon } from "@grasp-os/ui/lib/icons";
import { size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: { width: "100%", maxWidth: `calc(${size.popupWidth} * 1.6)` },
});

// Every status a step has, open: complete, failed, active, pending; and a step with a mark of its
// own in place of the dot.
export default function ChainOfThoughtStates() {
  return (
    <ChainOfThought defaultOpen style={layout.column}>
      <ChainOfThoughtHeader>Every status</ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        <ChainOfThoughtStep label="Read brief.md" status="complete" />
        <ChainOfThoughtStep
          label="Searched the drive"
          description="12 results"
          status="complete"
          icon={SearchIcon}
        />
        <ChainOfThoughtStep
          label="Read pricing.xlsx"
          description="the file was locked"
          status="error"
        />
        <ChainOfThoughtStep label="Writing the summary" status="active" />
        <ChainOfThoughtStep label="Check the numbers" status="pending" />
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
}
