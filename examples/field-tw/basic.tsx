import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@grasp-os/ui/components-tw/field";
import { Input } from "@grasp-os/ui/components-tw/input";

// A control with its label, a line of help and the error it shows after a send finds it empty. The
// label shows the required mark by itself, as its control is required.
export default function FieldBasic() {
  return (
    <Field name="email" className="w-full max-w-[360px]">
      <FieldLabel>Work email</FieldLabel>
      <Input type="email" autoComplete="email" required />
      <FieldDescription>We send the invite here.</FieldDescription>
      <FieldError match="valueMissing">Enter your work email.</FieldError>
    </Field>
  );
}
