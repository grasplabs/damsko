"use client";

import {
  DataTable,
  rowExpandingFeature,
} from "@grasp-os/ui/components/data-table";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import { ArchiveIcon, TrashIcon } from "@grasp-os/ui/lib/icons";
import { useEffect, useState } from "react";

import { reports as start } from "./reports";
import type { Report } from "./reports";

const summaries: Record<string, string> = {
  r1: "Revenue, costs and the three numbers the board asked for.",
  r2: "Twelve suppliers, with contacts and the terms agreed in October.",
  r3: "Answers from 41 people, with the themes that came up most.",
};

// Choose rows, then act on them from the bar: Archive is undone from its toast, Delete asks first.
// A row opens to its summary, and has its own actions menu. The Filter builder narrows the rows.
export default function DataTableRows() {
  // A page has one Toaster at its root; this example keeps its own queue, so its toasts stay its own on a page of many.
  const [toaster] = useState(() => createToaster());
  useEffect(() => () => toaster.dismiss(), [toaster]);
  const [rows, setRows] = useState<Report[]>(start);
  const remove = (keys: string[]) => {
    const was = rows;
    setRows((all) => all.filter((report) => !keys.includes(report.id)));
    return () => {
      setRows(was);
    };
  };
  return (
    <>
      <DataTable
        toaster={toaster}
        aria-label="Reports"
        rows={rows}
        getRowId={(report) => report.id}
        features={[rowExpandingFeature]}
        selectable
        filterable
        pageSize={6}
        unit={{ one: "report", other: "reports" }}
        renderDetailPanel={(report) =>
          summaries[report.id] ??
          `${report.pages} pages, last edited by ${report.owner}.`
        }
        actions={[
          {
            label: "Archive",
            icon: ArchiveIcon,
            severity: "undoable",
            run: remove,
          },
          {
            label: "Delete",
            icon: TrashIcon,
            severity: "grave",
            run: (keys) => {
              remove(keys);
              return undefined;
            },
            // The question follows how many are chosen: one report is "this report".
            confirm: (count) =>
              count === 1
                ? {
                    title: "Delete this report?",
                    description:
                      "It goes for good, with its history and comments.",
                  }
                : {
                    title: "Delete these reports?",
                    description:
                      "They go for good, with their history and comments.",
                  },
          },
        ]}
        rowActions={(report) => [
          { label: "Rename", onSelect: () => {} },
          {
            label: "Archive",
            onSelect: () => {
              remove([report.id]);
            },
          },
        ]}
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
            filter: {
              options: [...new Set(start.map((report) => report.owner))],
            },
          },
          {
            id: "pages",
            header: "Pages",
            value: (report) => report.pages,
            align: "end",
            sortable: true,
            filter: "number",
          },
        ]}
      />
      <Toaster toaster={toaster} />
    </>
  );
}
