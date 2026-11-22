import { Button } from "@grasp-os/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { TagsInput } from "@grasp-os/ui/components/tags-input";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  form: { display: "grid", gap: 16, width: "100%", maxWidth: 400 },
  actions: { display: "flex", gap: 8 },
});

// In a form, each tag is sent under the Field's name; Reset brings back the tags it started with.
// Up to three, and the field says so when a fourth is typed. A Field that is out of use takes the
// field with it.
export default function TagsInputForm() {
  const [sent, setSent] = useState<string[] | null>(null);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSent(new FormData(event.currentTarget).getAll("labels").map(String));
      }}
      {...stylex.props(layout.form)}
    >
      <Field name="labels">
        <FieldLabel>Labels</FieldLabel>
        <TagsInput defaultValue={["Design", "Research"]} max={3} />
        <FieldDescription>Up to three.</FieldDescription>
      </Field>
      <Field name="archived" disabled>
        <FieldLabel>Archived labels</FieldLabel>
        <TagsInput defaultValue={["Legacy"]} />
      </Field>
      <div {...stylex.props(layout.actions)}>
        <Button type="submit">Save</Button>
        <Button type="reset" variant="outline">
          Reset
        </Button>
      </div>
      <output aria-label="Sent">{sent === null ? "" : sent.join(", ")}</output>
    </form>
  );
}
