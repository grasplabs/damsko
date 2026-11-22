"use client";

import { DataTable } from "@grasp-os/ui/components/data-table";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import { TrashIcon } from "@grasp-os/ui/lib/icons";
import { useEffect, useState } from "react";

const everyFile = [
  { name: "Floor plan.pdf", size: "2.4 MB" },
  { name: "Budget draft.xlsx", size: "184 KB" },
  { name: "Welcome letter.docx", size: "56 KB" },
  { name: "Team photo.jpg", size: "3.1 MB" },
];

// Each row's checkbox is named for its file. While files are chosen the bar counts them and moves
// them to the trash at once, with Undo in a toast: it can be undone, so it does not ask first.
export default function TablesChoose() {
  // A page has one Toaster at its root; this example keeps its own queue, so its toasts stay its own on a page of many.
  const [toaster] = useState(() => createToaster());
  useEffect(() => () => toaster.dismiss(), [toaster]);
  const [trashed, setTrashed] = useState<string[]>([]);
  const files = everyFile.filter((file) => !trashed.includes(file.name));
  return (
    <>
      <DataTable
        toaster={toaster}
        aria-label="Files"
        caption="Files in the shared folder."
        rows={files}
        getRowId={(file) => file.name}
        selectable
        defaultSelection={["Floor plan.pdf"]}
        unit={{ one: "file", other: "files" }}
        emptyState={{ description: "Every file is in the trash." }}
        actions={[
          {
            label: "Move to trash",
            icon: TrashIcon,
            severity: "undoable",
            run: (names) => {
              setTrashed((now) => [...now, ...names]);
              return () => {
                setTrashed((now) =>
                  now.filter((name) => !names.includes(name))
                );
              };
            },
          },
        ]}
        columns={[
          { id: "name", header: "File", value: (file) => file.name },
          {
            id: "size",
            header: "Size",
            value: (file) => file.size,
            align: "end",
          },
        ]}
      />
      <Toaster toaster={toaster} />
    </>
  );
}
