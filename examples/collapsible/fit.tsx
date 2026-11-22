import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@grasp-os/ui/components/collapsible";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 300 },
});

// Only as wide as its words: one quiet line that opens, among other words.
export default function CollapsibleFit() {
  return (
    <div {...stylex.props(layout.box)}>
      <Collapsible fitContent>
        <CollapsibleTrigger>Thought for 12 seconds</CollapsibleTrigger>
        <CollapsibleContent>
          The question is about terms, not prices alone, so payment days and
          notice periods count too.
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
