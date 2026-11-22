import { Snippet } from "@grasp-os/ui/components/snippet";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 260 },
});

export default function SnippetLong() {
  return (
    <Snippet
      style={layout.box}
      value="workspace_8f3a2c91-d4e7-4b6a-905f-1c2d3e4b5a69"
      aria-label="Copy the workspace ID"
    />
  );
}
