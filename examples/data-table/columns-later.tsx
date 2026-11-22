"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  DataTable,
  columnOrderingFeature,
  columnVisibilityFeature,
} from "@grasp-os/ui/components/data-table";
import type { DataTableColumn } from "@grasp-os/ui/components/data-table";
import { useState } from "react";

import { reports } from "./reports";
import type { Report } from "./reports";

// The later columns fixture: not shown on the page, used by tests/data-table.spec.ts. Columns that
// come after the table opens, with ordering and hiding on: Pages joins at the end, and Last
// edited, which starts hidden, joins hidden.
const first: DataTableColumn<Report>[] = [
  { id: "name", header: "Report", value: (report) => report.name },
  { id: "owner", header: "Owner", value: (report) => report.owner },
];
const later: DataTableColumn<Report>[] = [
  {
    id: "pages",
    header: "Pages",
    value: (report) => report.pages,
    align: "end",
  },
  {
    id: "edited",
    header: "Last edited",
    value: (report) => report.edited,
    hidden: true,
  },
];

export default function DataTableColumnsLater() {
  const [columns, setColumns] = useState(first);
  return (
    <>
      <Button
        variant="secondary"
        onClick={() => {
          setColumns([...first, ...later]);
        }}
      >
        Add columns
      </Button>
      <DataTable
        aria-label="Reports"
        rows={reports}
        getRowId={(report) => report.id}
        features={[columnVisibilityFeature, columnOrderingFeature]}
        columns={columns}
      />
    </>
  );
}
