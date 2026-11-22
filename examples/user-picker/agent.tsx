import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { UserPicker } from "@grasp-os/ui/components/user-picker";

import { pageAgent } from "../../site/behaviour/agent";
import { team } from "./team";

// The agent fixture: not shown on the page, used by tests/user-picker.spec.ts. An agent finds the
// picker by its label, chooses a person by name, and is refused someone not in the list.
pageAgent();

export default function UserPickerAgent() {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
      style={{ display: "grid", gap: 16, width: 320 }}
    >
      <Field name="assignee">
        <FieldLabel>Assignee</FieldLabel>
        <UserPicker users={team} />
      </Field>
    </form>
  );
}
