import { DataGrid } from "@grasp-os/ui/components/data-grid";

import { oneCell, usePlan } from "./plan";

// A working grid for choosing the look: Header C: kind chips.
export default function DataGridHeaderChip() {
  return (
    <DataGrid
      aria-label="Header C: kind chips"
      {...usePlan()}
      appearance={{ header: "chip" }}
      defaultSelection={oneCell}
    />
  );
}
