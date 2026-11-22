import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@grasp-os/ui/components/collapsible";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 300 },
});

export default function CollapsibleDisabled() {
  return (
    <Collapsible disabled style={layout.box}>
      <CollapsibleTrigger>Advanced settings</CollapsibleTrigger>
      <CollapsibleContent>Only an owner can change these.</CollapsibleContent>
    </Collapsible>
  );
}
