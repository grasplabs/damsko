import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@grasp-os/ui/components/select";
import * as stylex from "@stylexjs/stylex";

const roles = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
];

const layout = stylex.create({
  field: { width: "100%", maxWidth: 320 },
});

export default function SelectField() {
  return (
    <Field name="role" style={layout.field}>
      <FieldLabel>Role</FieldLabel>
      <Select items={roles} required>
        <SelectTrigger>
          <SelectValue placeholder="Choose a role" />
        </SelectTrigger>
        <SelectContent />
      </Select>
      <FieldDescription>You can change it later in Members.</FieldDescription>
    </Field>
  );
}
