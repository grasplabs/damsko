import { Button } from "@grasp-os/ui/components/button";
import { Checkbox, CheckboxGroup } from "@grasp-os/ui/components/checkbox";
import { Field, FieldError, FieldLabel } from "@grasp-os/ui/components/field";
import type { FieldErrorProps } from "@grasp-os/ui/components/field";
import { Form, FormFooter } from "@grasp-os/ui/components/form";
import { Input } from "@grasp-os/ui/components/input";
import {
  RadioGroupItem,
  RadioGroup,
} from "@grasp-os/ui/components/radio-group";

// What tests/form.spec.ts reads: errors wait for a submit and are always in your words. The second
// field has the shape of the fault, a FieldError with `match` and no words of its own (types no
// longer allow it, hence the cast); the groups and the checkbox are required with no `error`.
// None of them may ever show the browser's own sentence.
const wordless = { match: true } as FieldErrorProps;

export default function FormErrorsOnSubmit() {
  return (
    <Form
      aria-label="Invite"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Field name="email">
        <FieldLabel>Work email</FieldLabel>
        <Input type="email" required />
        <FieldError match="valueMissing">
          Enter the email of the person to invite.
        </FieldError>
      </Field>
      <Field name="team">
        <FieldLabel>Team</FieldLabel>
        <Input required />
        <FieldError {...wordless} />
      </Field>
      <Field>
        <FieldLabel>Notify by</FieldLabel>
        <CheckboxGroup name="notify" required>
          <Field orientation="horizontal">
            <Checkbox value="email" />
            <FieldLabel>Email</FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox value="chat" />
            <FieldLabel>Chat</FieldLabel>
          </Field>
        </CheckboxGroup>
      </Field>
      <Field>
        <FieldLabel>Role</FieldLabel>
        <RadioGroup name="role" required>
          <Field orientation="horizontal">
            <RadioGroupItem value="member" />
            <FieldLabel>Member</FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <RadioGroupItem value="admin" />
            <FieldLabel>Admin</FieldLabel>
          </Field>
        </RadioGroup>
      </Field>
      <Field orientation="horizontal">
        <Checkbox name="terms" required />
        <FieldLabel>I accept the terms</FieldLabel>
      </Field>
      <FormFooter>
        <Button type="submit" variant="default">
          Send invite
        </Button>
      </FormFooter>
    </Form>
  );
}
