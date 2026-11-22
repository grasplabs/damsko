import { Button } from "@grasp-os/ui/components/button";
import { Field, FieldError, FieldLabel } from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@grasp-os/ui/components/select";
import { useAction } from "@grasp-os/ui/hooks/use-action";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const roles = ["Viewer", "Editor", "Owner"];

// A stand-in for the real request: it takes a moment, so the button shows that it is working.
const invite = (_data: FormData) =>
  new Promise((resolve) => setTimeout(resolve, 1200));

const layout = stylex.create({
  form: { display: "grid", gap: space["5"], width: "100%", maxWidth: 420 },
  actions: { display: "flex", justifyContent: "flex-end" },
});

// Press Send invite with the fields empty: each field says what it needs, and the first one takes
// focus. Nothing is checked while someone is still typing. The form checks itself (noValidate), so
// the browser's bubble never shows; once both are right, the button says the invite went.
export default function FormsErrors() {
  const send = useAction(invite, {
    loadingLabel: "Sending",
    successLabel: "Sent",
    errorLabel: "Not sent",
  });
  return (
    <form
      noValidate
      {...stylex.props(layout.form)}
      onSubmit={(event) => {
        event.preventDefault();
        // Each Field wrong shows its error, and the first one takes focus; nothing is sent.
        if (!event.currentTarget.checkValidity()) {
          return;
        }
        void send.run(new FormData(event.currentTarget));
      }}
    >
      <Field name="email">
        <FieldLabel>Work email</FieldLabel>
        <Input type="email" placeholder="amara@northwind.example" required />
        <FieldError match="valueMissing">
          Enter the email of the person to invite.
        </FieldError>
        <FieldError match="typeMismatch">
          Enter an email address, such as amara@northwind.example.
        </FieldError>
      </Field>
      <Field name="role">
        <FieldLabel>Role</FieldLabel>
        <Select items={roles} required>
          <SelectTrigger>
            <SelectValue placeholder="Choose a role" />
          </SelectTrigger>
          <SelectContent />
        </Select>
        <FieldError match="valueMissing">
          Choose what they can do in the workspace.
        </FieldError>
      </Field>
      <div {...stylex.props(layout.actions)}>
        <Button
          type="submit"
          variant="default"
          status={send.status}
          loadingLabel="Sending"
          successLabel="Sent"
          errorLabel="Not sent"
        >
          Send invite
        </Button>
      </div>
    </form>
  );
}
