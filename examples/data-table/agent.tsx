import { DataTable } from "@grasp-os/ui/components/data-table";

import { pageAgent } from "../../site/behaviour/agent";
import { reports } from "./reports";

// The agent fixture: not shown on the page, used by tests/data-table.spec.ts. A Data table on
// the page's agent bridge, so the spec can prove an agent finds it by its label, reads its
// columns and rows, sorts, searches, filters, chooses and pages, and is refused what it cannot do.
pageAgent();

export default function DataTableAgent() {
  return (
    <DataTable
      aria-label="Reports"
      rows={reports}
      getRowId={(report) => report.id}
      searchable
      selectable
      filterable
      pageSize={5}
      unit={{ one: "report", other: "reports" }}
      columns={[
        {
          id: "name",
          header: "Report",
          value: (report) => report.name,
          sortable: true,
        },
        {
          id: "owner",
          header: "Owner",
          value: (report) => report.owner,
          sortable: true,
        },
        {
          id: "pages",
          header: "Pages",
          value: (report) => report.pages,
          align: "end",
          sortable: true,
          filter: "number",
        },
      ]}
    />
  );
}
