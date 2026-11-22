import { Badge } from "@grasp-os/ui/components/badge";
import type { BadgeVariant } from "@grasp-os/ui/components/badge";
import { DataTable } from "@grasp-os/ui/components/data-table";

const statuses: { status: string; variant: BadgeVariant }[] = [
  { status: "Ready", variant: "success" },
  { status: "Needs review", variant: "warning" },
  { status: "Draft", variant: "default" },
];
const names = [
  "Quarterly summary",
  "Supplier list",
  "Team survey",
  "Office move plan",
  "Hiring plan",
  "Travel policy",
  "Annual budget",
  "Security review",
  "Customer interviews",
  "Training schedule",
  "Product roadmap",
  "Expense claims",
];
const owners = ["Amara Okafor", "Jonas Weber", "Lena Ruiz", "Sam Patel"];

// Twelve reports, one for each name, made up the same way every time, so the server and the
// browser agree.
const reports = names.map((name, index) => ({
  id: `report-${index + 1}`,
  name,
  owner: owners[index % owners.length] ?? "",
  ...(statuses[index % statuses.length] ?? {
    status: "Draft",
    variant: "default" as const,
  }),
}));

// Status as a badge at the end of its row, and the page count under the table: a Data table pages.
export default function TablesStatus() {
  return (
    <DataTable
      aria-label="Reports"
      caption="Reports in the workspace."
      rows={reports}
      getRowId={(report) => report.id}
      pageSize={4}
      unit={{ one: "report", other: "reports" }}
      columns={[
        { id: "name", header: "Report", value: (report) => report.name },
        { id: "owner", header: "Owner", value: (report) => report.owner },
        {
          id: "status",
          header: "Status",
          value: (report) => report.status,
          cell: (report) => (
            <Badge variant={report.variant}>{report.status}</Badge>
          ),
          align: "end",
        },
      ]}
    />
  );
}
