import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@grasp-os/ui/components/collapsible";
import { Text } from "@grasp-os/ui/components/text";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 300 },
  list: { display: "grid", gap: 4, margin: 0, paddingInlineStart: 20 },
});

// The panel drawn as a list of its own (`asChild`): it opens as a panel does, and keeps the list's
// own type, with none of the panel's small quiet words.
export default function CollapsibleAsChild() {
  return (
    <Collapsible style={layout.box}>
      <CollapsibleTrigger>Who can see this</CollapsibleTrigger>
      <CollapsibleContent asChild>
        <ul aria-label="Who can see this" {...stylex.props(layout.list)}>
          <li>
            <Text>The owner</Text>
          </li>
          <li>
            <Text>Everyone in Finance</Text>
          </li>
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
