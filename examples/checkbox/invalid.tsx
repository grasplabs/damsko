import { Checkbox } from "@grasp-os/ui/components/checkbox";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldContent,
} from "@grasp-os/ui/components/field";
import { useState } from "react";

// Wrong until it is checked: the edge turns danger and the error says how to put it right.
export default function CheckboxInvalid() {
  const [accepted, setAccepted] = useState(false);
  return (
    <Field orientation="horizontal" data-invalid={!accepted}>
      <Checkbox
        required
        checked={accepted}
        onCheckedChange={(checked) => {
          setAccepted(checked === true);
        }}
      />
      <FieldContent>
        <FieldLabel>I accept the data processing terms</FieldLabel>
        <FieldError>Accept the terms to start the export.</FieldError>
      </FieldContent>
    </Field>
  );
}
