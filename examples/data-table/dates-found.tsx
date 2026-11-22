import { DataTable, dateColumn } from "@grasp-os/ui/components/data-table";

import { reports } from "./reports";
import type { Report } from "./reports";

// The dates fixture: not shown on the page, used by tests/data-table.spec.ts. A date column that is
// searched and exported as its date, not as its time in milliseconds.
export default function DataTableDatesFound() {
  return (
    <DataTable
      aria-label="Reports"
      rows={reports}
      getRowId={(report) => report.id}
      searchable
      exportFileName="reports"
      unit={{ one: "report", other: "reports" }}
      columns={[
        { id: "name", header: "Report", value: (report) => report.name },
        dateColumn<Report>({
          id: "edited",
          header: "Last edited",
          date: (report) => report.edited,
        }),
      ]}
    />
  );
}
