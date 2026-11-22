import { Button } from "@grasp-os/ui/components/button";
import { DatePicker } from "@grasp-os/ui/components/date-picker";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  form: { display: "grid", gap: 16, width: "100%", maxWidth: 320 },
  actions: { display: "flex", gap: 8 },
});

// In a Field, the label names the date, the description and the error describe it, and `required`
// keeps the form from being sent without one. Reset brings back the date it started with.
export default function DatePickerForm() {
  const [sent, setSent] = useState<string | null>(null);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const due = new FormData(event.currentTarget).get("due");
        setSent(typeof due === "string" ? due : "");
      }}
      {...stylex.props(layout.form)}
    >
      <Field name="due">
        <FieldLabel>Due date</FieldLabel>
        <DatePicker required defaultValue="2026-11-20" />
        <FieldDescription>When the invoice is due.</FieldDescription>
        <FieldError match="valueMissing">Choose a due date.</FieldError>
      </Field>
      <div {...stylex.props(layout.actions)}>
        <Button type="submit">Send</Button>
        <Button type="reset" variant="outline">
          Reset
        </Button>
      </div>
      <output aria-label="Sent">{sent ?? ""}</output>
    </form>
  );
}
