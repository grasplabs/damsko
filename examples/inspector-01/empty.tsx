import { Inspector } from "@grasp-os/ui/blocks/inspector-01/inspector-01";
import { FileIcon } from "@grasp-os/ui/lib/icons";
import { size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  panel: { width: "100%", maxWidth: size.sidePanelWidth },
});

// A record with nothing to show yet: its head, and one quiet sentence where its sections will stand.
export default function InspectorEmpty() {
  return (
    <Inspector
      aria-label="Document details"
      style={layout.panel}
      icon={FileIcon}
      title="Fee schedule 2027"
      description="Sent by the head of finance this morning."
      meta={["Today, 10:24"]}
      sections={[]}
      empty="Nothing has been read from it yet. Its details appear here once it is."
    />
  );
}
