"use client";

import {
  DataTable,
  columnOrderingFeature,
  columnPinningFeature,
  searchParamsLocation,
  columnVisibilityFeature,
} from "@grasp-os/ui/components/data-table";
import { useState } from "react";

import { reports } from "./reports";

// The view lives in the address: sort, search, hide or move a column, then copy the link and it
// opens the same. Export CSV saves the rows found, in the columns shown.
export default function DataTableViews() {
  const [location] = useState(() => searchParamsLocation("reports"));
  return (
    <DataTable
      aria-label="Reports"
      rows={reports}
      getRowId={(report) => report.id}
      features={[
        columnVisibilityFeature,
        columnOrderingFeature,
        columnPinningFeature,
      ]}
      location={location}
      searchable
      exportFileName="reports"
      unit={{ one: "report", other: "reports" }}
      columns={[
        {
          id: "name",
          header: "Report",
          value: (report) => report.name,
          sortable: true,
        },
        {
          id: "owner",
          header: "Owner",
          value: (report) => report.owner,
          sortable: true,
        },
        {
          id: "edited",
          header: "Last edited",
          value: (report) => report.edited,
          sortable: true,
        },
        {
          id: "pages",
          header: "Pages",
          value: (report) => report.pages,
          align: "end",
          sortable: true,
        },
      ]}
    />
  );
}
