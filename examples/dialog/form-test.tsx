"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@grasp-os/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
// For the spec only (tests/dialog.spec.ts), at /examples/dialog/form-test; no page shows it. A
// dialog whose body holds a required field, so the spec can see focus go to the first field and
// an empty field keep the dialog open.
import { useRef, useState } from "react";

// A stand-in for the real request: it takes a moment, so the action shows that it is working.
const save = () => new Promise((resolve) => setTimeout(resolve, 1200));

export default function DialogFormTest() {
  const name = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [empty, setEmpty] = useState(false);
  // An empty name is refused: the field says why, and the dialog stays open.
  const [renameWorking, setRenameWorking] = useState(false);
  const rename = async () => {
    setRenameWorking(true);
    await (async () => {
      if (!name.current?.value.trim()) {
        setEmpty(true);
        name.current?.focus();
        throw new Error("The project needs a name.");
      }
      await save();
      setOpen(false);
    })().finally(() => {
      setRenameWorking(false);
    });
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setEmpty(false);
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary">Rename project</Button>
      </DialogTrigger>
      {/* A ref of the caller's own, so the spec can see the panel hand it the element. */}
      <DialogContent
        ref={(element: HTMLElement | null) =>
          void ((window as { damskoPanel?: HTMLElement | null }).damskoPanel =
            element)
        }
      >
        <DialogHeader>
          <DialogTitle>Rename project</DialogTitle>
          <DialogDescription>
            Everyone in the workspace sees the new name.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Field name="name" data-invalid={empty}>
            <FieldLabel>Project name</FieldLabel>
            <Input
              ref={name}
              defaultValue="Quarterly review"
              required
              onInput={() => {
                setEmpty(false);
              }}
            />
            {empty && <FieldError match>Give the project a name.</FieldError>}
          </Field>
        </DialogBody>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <Button
            size="sm"
            onClick={rename}
            loadingLabel="Renaming"
            errorLabel="Could not rename"
          >
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
