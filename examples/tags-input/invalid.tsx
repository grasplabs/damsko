import { Field, FieldError, FieldLabel } from "@grasp-os/ui/components/field";
import { TagsInput } from "@grasp-os/ui/components/tags-input";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  field: { width: "100%", maxWidth: 400 },
});

const isAddress = (text: string) =>
  /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/u.test(text);

// A wrong value stays, marked, so it can be corrected: here an address that is not one, as a form
// shows it once Send was pressed. The field says what is wrong under it.
export default function TagsInputInvalid() {
  return (
    <Field name="emails" data-invalid style={layout.field}>
      <FieldLabel>Email addresses</FieldLabel>
      <TagsInput
        defaultValue={[
          "jonas@contoso.example",
          "mira@contoso",
          "pieter@contoso.example",
        ]}
        validate={(value) => isAddress(value) || "not an email address"}
      />
      <FieldError match>
        This is not an email address: mira@contoso. Correct or remove it.
      </FieldError>
    </Field>
  );
}
