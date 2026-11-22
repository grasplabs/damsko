import { DataGrid } from "@grasp-os/ui/components/data-grid";

import { usePlan } from "./plan";

// Without onCellsChange the grid is read-only: its cells are chosen and copied, never changed.
export default function DataGridReadOnly() {
  const { rows, columns, getRowId } = usePlan();
  return (
    <DataGrid
      aria-label="Plan, read only"
      rows={rows}
      columns={columns}
      getRowId={getRowId}
    />
  );
}
