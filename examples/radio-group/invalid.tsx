import { Field, FieldLabel, FieldError } from "@grasp-os/ui/components/field";
import {
  RadioGroupItem,
  RadioGroup,
} from "@grasp-os/ui/components/radio-group";
import { useState } from "react";

// Wrong until a choice is made: the circles' edges turn danger and the error says what to do.
export default function RadioGroupInvalid() {
  const [format, setFormat] = useState<string | null>(null);
  return (
    <Field data-invalid={format === null}>
      <FieldLabel>File type</FieldLabel>
      <RadioGroup
        name="format"
        required
        value={format}
        onValueChange={setFormat}
      >
        <Field orientation="horizontal">
          <RadioGroupItem value="csv" />
          <FieldLabel>CSV</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem value="xlsx" />
          <FieldLabel>Excel</FieldLabel>
        </Field>
      </RadioGroup>
      <FieldError>Choose a file type to start the export.</FieldError>
    </Field>
  );
}
