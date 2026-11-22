"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@grasp-os/ui/components/sheet";
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

// For the spec only (tests/sheet.spec.ts), at /examples/sheet/removes; not on the
// page. Each row's button asks in a Sheet opened by `open`; saying yes removes the row, and
// with it the button that had focus. Focus must then go somewhere sensible (the next row's
// button), never to the page.
export default function SheetRemoves() {
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
              variant="outline"
              onClick={() => {
                setAsking(row);
              }}
            >
              Delete {row}
            </Button>
          </li>
        ))}
      </ul>
      <Sheet
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
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Delete {asking}?</SheetTitle>
              <SheetDescription>
                It goes for good, with its history.
              </SheetDescription>
            </SheetHeader>
            <SheetFooter>
              <SheetClose>Keep it</SheetClose>
              <SheetClose variant="destructive" value="confirm">
                Delete
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        )}
      </Sheet>
    </>
  );
}
