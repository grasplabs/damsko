import { DataGrid } from "@grasp-os/ui/components/data-grid";

import { aRange, usePlan } from "./plan";

// A working grid for choosing the look: Range B: wash and a mint edge.
export default function DataGridRangeOutline() {
  return (
    <DataGrid
      aria-label="Range B: wash and a mint edge"
      {...usePlan()}
      appearance={{ range: "outline" }}
      defaultSelection={aRange}
    />
  );
}
