import { Button } from "@grasp-os/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { Form, FormFooter, FormRow } from "@grasp-os/ui/components/form";
import { Input } from "@grasp-os/ui/components/input";

// Fields down the column, two side by side in a row, and the buttons at the end. A required field
// says what is wrong under it when the form is sent without it (FieldError), never only in the
// browser's bubble.
export default function FormBasic() {
  return (
    <Form
      aria-label="Profile"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <FormRow>
        <Field name="first-name">
          <FieldLabel>First name</FieldLabel>
          <Input autoComplete="given-name" defaultValue="Alex" />
        </Field>
        <Field name="last-name">
          <FieldLabel>Last name</FieldLabel>
          <Input autoComplete="family-name" defaultValue="Morgan" />
        </Field>
      </FormRow>
      <Field name="email">
        <FieldLabel>Work email</FieldLabel>
        <Input
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          required
        />
        <FieldDescription>Where the team reaches you.</FieldDescription>
        <FieldError match="valueMissing">Enter your work email.</FieldError>
        <FieldError match="typeMismatch">
          Enter an email address, like name@example.com.
        </FieldError>
      </Field>
      <FormFooter>
        <Button type="reset" variant="outline">
          Cancel
        </Button>
        <Button type="submit" variant="default">
          Save profile
        </Button>
      </FormFooter>
    </Form>
  );
}
