import { DataTable } from "@grasp-os/ui/components/data-table";
import { InboxIcon } from "@grasp-os/ui/lib/icons";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: space["8"], width: "100%" },
});
const columns = [
  {
    id: "name",
    header: "Report",
    value: (report: { name: string }) => report.name,
  },
  {
    id: "owner",
    header: "Owner",
    value: (report: { owner: string }) => report.owner,
    // While loading, the owner waits in a person's shape: a picture and two lines.
    skeleton: "person" as const,
  },
];

// The table with nothing in it yet, still loading (the owner in a person's shape), and when the rows
// did not load.
export default function DataTableOutcomes() {
  return (
    <div {...stylex.props(layout.stack)}>
      <DataTable
        aria-label="Reports, none yet"
        rows={[] as { id: string; name: string; owner: string }[]}
        getRowId={(report) => report.id}
        columns={columns}
        unit={{ one: "report", other: "reports" }}
        emptyState={{
          title: "No reports yet",
          description: "Reports appear here once someone writes one.",
          icon: InboxIcon,
        }}
      />
      <DataTable
        aria-label="Reports, loading"
        rows={[] as { id: string; name: string; owner: string }[]}
        getRowId={(report) => report.id}
        columns={columns}
        unit={{ one: "report", other: "reports" }}
        loading
        pageSize={3}
      />
      <DataTable
        aria-label="Reports, failed"
        rows={[] as { id: string; name: string; owner: string }[]}
        getRowId={(report) => report.id}
        columns={columns}
        unit={{ one: "report", other: "reports" }}
        error={{ onRetry: () => undefined }}
      />
    </div>
  );
}
