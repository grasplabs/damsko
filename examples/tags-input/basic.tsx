import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { TagsInput } from "@grasp-os/ui/components/tags-input";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  field: { width: "100%", maxWidth: 400 },
});

// Enter or a comma adds what was typed; Backspace in the empty field takes the last one.
export default function TagsInputBasic() {
  return (
    <Field name="labels" style={layout.field}>
      <FieldLabel>Labels</FieldLabel>
      <TagsInput
        defaultValue={["Quarterly", "Finance"]}
        placeholder="Add a label"
      />
      <FieldDescription>
        Paste several at once, split by commas or lines.
      </FieldDescription>
    </Field>
  );
}
