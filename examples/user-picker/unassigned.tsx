import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { UserPicker } from "@grasp-os/ui/components/user-picker";
import * as stylex from "@stylexjs/stylex";

import { team } from "./team";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 320 },
});

// With no one chosen yet, a quiet icon stands where the avatar will be.
export default function UserPickerUnassigned() {
  return (
    <div {...stylex.props(layout.box)}>
      <Field name="reviewer">
        <FieldLabel>Reviewer</FieldLabel>
        <UserPicker users={team} placeholder="Choose a reviewer" />
      </Field>
    </div>
  );
}
