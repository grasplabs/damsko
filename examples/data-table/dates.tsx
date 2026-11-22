"use client";

import { DataTable, dateColumn } from "@grasp-os/ui/components/data-table";
import { useState } from "react";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

interface Run {
  id: string;
  name: string;
  at: number | null;
}

// Runs of a workflow, newest first: when each ran, as people say it ("3 minutes ago", "Yesterday",
// then the day), the full date and time on hover and on focus. It sorts by the date, not the words;
// one never ran, a quiet dash, last.
export default function DataTableDates() {
  // The moment the page opened: the rows' times are made from it, so the words read the same on
  // every visit.
  const [now] = useState(() => Date.now());
  const runs: Run[] = [
    { id: "a", name: "Morning summary", at: now - 3 * MINUTE },
    { id: "b", name: "Invoice check", at: now - 2 * HOUR },
    { id: "c", name: "Supplier reminder", at: now - DAY - HOUR },
    { id: "d", name: "Weekly report", at: now - 9 * DAY },
    { id: "e", name: "Year-end close", at: now - 400 * DAY },
    { id: "f", name: "Draft onboarding", at: null },
  ];
  return (
    <DataTable
      aria-label="Runs"
      rows={runs}
      getRowId={(run) => run.id}
      unit={{ one: "run", other: "runs" }}
      defaultSort={{ key: "at", order: "descending" }}
      columns={[
        {
          id: "name",
          header: "Workflow",
          value: (run) => run.name,
          sortable: true,
        },
        dateColumn<Run>({
          id: "at",
          header: "Last run",
          date: (run) => run.at,
          sortable: true,
        }),
      ]}
    />
  );
}
