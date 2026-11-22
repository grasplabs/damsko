"use client";

import {
  DataTable,
  groupingFeature,
  searchParamsLocation,
} from "@grasp-os/ui/components/data-table";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { reports } from "./reports";

const layout = stylex.create({
  column: { display: "grid", gap: space["3"], width: "100%" },
  said: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
  },
});

// Groups closed by hand stay closed: the page keeps them in its own state (closedGroups), and the
// link keeps them too (location), so a reload, Back and Forward bring them back as they were.
export default function DataTableGroupsKept() {
  const [closed, setClosed] = useState<string[]>([]);
  const [location] = useState(() => searchParamsLocation("kept"));
  return (
    <div {...stylex.props(layout.column)}>
      <DataTable
        aria-label="Reports by owner"
        rows={reports}
        getRowId={(report) => report.id}
        features={[groupingFeature]}
        groupBy="owner"
        collapsedGroups={closed}
        onCollapsedGroupsChange={setClosed}
        location={location}
        unit={{ one: "report", other: "reports" }}
        columns={[
          {
            id: "name",
            header: "Report",
            value: (report) => report.name,
            sortable: true,
          },
          { id: "owner", header: "Owner", value: (report) => report.owner },
          {
            id: "pages",
            header: "Pages",
            value: (report) => report.pages,
            align: "end",
            sortable: true,
          },
        ]}
      />
      <p {...stylex.props(layout.said)} data-closed={closed.join("|")}>
        {closed.length === 0
          ? "Every group is open."
          : `Closed: ${closed.join(", ")}`}
      </p>
    </div>
  );
}
