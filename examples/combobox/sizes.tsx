import { Combobox } from "@grasp-os/ui/components/combobox";
import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import * as stylex from "@stylexjs/stylex";

const people = [
  "Amara Okafor",
  "Bram de Vries",
  "Chen Wei",
  "Dana Levi",
  "Elif Kaya",
  "Farah Haddad",
];

const layout = stylex.create({
  stack: { display: "grid", gap: 20, width: "100%", maxWidth: 384 },
});

// Small in a dense table or toolbar, default everywhere else, large for the one choice that matters
// on a touch screen. The same heights as Input.
export default function ComboboxSizes() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Field>
        <FieldLabel>Reviewer</FieldLabel>
        <Combobox size="sm" items={people} placeholder="Search people" />
      </Field>
      <Field>
        <FieldLabel>Owner</FieldLabel>
        <Combobox items={people} defaultValue="Chen Wei" />
      </Field>
      <Field>
        <FieldLabel>Assignee</FieldLabel>
        <Combobox size="lg" items={people} placeholder="Search people" />
      </Field>
    </div>
  );
}
