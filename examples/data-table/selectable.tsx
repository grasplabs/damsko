import { DataTable } from "@grasp-os/ui/components/data-table";

import { reports } from "./reports";

// A checkbox on every row, and one in the head for every row shown; the count says how many.
export default function DataTableSelectable() {
  return (
    <DataTable
      aria-label="Reports"
      rows={reports.slice(0, 5)}
      getRowId={(report) => report.id}
      selectable
      defaultSelection={["r2"]}
      unit={{ one: "report", other: "reports" }}
      columns={[
        { id: "name", header: "Report", value: (report) => report.name },
        { id: "owner", header: "Owner", value: (report) => report.owner },
        {
          id: "pages",
          header: "Pages",
          value: (report) => report.pages,
          align: "end",
        },
      ]}
    />
  );
}
