import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@grasp-os/ui/components-tw/field";
import { Input } from "@grasp-os/ui/components-tw/input";

// An error your code decides, such as the server saying no: `data-invalid` shows it at once.
export default function FieldInvalid() {
  return (
    <Field name="handle" data-invalid className="w-full max-w-[360px]">
      <FieldLabel>Team handle</FieldLabel>
      <Input defaultValue="finance" />
      <FieldDescription>
        Letters and numbers, as it shows in links.
      </FieldDescription>
      <FieldError>Another team has this handle already.</FieldError>
    </Field>
  );
}
