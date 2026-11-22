import { Checkbox, CheckboxGroup } from "@grasp-os/ui/components/checkbox";
import { Field, FieldError, FieldLabel } from "@grasp-os/ui/components/field";
import { useState } from "react";

// The group validity fixture: not shown on the page, driven by tests/checkbox.spec.ts. A required
// group, whose Field shows its error after a submit with none checked; and a group whose Field is
// wrong until one is checked.
export default function CheckboxGroupValidity() {
  const [regions, setRegions] = useState<string[]>([]);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Field>
        <FieldLabel>Send it by</FieldLabel>
        <CheckboxGroup name="channels" required>
          <Field orientation="horizontal">
            <Checkbox value="email" />
            <FieldLabel>Email</FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox value="sms" />
            <FieldLabel>Text message</FieldLabel>
          </Field>
        </CheckboxGroup>
        <FieldError match="valueMissing">
          Choose at least one way to send it.
        </FieldError>
      </Field>
      <Field data-invalid={regions.length === 0}>
        <FieldLabel>Regions</FieldLabel>
        <CheckboxGroup
          name="regions"
          value={regions}
          onValueChange={setRegions}
        >
          <Field orientation="horizontal">
            <Checkbox value="eu" />
            <FieldLabel>Europe</FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox value="us" />
            <FieldLabel>United States</FieldLabel>
          </Field>
        </CheckboxGroup>
        <FieldError>Choose a region to store it in.</FieldError>
      </Field>
    </form>
  );
}
