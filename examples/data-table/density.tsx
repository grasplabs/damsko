import { DataTable } from "@grasp-os/ui/components/data-table";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

import { reports } from "./reports";

const layout = stylex.create({
  stack: { display: "grid", gap: space["8"], width: "100%" },
});

// The same rows at each density: compact 32px rows, default 42px, roomy 50px. The words stay
// the same; only the room round them changes.
export default function DataTableDensity() {
  return (
    <div {...stylex.props(layout.stack)}>
      {(["compact", "default", "comfortable"] as const).map((density) => (
        <DataTable
          key={density}
          aria-label={`Reports, ${density}`}
          rows={reports.slice(0, 3)}
          getRowId={(report) => report.id}
          density={density}
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
      ))}
    </div>
  );
}
