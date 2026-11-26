import { DiffViewer } from "@grasp-os/ui/components/diff-viewer";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@grasp-os/ui/components/toggle-group";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { after, before } from "./code";

const layout = stylex.create({
  column: { display: "grid", gap: space[3], width: "100%" },
  switch: { justifySelf: "end" },
});

// The page switches the view: one column, or before and after side by side.
export default function DiffViewerView() {
  const [mode, setMode] = useState<"unified" | "split">("unified");
  return (
    <div {...stylex.props(layout.column)}>
      <ToggleGroup
        aria-label="View"
        value={[mode]}
        onValueChange={(next) => {
          const [picked] = next;
          if (picked === "unified" || picked === "split") {
            setMode(picked);
          }
        }}
        style={layout.switch}
      >
        <ToggleGroupItem value="unified">Unified</ToggleGroupItem>
        <ToggleGroupItem value="split">Split</ToggleGroupItem>
      </ToggleGroup>
      <DiffViewer
        mode={mode}
        splitMinWidth={0}
        title="invoice.ts"
        language="ts"
        oldValue={before}
        newValue={after}
      />
    </div>
  );
}
