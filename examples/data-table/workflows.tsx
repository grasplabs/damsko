import {
  DataTable,
  groupingFeature,
  searchParamsLocation,
  columnVisibilityFeature,
} from "@grasp-os/ui/components/data-table";
import { IconTile } from "@grasp-os/ui/components/icon-tile";
import {
  CalendarIcon,
  ChartColumnIcon,
  ClipboardListIcon,
  ClockIcon,
  CoinsIcon,
  DatabaseIcon,
  FileDocIcon,
  InboxIcon,
  ListChecksIcon,
  MailIcon,
  RocketIcon,
  UsersIcon,
  WorkflowIcon,
} from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

interface Flow {
  id: string;
  name: string;
  icon: IconData;
  phase: string;
  owner: string;
}

// The phases, in the order a workflow passes through them.
const phases = ["Needs you", "Running", "Building", "To build", "Sketched"];

const flows: Flow[] = [
  {
    id: "f1",
    name: "Approve supplier invoices",
    icon: CoinsIcon,
    phase: "Needs you",
    owner: "Amara Okafor",
  },
  {
    id: "f2",
    name: "Answer the weekly survey",
    icon: ListChecksIcon,
    phase: "Needs you",
    owner: "Jonas Weber",
  },
  {
    id: "f3",
    name: "Sort the support inbox",
    icon: InboxIcon,
    phase: "Running",
    owner: "Lena Ruiz",
  },
  {
    id: "f4",
    name: "Weekly revenue report",
    icon: ChartColumnIcon,
    phase: "Running",
    owner: "Amara Okafor",
  },
  {
    id: "f5",
    name: "Welcome new customers",
    icon: MailIcon,
    phase: "Running",
    owner: "Sam Patel",
  },
  {
    id: "f6",
    name: "Plan the team's rota",
    icon: CalendarIcon,
    phase: "Building",
    owner: "Jonas Weber",
  },
  {
    id: "f7",
    name: "Sync the CRM records",
    icon: DatabaseIcon,
    phase: "Building",
    owner: "Lena Ruiz",
  },
  {
    id: "f8",
    name: "Draft release notes",
    icon: FileDocIcon,
    phase: "Building",
    owner: "Sam Patel",
  },
  {
    id: "f9",
    name: "Chase late timesheets",
    icon: ClockIcon,
    phase: "To build",
    owner: "Amara Okafor",
  },
  {
    id: "f10",
    name: "Onboard new hires",
    icon: UsersIcon,
    phase: "To build",
    owner: "Jonas Weber",
  },
  {
    id: "f11",
    name: "Launch checklist",
    icon: RocketIcon,
    phase: "Sketched",
    owner: "Lena Ruiz",
  },
  {
    id: "f12",
    name: "Hand over open tasks",
    icon: ClipboardListIcon,
    phase: "Sketched",
    owner: "Sam Patel",
  },
  {
    id: "f13",
    name: "Route approvals",
    icon: WorkflowIcon,
    phase: "Sketched",
    owner: "Amara Okafor",
  },
];

const ordered = [...flows].sort(
  (a, b) => phases.indexOf(a.phase) - phases.indexOf(b.phase)
);

const layout = stylex.create({
  name: {
    display: "inline-flex",
    alignItems: "center",
    gap: space["2"],
    minWidth: 0,
  },
});

// Workflows gathered by phase. Each phase is a heading with its count; the one that needs you takes
// the attention tone (`groupTone`), said in words too. The rows stand on the columns' own lines, and
// a closed phase is kept in the link. The rows scroll inside the table, and each phase's heading
// stays under the head while its rows pass.
export default function DataTableWorkflows() {
  // A closed phase stays closed on reload: it is part of the view in the link.
  const [location] = useState(() => searchParamsLocation("flows"));
  return (
    <DataTable
      aria-label="Workflows"
      // Tall enough for two phases: its rows scroll inside, and a phase's heading stays under the head.
      height="28rem"
      rows={ordered}
      getRowId={(flow) => flow.id}
      features={[groupingFeature, columnVisibilityFeature]}
      location={location}
      groupBy="phase"
      getGroupVariant={(phase) =>
        phase === "Needs you" ? "warning" : undefined
      }
      unit={{ one: "workflow", other: "workflows" }}
      columns={[
        {
          id: "name",
          header: "Workflow",
          value: (flow) => flow.name,
          cell: (flow) => (
            <span {...stylex.props(layout.name)}>
              <IconTile icon={flow.icon} />
              {flow.name}
            </span>
          ),
        },
        // The phase gathers the rows: its column stays out of view, its words in each heading.
        {
          id: "phase",
          header: "Phase",
          value: (flow) => flow.phase,
          hidden: true,
        },
        { id: "owner", header: "Owner", value: (flow) => flow.owner },
      ]}
    />
  );
}
