import { DataGrid } from "@grasp-os/ui/components/data-grid";

import { oneCell, usePlan } from "./plan";

// A working grid for choosing the look: Active cell A: soft halo.
export default function DataGridActiveHalo() {
  return (
    <DataGrid
      aria-label="Active cell A: soft halo"
      {...usePlan()}
      appearance={{ active: "halo" }}
      defaultSelection={oneCell}
    />
  );
}
