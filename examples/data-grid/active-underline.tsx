import { DataGrid } from "@grasp-os/ui/components/data-grid";

import { oneCell, usePlan } from "./plan";

// A working grid for choosing the look: Active cell C: underline.
export default function DataGridActiveUnderline() {
  return (
    <DataGrid
      aria-label="Active cell C: underline"
      {...usePlan()}
      appearance={{ active: "underline" }}
      defaultSelection={oneCell}
    />
  );
}
