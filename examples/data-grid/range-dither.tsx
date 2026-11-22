import { DataGrid } from "@grasp-os/ui/components/data-grid";

import { aRange, usePlan } from "./plan";

// A working grid for choosing the look: Range C: dither and a pine edge.
export default function DataGridRangeDither() {
  return (
    <DataGrid
      aria-label="Range C: dither and a pine edge"
      {...usePlan()}
      appearance={{ range: "dither" }}
      defaultSelection={aRange}
    />
  );
}
