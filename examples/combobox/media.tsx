import { Avatar, AvatarFallback } from "@grasp-os/ui/components/avatar";
import { Combobox } from "@grasp-os/ui/components/combobox";
import type { ComboboxItem } from "@grasp-os/ui/components/combobox";
import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import * as stylex from "@stylexjs/stylex";

// A fixture: not shown on the page, used by tests/combobox.spec.ts. Items with media and no `media`
// on the combobox: the field shows words only until someone is chosen, then their avatar.
const reviewers: ComboboxItem[] = ["Lena Ruiz", "Sam Patel", "Mei Chen"].map(
  (name) => ({
    value: name,
    label: name,
    media: (
      <Avatar name={name} size="xs" decorative>
        <AvatarFallback />
      </Avatar>
    ),
  })
);

const layout = stylex.create({
  field: { width: "100%", maxWidth: 320 },
});

export default function ComboboxMedia() {
  return (
    <Field name="reviewer" style={layout.field}>
      <FieldLabel>Reviewer</FieldLabel>
      <Combobox items={reviewers} placeholder="Choose a reviewer" />
    </Field>
  );
}
