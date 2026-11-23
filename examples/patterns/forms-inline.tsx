import { Button } from "@grasp-os/ui/components/button";
import { Field, FieldError } from "@grasp-os/ui/components/field";
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
  // At the top, so an error under the email leaves the row's controls in line.
  form: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: space["2"],
    width: "100%",
    maxWidth: 560,
  },
  // In one row the email takes the room left over. When the row must wrap, it wraps once and in
  // one place: the email above, the role and Invite together under it, the role filling the row.
  email: { flexGrow: 999, flexBasis: 200 },
  rest: {
    display: "flex",
    flexGrow: 1,
    alignItems: "flex-start",
    gap: space["2"],
    minWidth: 0,
  },
  role: { flexGrow: 1, flexBasis: 128 },
});

// One short task in one row: the controls share a height, and the row wraps on a narrow screen.
// The form checks itself (noValidate): what is wrong is said under the email, which takes focus.
export default function FormsInline() {
  const send = useAction(invite, {
    loadingText: "Inviting",
    successText: "Invited",
    errorText: "Not invited",
  });
  return (
    <form
      aria-label="Invite someone"
      noValidate
      {...stylex.props(layout.form)}
      onSubmit={(event) => {
        event.preventDefault();
        // The email wrong shows its error and takes focus; nothing is sent.
        if (!event.currentTarget.checkValidity()) {
          return;
        }
        void send.run(new FormData(event.currentTarget));
      }}
    >
      <Field name="email" style={layout.email}>
        <Input
          type="email"
          aria-label="Email"
          placeholder="amara@northwind.example"
          required
        />
        <FieldError match="valueMissing">
          Enter the email of the person to invite.
        </FieldError>
        <FieldError match="typeMismatch">
          Enter an email address, such as amara@northwind.example.
        </FieldError>
      </Field>
      <div {...stylex.props(layout.rest)}>
        <Select items={roles} name="role" defaultValue="Editor">
          <SelectTrigger aria-label="Role" style={layout.role}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent />
        </Select>
        <Button
          type="submit"
          variant="default"
          status={send.status}
          loadingText="Inviting"
          successText="Invited"
          errorText="Not invited"
        >
          Invite
        </Button>
      </div>
    </form>
  );
}
