import { DataTable } from "@grasp-os/ui/components/data-table";

import { reports } from "./reports";

const date = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

// Sorts by a column's name, searches every column, and pages through five rows at a time.
export default function DataTableBasic() {
  return (
    <DataTable
      aria-label="Reports"
      rows={reports}
      getRowId={(report) => report.id}
      defaultSort={{ key: "edited", order: "descending" }}
      searchable
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
          id: "edited",
          header: "Last edited",
          value: (report) => report.edited,
          cell: (report) => date.format(new Date(report.edited)),
          sortable: true,
        },
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
