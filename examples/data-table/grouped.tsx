import { DataTable, groupingFeature } from "@grasp-os/ui/components/data-table";

import { reports } from "./reports";

// Rows gathered by owner, each group with its count; a group's heading opens and closes it.
export default function DataTableGrouped() {
  return (
    <DataTable
      aria-label="Reports by owner"
      rows={reports}
      getRowId={(report) => report.id}
      features={[groupingFeature]}
      groupBy="owner"
      unit={{ one: "report", other: "reports" }}
      columns={[
        {
          id: "name",
          header: "Report",
          value: (report) => report.name,
          sortable: true,
        },
        { id: "owner", header: "Owner", value: (report) => report.owner },
        {
          id: "pages",
          header: "Pages",
          value: (report) => report.pages,
          align: "end",
          sortable: true,
        },
      ]}
    />
  );
}
