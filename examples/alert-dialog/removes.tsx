"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@grasp-os/ui/components/alert-dialog";
import { Button } from "@grasp-os/ui/components/button";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  list: {
    display: "grid",
    gap: space["2"],
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space["4"],
    minWidth: 280,
  },
});

// For the check only (tests/alert-dialog.spec.ts), at /examples/alert-dialog/removes; not on the
// page. Each row's button asks in an Alert dialog opened by `open`; saying yes removes the row, and
// with it the button that had focus. Focus must then go somewhere sensible (the next row's
// button), never to the page.
export default function AlertDialogRemoves() {
  const [rows, setRows] = useState([
    "Quarterly summary",
    "Supplier list",
    "Team survey",
  ]);
  const [asking, setAsking] = useState<string | null>(null);
  return (
    <>
      <ul {...stylex.props(layout.list)}>
        {rows.map((row) => (
          <li key={row} {...stylex.props(layout.row)}>
            {row}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setAsking(row);
              }}
            >
              Delete {row}
            </Button>
          </li>
        ))}
      </ul>
      <AlertDialog
        open={asking !== null}
        onOpenChange={(next, details) => {
          if (next) {
            return;
          }
          if (details.returnValue === "confirm") {
            setRows((now) => now.filter((row) => row !== asking));
          }
          setAsking(null);
        }}
      >
        {asking !== null && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {asking}?</AlertDialogTitle>
              <AlertDialogDescription>
                It goes for good, with its history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep it</AlertDialogCancel>
              <AlertDialogAction variant="destructive" value="confirm">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </>
  );
}
