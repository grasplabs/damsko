import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@grasp-os/ui/components/collapsible";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 300 },
});

export default function CollapsibleBasic() {
  return (
    <Collapsible style={layout.box}>
      <CollapsibleTrigger>What counts as a review</CollapsibleTrigger>
      <CollapsibleContent>
        A review is closed once its owner marks it done and every comment has an
        answer.
      </CollapsibleContent>
    </Collapsible>
  );
}
