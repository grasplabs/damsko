import { DiffViewer } from "@grasp-os/ui/components/diff-viewer";

import { after, before } from "./code";

// One column: each removed line over the one that replaced it, the words that changed marked.
export default function DiffViewerUnified() {
  return (
    <DiffViewer
      title="invoice.ts"
      language="ts"
      oldValue={before}
      newValue={after}
    />
  );
}
