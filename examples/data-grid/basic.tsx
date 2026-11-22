import { DataGrid } from "@grasp-os/ui/components/data-grid";

import { usePlan } from "./plan";

// The grid as it comes: look A throughout, columns that sort and resize, every cell editable.
export default function DataGridBasic() {
  return <DataGrid aria-label="Launch plan" {...usePlan()} resizable />;
}
