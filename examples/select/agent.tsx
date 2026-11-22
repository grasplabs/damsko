import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@grasp-os/ui/components/select";

import { pageAgent } from "../../site/behaviour/agent";

// The agent fixture: not shown on the page, used by tests/select.spec.ts. An agent bridge over
// two selects, so the spec can prove an agent finds each by its label, reads its choices and
// its value, chooses by an item's label, and is refused a value that is not in the list.
pageAgent();

const roles = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
];

export default function SelectAgent() {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
      style={{ display: "grid", gap: 16, width: 280 }}
    >
      <Field name="role">
        <FieldLabel>Role</FieldLabel>
        <Select items={roles} defaultValue="viewer">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent />
        </Select>
      </Field>
      <Field name="team">
        <FieldLabel>Team</FieldLabel>
        <Select items={["Design", "Engineering", "Sales"]}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a team" />
          </SelectTrigger>
          <SelectContent />
        </Select>
      </Field>
    </form>
  );
}
