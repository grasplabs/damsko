import { DiffViewer } from "@grasp-os/ui/components/diff-viewer";

import { after, before } from "./code";

// An agent's edit, reviewed: accept or reject each change; a rejected one stands back, undoable.
export default function DiffViewerReview() {
  return (
    <DiffViewer
      title="invoice.ts"
      language="ts"
      oldValue={before}
      newValue={after}
      review
    />
  );
}
