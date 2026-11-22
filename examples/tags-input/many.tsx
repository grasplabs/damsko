import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { TagsInput } from "@grasp-os/ui/components/tags-input";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  field: { width: "100%", maxWidth: 320 },
});

const keywords = [
  "project reviews",
  "quarterly planning",
  "team retrospectives",
  "budget",
  "roadmap",
  "hiring",
];

// Many tags wrap onto more lines inside the field; it never runs past its column. Up to eight.
export default function TagsInputMany() {
  return (
    <Field name="keywords" style={layout.field}>
      <FieldLabel>Keywords</FieldLabel>
      <TagsInput defaultValue={keywords} max={8} placeholder="Add a keyword" />
    </Field>
  );
}
