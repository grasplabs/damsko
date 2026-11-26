import { DiffViewer } from "@grasp-os/ui/components/diff-viewer";

import { after, before } from "./code";

// Before on the left, after on the right, for a wide screen.
export default function DiffViewerSplit() {
  return (
    <DiffViewer
      mode="split"
      title="invoice.ts"
      language="ts"
      oldValue={before}
      newValue={after}
    />
  );
}
