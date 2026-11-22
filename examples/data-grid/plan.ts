import { applyDataGridPatch } from "@grasp-os/ui/components/data-grid";
import type {
  DataGridColumn,
  DataGridPatch,
} from "@grasp-os/ui/components/data-grid";
// Made-up work for the Data grid's examples: a launch plan, and the state that holds its rows. The
// grid stores nothing: each example applies the grid's patches to these rows.
import { useState } from "react";

export interface Task {
  id: string;
  task: string;
  stage: string;
  owner: string;
  budget: number | null;
  due: string;
  done: boolean;
}

const stages = ["Planning", "In progress", "Review", "Done"];

export const columns: DataGridColumn<Task>[] = [
  {
    key: "task",
    header: "Task",
    type: "text",
    value: (task) => task.task,
    sortable: true,
    flex: 1.6,
  },
  {
    key: "stage",
    header: "Stage",
    type: "select",
    value: (task) => task.stage,
    options: stages,
    sortable: true,
  },
  {
    key: "owner",
    header: "Owner",
    type: "person",
    value: (task) => task.owner,
    sortable: true,
  },
  {
    key: "budget",
    header: "Budget",
    type: "currency",
    value: (task) => task.budget,
    sortable: true,
    flex: 0.9,
  },
  {
    key: "due",
    header: "Due",
    type: "date",
    value: (task) => task.due,
    flex: 0.8,
  },
  {
    key: "done",
    header: "Done",
    type: "boolean",
    value: (task) => task.done,
    flex: 0.6,
  },
];

const tasks: Task[] = [
  {
    id: "t1",
    task: "Plan the spring launch",
    stage: "Planning",
    owner: "Amara Okafor",
    budget: 12_400,
    due: "3 Mar",
    done: true,
  },
  {
    id: "t2",
    task: "Brief the suppliers",
    stage: "In progress",
    owner: "Tomás Varga",
    budget: 3250,
    due: "7 Mar",
    done: false,
  },
  {
    id: "t3",
    task: "Book the venue",
    stage: "In progress",
    owner: "Lin Hayashi",
    budget: 8900,
    due: "12 Mar",
    done: false,
  },
  {
    id: "t4",
    task: "Write the invitations",
    stage: "Review",
    owner: "Amara Okafor",
    budget: 450,
    due: "14 Mar",
    done: false,
  },
  {
    id: "t5",
    task: "Order the signage",
    stage: "Planning",
    owner: "Tomás Varga",
    budget: 1780,
    due: "18 Mar",
    done: false,
  },
  {
    id: "t6",
    task: "Confirm the catering",
    stage: "Done",
    owner: "Lin Hayashi",
    budget: 5600,
    due: "21 Mar",
    done: true,
  },
];

const getRowId = (task: Task) => task.id;

/** One cell chosen at first, and a range (Task and Stage, rows 3 to 5: in view on a phone too). */
export const oneCell = {
  anchor: { row: 1, col: 1 },
  active: { row: 1, col: 1 },
};
export const aRange = {
  anchor: { row: 2, col: 0 },
  active: { row: 4, col: 1 },
};

/** The plan's rows in state, and what a DataGrid needs to show and edit them. */
export const usePlan = () => {
  const [rows, setRows] = useState(tasks);
  const onCellsChange = (patch: DataGridPatch) => {
    setRows((now) => applyDataGridPatch(now, patch, getRowId));
  };
  return { rows, columns, getRowId, onCellsChange };
};
