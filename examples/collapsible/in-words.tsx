import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@grasp-os/ui/components/collapsible";
import { Text } from "@grasp-os/ui/components/text";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: space["4"],
    width: "100%",
    textAlign: "center",
  },
  fit: { width: "fit-content" },
});

// A line of the page's own words that opens: the trigger at the size and weight of the paragraph
// above it, in a box only as wide as its words, in the middle of a centred column.
export default function CollapsibleInWords() {
  return (
    <div {...stylex.props(layout.column)}>
      <Text size="lg">Everyone on the team is asked the same questions.</Text>
      <Collapsible fitContent style={layout.fit}>
        <CollapsibleTrigger size="lg" weight="normal">
          How your answers are handled
        </CollapsibleTrigger>
        <CollapsibleContent>
          Only the written notes are kept, and you read them before they are
          shared.
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
