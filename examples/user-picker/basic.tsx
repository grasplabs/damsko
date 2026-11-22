import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { UserPicker } from "@grasp-os/ui/components/user-picker";
import * as stylex from "@stylexjs/stylex";

import { team } from "./team";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 320 },
});

// The chosen person's avatar stands at the start; type a name, or a role such as "design", to find
// someone. Empty the words to clear the choice.
export default function UserPickerBasic() {
  return (
    <div {...stylex.props(layout.box)}>
      <Field name="assignee">
        <FieldLabel>Assignee</FieldLabel>
        <UserPicker
          users={team}
          defaultValue="amara"
          placeholder="Choose an assignee"
        />
        <FieldDescription>They hear about every change.</FieldDescription>
      </Field>
    </div>
  );
}
