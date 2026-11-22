import { DataGrid } from "@grasp-os/ui/components/data-grid";

import { oneCell, usePlan } from "./plan";

// A working grid for choosing the look: Header B: lifted.
export default function DataGridHeaderLifted() {
  return (
    <DataGrid
      aria-label="Header B: lifted"
      {...usePlan()}
      appearance={{ header: "lifted" }}
      defaultSelection={oneCell}
    />
  );
}
