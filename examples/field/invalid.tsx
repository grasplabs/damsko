import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  field: { width: "100%", maxWidth: 360 },
});

// An error your code decides, such as the server saying no: `data-invalid` shows it at once.
export default function FieldInvalid() {
  return (
    <Field name="handle" data-invalid style={layout.field}>
      <FieldLabel>Team handle</FieldLabel>
      <Input defaultValue="finance" />
      <FieldDescription>
        Letters and numbers, as it shows in links.
      </FieldDescription>
      <FieldError>Another team has this handle already.</FieldError>
    </Field>
  );
}
