"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@grasp-os/ui/components/alert-dialog";
import { Button } from "@grasp-os/ui/components/button";
import { Checkbox } from "@grasp-os/ui/components/checkbox";
import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import { Link } from "@grasp-os/ui/components/link";
import { Switch } from "@grasp-os/ui/components/switch";
import { ArchiveIcon, Icon, SettingsIcon } from "@grasp-os/ui/lib/icons";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  column: {
    display: "grid",
    gap: space["6"],
    width: "100%",
    maxWidth: 560,
    minWidth: 0,
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space["4"],
    minWidth: 0,
  },
  field: { width: "100%", maxWidth: 320 },
});

// Tab through: a button and an icon button wear the ring on their edge, the checkbox and the
// switch wear it standing off their mark, the link round its words, and the field takes the focus
// colour on its own edge. Then open the dialog with Enter: focus starts on Keep it, Tab stays
// inside, and Escape closes it and gives focus back to Archive project.
export default function AccessibilityFocus() {
  return (
    <div {...stylex.props(styles.column)}>
      <div {...stylex.props(styles.row)}>
        <Button variant="secondary">Rename project</Button>
        <Button variant="ghost" size="icon" aria-label="Project settings">
          <Icon icon={SettingsIcon} />
        </Button>
        <Field orientation="horizontal">
          <Checkbox />
          <FieldLabel>Weekly digest</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <FieldLabel>Show archived</FieldLabel>
          <Switch />
        </Field>
        <Link href="#members" variant="plain">
          See members
        </Link>
      </div>
      <Field name="project-name" style={styles.field}>
        <FieldLabel>Project name</FieldLabel>
        <Input defaultValue="Atlas" />
      </Field>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="secondary">
            <Icon icon={ArchiveIcon} />
            Archive project
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Atlas?</AlertDialogTitle>
            <AlertDialogDescription>
              Its 8 tasks are hidden from the team until someone restores it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction variant="default" value="confirm">
              Archive Atlas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
