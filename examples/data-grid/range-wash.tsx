import { DataGrid } from "@grasp-os/ui/components/data-grid";

import { aRange, usePlan } from "./plan";

// A working grid for choosing the look: Range A: wash and a pine edge.
export default function DataGridRangeWash() {
  return (
    <DataGrid
      aria-label="Range A: wash and a pine edge"
      {...usePlan()}
      appearance={{ range: "wash" }}
      defaultSelection={aRange}
    />
  );
}
