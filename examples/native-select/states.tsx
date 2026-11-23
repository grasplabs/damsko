import { Field } from "@grasp-os/ui/components/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@grasp-os/ui/components/native-select";
import * as stylex from "@stylexjs/stylex";

// A state cell centres what it holds, so the field is given one width in every state: a
// field takes its column's width in a form, never its words'.
const layout = stylex.create({
  field: { width: "12rem", maxWidth: "100%" },
});

const roles = ["Viewer", "Editor", "Admin"];

// One native select in one state. The docs draw it once per state; hover and keyboard focus are
// forced from the select's own CSS. In a product, a Field around it sets `data-invalid` and
// `disabled`.
export default function NativeSelectState({
  value = "",
  invalid = false,
  disabled = false,
}: {
  value?: string;
  invalid?: boolean;
  disabled?: boolean;
}) {
  return (
    <div {...stylex.props(layout.field)}>
      <Field data-invalid={invalid || undefined} disabled={disabled}>
        <NativeSelect aria-label="Role" defaultValue={value}>
          <NativeSelectOption value="">Choose a role</NativeSelectOption>
          {roles.map((role) => (
            <NativeSelectOption key={role} value={role}>
              {role}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
    </div>
  );
}
