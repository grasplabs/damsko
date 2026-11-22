import { DataTable } from "@grasp-os/ui/components/data-table";
import { IconTile } from "@grasp-os/ui/components/icon-tile";
import {
  ChartColumnIcon,
  FileIcon,
  WandSparklesIcon,
} from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

interface Workflow {
  id: string;
  name: string;
  icon: IconData;
  phase: string;
  runs: number;
}

const workflows: Workflow[] = [
  {
    id: "w1",
    name: "Weekly spend report",
    icon: ChartColumnIcon,
    phase: "Running",
    runs: 42,
  },
  {
    id: "w2",
    name: "Supplier onboarding",
    icon: WandSparklesIcon,
    phase: "Building",
    runs: 7,
  },
  {
    id: "w3",
    name: "Invoice matching",
    icon: FileIcon,
    phase: "Needs you",
    runs: 19,
  },
];

const layout = stylex.create({
  stack: { display: "grid", gap: space[8], width: "100%" },
  name: {
    display: "inline-flex",
    alignItems: "center",
    gap: space[2],
    minWidth: 0,
    maxWidth: "100%",
  },
  // The row keeps one line of words beside its tile: a long name ends in an ellipsis.
  words: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
});

// An object's tile in a table's row: `size="sm"`, in a column that holds a control (`control`), so
// a compact row stays 32px and a default one 42px, as a row of words alone. That box is one line
// tall, so the name keeps to one line beside its tile and ends in an ellipsis where it is narrow.
export default function IconTileRow() {
  return (
    <div {...stylex.props(layout.stack)}>
      {(["compact", "default"] as const).map((density) => (
        <DataTable
          key={density}
          aria-label={`Workflows, ${density}`}
          rows={workflows}
          getRowId={(workflow) => workflow.id}
          density={density}
          unit={{ one: "workflow", other: "workflows" }}
          columns={[
            {
              id: "name",
              header: "Workflow",
              value: (workflow) => workflow.name,
              control: true,
              cell: (workflow) => (
                <span {...stylex.props(layout.name)}>
                  <IconTile icon={workflow.icon} size="sm" />
                  <span {...stylex.props(layout.words)}>{workflow.name}</span>
                </span>
              ),
            },
            {
              id: "phase",
              header: "Phase",
              value: (workflow) => workflow.phase,
            },
            {
              id: "runs",
              header: "Runs",
              value: (workflow) => workflow.runs,
              align: "end",
            },
          ]}
        />
      ))}
    </div>
  );
}
