import {
  DataTable,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnVisibilityFeature,
} from "@grasp-os/ui/components/data-table";

import { reports } from "./reports";

const date = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const teams = [
  "Finance",
  "Operations",
  "People",
  "Operations",
  "People",
  "Finance",
  "Marketing",
  "Finance",
  "People",
];
const states = [
  "Ready",
  "Draft",
  "Ready",
  "In review",
  "Draft",
  "Ready",
  "In review",
  "Draft",
  "Ready",
];
const rows = reports.map((report, index) => ({
  ...report,
  team: teams[index] ?? "Finance",
  status: states[index] ?? "Draft",
  words: report.pages * 412,
}));

// Every column piece at once: the View menu, widths, moving and holding columns. The head stays in
// view as the rows scroll under it, and the first column as the rest scroll sideways.
export default function DataTableColumns() {
  return (
    <DataTable
      aria-label="Reports"
      rows={rows}
      getRowId={(report) => report.id}
      features={[
        columnVisibilityFeature,
        columnResizingFeature,
        columnOrderingFeature,
        columnPinningFeature,
      ]}
      selectable
      stickyFirstColumn
      height="20rem"
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
          id: "team",
          header: "Team",
          value: (report) => report.team,
          sortable: true,
        },
        {
          id: "status",
          header: "Status",
          value: (report) => report.status,
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
          id: "words",
          header: "Words",
          value: (report) => report.words,
          align: "end",
          sortable: true,
          hidden: true,
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
