import { DataGrid } from "@grasp-os/ui/components/data-grid";

import { oneCell, usePlan } from "./plan";

// A working grid for choosing the look: Active cell B: lifted.
export default function DataGridActiveLifted() {
  return (
    <DataGrid
      aria-label="Active cell B: lifted"
      {...usePlan()}
      appearance={{ active: "lifted" }}
      defaultSelection={oneCell}
    />
  );
}
