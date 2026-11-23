"use client";

import { Button } from "@grasp-os/ui/components/button";
import { Checkbox } from "@grasp-os/ui/components/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { Form, FormFooter } from "@grasp-os/ui/components/form";
import { HoldButton } from "@grasp-os/ui/components/hold-button";
import { Input } from "@grasp-os/ui/components/input";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@grasp-os/ui/components/select";
import { Textarea } from "@grasp-os/ui/components/textarea";
import { useAction } from "@grasp-os/ui/hooks/use-action";
import { useRef } from "react";

const teams = ["Design", "Engineering", "Finance", "Operations", "Sales"];

// A stand-in for the real request: it takes a moment, so the button shows that it is working.
const saveProject = (_data: FormData) =>
  new Promise((resolve) => setTimeout(resolve, 1200));

// One column, labels above, the one filled button last: the order someone reads and fills it in, in
// a Form, which gives the fields and the buttons their room. Unsaved changes cannot come back once
// discarded, so Discard takes a hold. A setting that waits for Save is a checkbox, not a switch: a
// switch acts the moment it turns. An empty name says so under the field and takes focus: the
// Field's own error stands in for the browser's bubble.
export default function FormsSettings() {
  const form = useRef<HTMLFormElement>(null);
  const save = useAction(saveProject, {
    loadingText: "Saving",
    successText: "Saved",
    errorText: "Not saved",
  });
  return (
    <Form
      ref={form}
      aria-label="Project settings"
      onSubmit={(event) => {
        // Runs only when every Field is right; the form is sent here, not by the browser.
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
      <Field name="team">
        <FieldLabel>Team</FieldLabel>
        <Select items={teams} defaultValue="Operations">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent />
        </Select>
        <FieldDescription>
          The team sees the project first in its list.
        </FieldDescription>
      </Field>
      <Field name="notes">
        <FieldLabel>Notes</FieldLabel>
        <Textarea placeholder="What should the team know before the review?" />
      </Field>
      <Field orientation="horizontal">
        <Checkbox name="summary" defaultChecked />
        <FieldLabel>Send a weekly summary</FieldLabel>
      </Field>
      <FormFooter>
        {/* Once the hold is done, the form's fields go back to what was saved. */}
        <HoldButton variant="outline" onConfirm={() => form.current?.reset()}>
          Discard changes
        </HoldButton>
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
  );
}
