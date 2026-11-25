import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@grasp-os/ui/components/collapsible";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: {
    display: "grid",
    gap: 8,
    // On a touch screen each control's target reaches the middle of the gap to the next.
    "--tap-room-block": "4px",
    width: "100%",
    maxWidth: 300,
  },
});

// Each opens on its own; for a set where one opening closes the others, use an accordion.
export default function CollapsibleSeveral() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Collapsible variant="outline" defaultOpen>
        <CollapsibleTrigger>Section 1</CollapsibleTrigger>
        <CollapsibleContent>
          The brief, the owner and the date it is due.
        </CollapsibleContent>
      </Collapsible>
      <Collapsible variant="outline">
        <CollapsibleTrigger>Section 2</CollapsibleTrigger>
        <CollapsibleContent>
          Who reviews it, and in what order.
        </CollapsibleContent>
      </Collapsible>
      <Collapsible variant="outline">
        <CollapsibleTrigger>Section 3</CollapsibleTrigger>
        <CollapsibleContent>
          What happens once every reviewer agrees.
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
