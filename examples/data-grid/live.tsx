import {
  applyDataGridPatch,
  DataGrid,
} from "@grasp-os/ui/components/data-grid";
import type { DataGridPatch } from "@grasp-os/ui/components/data-grid";
import { useEffect, useState } from "react";

import { columns, usePlan } from "./plan";
import type { Task } from "./plan";

const news: Task = {
  id: "t0",
  task: "Answer the press",
  stage: "Planning",
  owner: "Lin Hayashi",
  budget: 300,
  due: "1 Mar",
  done: false,
};

// Rows that change while the grid is open, as a refetch brings them: every 20 seconds a task comes
// in on top, and goes again 20 seconds later. What is chosen and what is being typed stay with
// their rows.
export default function DataGridLive() {
  const plan = usePlan();
  const [incoming, setIncoming] = useState(false);
  const [arrival, setArrival] = useState(news);
  useEffect(() => {
    const timer = setInterval(() => {
      setIncoming((now) => !now);
    }, 20_000);
    return () => {
      clearInterval(timer);
    };
  }, []);
  const onCellsChange = (patch: DataGridPatch) => {
    plan.onCellsChange(patch);
    setArrival(
      (now) => applyDataGridPatch([now], patch, plan.getRowId)[0] ?? now
    );
  };
  return (
    <DataGrid
      aria-label="Live plan"
      columns={columns}
      getRowId={plan.getRowId}
      rows={incoming ? [arrival, ...plan.rows] : plan.rows}
      onCellsChange={onCellsChange}
    />
  );
}
