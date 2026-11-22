import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { TagsInput } from "@grasp-os/ui/components/tags-input";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  field: { width: "100%", maxWidth: 400 },
});

const teams = [
  "Design",
  "Engineering",
  "Finance",
  "Legal",
  "Operations",
  "Research",
  "Sales",
  "Support",
];

// The teams to choose from open as you type; a team not on the list is added as it is.
export default function TagsInputSuggestions() {
  return (
    <Field name="teams" style={layout.field}>
      <FieldLabel>Teams</FieldLabel>
      <TagsInput
        suggestions={teams}
        defaultValue={["Design"]}
        placeholder="Add a team"
      />
    </Field>
  );
}
