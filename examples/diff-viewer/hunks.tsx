import { DiffViewer } from "@grasp-os/ui/components/diff-viewer";

import { after, before } from "./code";

// Code read by people who know patches: a hunk's head before each run, long lines kept whole.
export default function DiffViewerHunks() {
  return (
    <DiffViewer
      title="invoice.ts"
      language="ts"
      oldValue={before}
      newValue={after}
      showHunkHeaders
      wrap={false}
    />
  );
}
