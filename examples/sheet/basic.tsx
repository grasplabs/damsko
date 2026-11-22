"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@grasp-os/ui/components/sheet";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const facts = [
  { term: "Owner", detail: "Amara Okafor" },
  { term: "Created", detail: "3 November" },
  { term: "Last edited", detail: "12 November, by Jonas Weber" },
  { term: "Shared with", detail: "The whole workspace" },
];

// The facts as a list of terms: each term small and quiet over its detail in ink, a step apart,
// so the eight lines read as four pairs.
const styles = stylex.create({
  list: { display: "grid", rowGap: space["4"], margin: 0 },
  fact: { display: "grid", rowGap: space["1"] },
  term: {
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
  detail: { margin: 0, color: colors.foreground },
});

// A stand-in for the real request: it takes a moment, so the action shows that it is working.
const archive = () => new Promise((resolve) => setTimeout(resolve, 1200));

// The action is a Button whose press returns a Promise: it works with the sheet open, and closes it once done.
export default function SheetBasic() {
  const [open, setOpen] = useState(false);
  const archiving = async () => {
    await archive();
    setOpen(false);
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">Report details</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Quarterly summary</SheetTitle>
          <SheetDescription>
            Who made this report, and who can see it.
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          <dl {...stylex.props(styles.list)}>
            {facts.map((fact) => (
              <div key={fact.term} {...stylex.props(styles.fact)}>
                <dt {...stylex.props(styles.term)}>{fact.term}</dt>
                <dd {...stylex.props(styles.detail)}>{fact.detail}</dd>
              </div>
            ))}
          </dl>
        </SheetBody>
        <SheetFooter>
          <SheetClose>Close</SheetClose>
          <Button
            size="sm"
            onClick={archiving}
            loadingLabel="Archiving"
            errorLabel="Not archived"
          >
            Archive
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
