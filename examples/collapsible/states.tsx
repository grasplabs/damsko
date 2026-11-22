import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@grasp-os/ui/components/collapsible";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: 128 },
});

// One collapsible in one state, in either look. The docs draw it once per state; hover, keyboard
// focus and pressed are forced from its own CSS. Open shows a one-line panel under the trigger.
export default function CollapsibleState({
  variant = "ghost",
  open = false,
  disabled = false,
}: {
  variant?: "ghost" | "raised";
  open?: boolean;
  disabled?: boolean;
}) {
  return (
    <Collapsible
      variant={variant}
      defaultOpen={open}
      disabled={disabled}
      style={layout.box}
    >
      <CollapsibleTrigger>Details</CollapsibleTrigger>
      <CollapsibleContent>Due on Friday.</CollapsibleContent>
    </Collapsible>
  );
}
