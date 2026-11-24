"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@grasp-os/ui/components/alert-dialog";
import { Button } from "@grasp-os/ui/components/button";
import { Field, FieldError, FieldLabel } from "@grasp-os/ui/components/field";
import { Form, FormFooter } from "@grasp-os/ui/components/form";
import { Heading } from "@grasp-os/ui/components/heading";
import { Input } from "@grasp-os/ui/components/input";
import { Text } from "@grasp-os/ui/components/text";
import { useAction } from "@grasp-os/ui/hooks/use-action";
import { Icon, TrashIcon } from "@grasp-os/ui/lib/icons";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

// Stand-ins for the real requests: each takes a moment, so its button shows that it is working.
const saveProject = (_data: FormData) =>
  new Promise((resolve) => setTimeout(resolve, 1200));
const deleteProject = () => new Promise((resolve) => setTimeout(resolve, 1200));

const layout = stylex.create({
  page: { display: "grid", gap: space["10"], width: "100%", maxWidth: 420 },
  danger: { display: "grid", justifyItems: "start", gap: space["3"] },
});

// What deletes the thing the form is about stands apart from the form: under it, last on the
// page, in a section of its own that says what is lost. It is never in the form's row of actions,
// where it would sit beside Save. A grave loss asks in an alert dialog; a small one (a draft, a
// member) would take a hold on the button instead.
export default function FormsDanger() {
  const save = useAction(saveProject, {
    loadingText: "Saving",
    successText: "Saved",
    errorText: "Not saved",
  });
  const [open, setOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const remove = async () => {
    setRemoving(true);
    await deleteProject().finally(() => {
      setRemoving(false);
    });
    setOpen(false);
  };
  return (
    <div {...stylex.props(layout.page)}>
      <Form
        aria-label="Project settings"
        onSubmit={(event) => {
          event.preventDefault();
          void save.run(new FormData(event.currentTarget));
        }}
      >
        <Field name="name">
          <FieldLabel>Project name</FieldLabel>
          <Input defaultValue="Quarterly review" required />
          <FieldError match="valueMissing">
            Enter a name for the project.
          </FieldError>
        </Field>
        <FormFooter>
          <Button
            type="submit"
            variant="default"
            status={save.status}
            loadingText="Saving"
            successText="Saved"
            errorText="Not saved"
          >
            Save changes
          </Button>
        </FormFooter>
      </Form>
      <section
        aria-labelledby="delete-project"
        {...stylex.props(layout.danger)}
      >
        <Heading level={2} size="xs" id="delete-project">
          Delete this project
        </Heading>
        <Text color="muted">
          Its 14 reports and their comments are deleted for everyone. This
          cannot be undone.
        </Text>
        <AlertDialog
          open={open}
          onOpenChange={(next, details) => {
            if (removing) {
              details.cancel();
              return;
            }
            setOpen(next);
          }}
        >
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Icon icon={TrashIcon} />
              Delete project
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Quarterly review?</AlertDialogTitle>
              <AlertDialogDescription>
                Its 14 reports and their comments are deleted for everyone. This
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel />
              <Button
                variant="destructive"
                onClick={remove}
                loadingText="Deleting"
                errorText="Not deleted"
                agentConfirm="Deletes the project Quarterly review and its 14 reports"
              >
                Delete forever
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}
