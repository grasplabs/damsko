import { DiffViewerFiles } from "@grasp-os/ui/components/diff-viewer";

import { files } from "./files";

// What a change makes across files: a route edited, a server file added, an old file deleted.
export default function DiffViewerFilesBasic() {
  return <DiffViewerFiles files={files} />;
}
