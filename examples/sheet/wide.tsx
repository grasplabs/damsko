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

const sections = [
  {
    title: "Summary",
    text: "Requests closed rose by a tenth this quarter, with support closing the most.",
  },
  {
    title: "What changed",
    text: "Two new members joined operations, and reminders now arrive at the time each person sets.",
  },
  {
    title: "Next steps",
    text: "Review the supplier list before the spring, and plan the office move by the end of the month.",
  },
];

// Each section a head in ink, a step up in weight, close over its paragraph.
const styles = stylex.create({
  section: { display: "grid", rowGap: space["1"] },
  head: {
    margin: 0,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
  },
  text: { margin: 0 },
});

// A stand-in for the real request: it takes a moment, so the action shows that it is working.
const save = () => new Promise((resolve) => setTimeout(resolve, 1200));

// The action is a Button whose press returns a Promise: it works with the sheet open, and closes it once done.
export default function SheetWide() {
  const [open, setOpen] = useState(false);
  const saving = async () => {
    await save();
    setOpen(false);
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">Open the summary</Button>
      </SheetTrigger>
      <SheetContent size="lg">
        <SheetHeader>
          <SheetTitle>Quarterly summary</SheetTitle>
          <SheetDescription>
            A wide sheet holds a layout of its own beside the page.
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          {sections.map((section) => (
            <section key={section.title} {...stylex.props(styles.section)}>
              <h3 {...stylex.props(styles.head)}>{section.title}</h3>
              <p {...stylex.props(styles.text)}>{section.text}</p>
            </section>
          ))}
        </SheetBody>
        <SheetFooter>
          <SheetClose>Cancel</SheetClose>
          <Button
            size="sm"
            onClick={saving}
            loadingText="Saving"
            errorText="Could not save"
          >
            Save all
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
