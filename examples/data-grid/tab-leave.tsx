import { DataGrid } from "@grasp-os/ui/components/data-grid";

import { oneCell, usePlan } from "./plan";

// A working grid for choosing what Tab does: Tab B: leaves, the grid being one stop.
export default function DataGridTabLeave() {
  return (
    <DataGrid
      aria-label="Tab B: leaves"
      {...usePlan()}
      tabNavigation="leave"
      defaultSelection={oneCell}
    />
  );
}
