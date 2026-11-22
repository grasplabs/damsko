import { DataTable } from "@grasp-os/ui/components/data-table";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

interface Workflow {
  id: string;
  name: string;
  phase: string;
  runs: number;
}

const workflows: Workflow[] = [
  {
    id: "w1",
    name: "Supplier invoices from the shared inbox",
    phase: "Running",
    runs: 142,
  },
  { id: "w2", name: "Month-end close checklist", phase: "Building", runs: 0 },
  {
    id: "w3",
    name: "Expense reports over the travel limit",
    phase: "Needs you",
    runs: 12,
  },
  { id: "w4", name: "Weekly numbers for the board", phase: "Running", runs: 4 },
];

const layout = stylex.create({
  stack: { display: "grid", gap: space["4"], width: "100%" },
  said: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
  },
});

// A row that opens a panel on this page (`onRowOpen`): the name is a button drawn as the cell's
// words, the whole row its press area. The open row is current (`rowCurrent`): said so, with a quiet
// fill of its own, apart from the selection.
export default function DataTableOpensPanel() {
  const [open, setOpen] = useState<string | null>("w3");
  const shown = workflows.find((workflow) => workflow.id === open);
  return (
    <div {...stylex.props(layout.stack)}>
      <DataTable
        aria-label="Workflows"
        rows={workflows}
        getRowId={(workflow) => workflow.id}
        unit={{ one: "workflow", other: "workflows" }}
        onRowClick={(workflow) => {
          setOpen(workflow.id);
        }}
        isRowActive={(workflow) => workflow.id === open}
        columns={[
          {
            id: "name",
            header: "Workflow",
            wrap: true,
            value: (workflow) => workflow.name,
          },
          {
            id: "phase",
            header: "Phase",
            value: (workflow) => workflow.phase,
          },
          {
            id: "runs",
            header: "Runs",
            align: "end",
            value: (workflow) => workflow.runs,
          },
        ]}
      />
      <p aria-live="polite" {...stylex.props(layout.said)}>
        {shown === undefined ? "No workflow open." : `Open: ${shown.name}`}
      </p>
    </div>
  );
}
