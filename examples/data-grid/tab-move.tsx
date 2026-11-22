import { DataGrid } from "@grasp-os/ui/components/data-grid";

import { oneCell, usePlan } from "./plan";

// A working grid for choosing what Tab does: Tab A: moves on, as a spreadsheet's does.
export default function DataGridTabMove() {
  return (
    <DataGrid
      aria-label="Tab A: moves on"
      {...usePlan()}
      tabNavigation="move"
      defaultSelection={oneCell}
    />
  );
}
