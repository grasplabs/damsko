import { Button } from "@grasp-os/ui/components/button";
import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import {
  Form,
  FormFooter,
  FormSection,
  FormRow,
} from "@grasp-os/ui/components/form";
import { Input } from "@grasp-os/ui/components/input";

// Sections under a title and a sentence, a hairline between them.
export default function FormSections() {
  return (
    <Form
      aria-label="Workspace settings"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <FormSection
        title="Workspace"
        description="Everyone in the workspace sees these."
      >
        <Field name="workspace">
          <FieldLabel>Name</FieldLabel>
          <Input defaultValue="Northwind Studio" />
        </Field>
        <Field name="website">
          <FieldLabel>Website</FieldLabel>
          <Input type="url" placeholder="https://northwind.example" />
        </Field>
      </FormSection>
      <FormSection title="Address" description="Printed on every invoice.">
        <Field name="street">
          <FieldLabel>Street</FieldLabel>
          <Input autoComplete="street-address" defaultValue="14 Harbour Lane" />
        </Field>
        <FormRow>
          <Field name="city">
            <FieldLabel>City</FieldLabel>
            <Input autoComplete="address-level2" defaultValue="Bristol" />
          </Field>
          <Field name="postcode">
            <FieldLabel>Postcode</FieldLabel>
            <Input autoComplete="postal-code" defaultValue="BS1 4RB" />
          </Field>
        </FormRow>
      </FormSection>
      <FormFooter>
        <Button type="reset" variant="outline">
          Cancel
        </Button>
        <Button type="submit" variant="default">
          Save settings
        </Button>
      </FormFooter>
    </Form>
  );
}
