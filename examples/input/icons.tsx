import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { Input, PasswordInput } from "@grasp-os/ui/components/input";
import { SearchIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 20, width: "100%", maxWidth: 384 },
});

// An icon at the start when it says what goes in faster: search. A password shows and hides itself.
export default function InputIcons() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Input
        type="search"
        icon={SearchIcon}
        aria-label="Search projects"
        placeholder="Search projects"
      />
      <Field name="password">
        <FieldLabel>Password</FieldLabel>
        <PasswordInput placeholder="At least 12 characters" />
      </Field>
    </div>
  );
}
