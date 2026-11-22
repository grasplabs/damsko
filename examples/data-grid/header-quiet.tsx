import { DataGrid } from "@grasp-os/ui/components/data-grid";

import { oneCell, usePlan } from "./plan";

// A working grid for choosing the look: Header A: quiet.
export default function DataGridHeaderQuiet() {
  return (
    <DataGrid
      aria-label="Header A: quiet"
      {...usePlan()}
      appearance={{ header: "quiet" }}
      defaultSelection={oneCell}
    />
  );
}
