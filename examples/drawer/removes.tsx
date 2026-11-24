"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerContent,
  DrawerTitle,
} from "@grasp-os/ui/components/drawer";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  list: {
    display: "grid",
    gap: space["2"],
    // Each row's button reaches the middle of the gap to the next on a touch screen.
    "--tap-room-block": `calc(${space["2"]} / 2)`,
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

// For the spec only (tests/drawer.spec.ts), at /examples/drawer/removes; not on the
// page. Each row's button asks in a Drawer opened by `open`; saying yes removes the row, and
// with it the button that had focus. Focus must then go somewhere sensible (the next row's
// button), never to the page.
export default function DrawerRemoves() {
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
      <Drawer
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
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Delete {asking}?</DrawerTitle>
              <DrawerDescription>
                It goes for good, with its history.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose>Keep it</DrawerClose>
              <DrawerClose variant="destructive" value="confirm">
                Delete
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        )}
      </Drawer>
    </>
  );
}
