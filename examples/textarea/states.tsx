import { Field } from "@grasp-os/ui/components/field";
import { Textarea } from "@grasp-os/ui/components/textarea";
import * as stylex from "@stylexjs/stylex";

// A state cell centres what it holds, so the field is given one width in every state: a
// field takes its column's width in a form, never its words'.
const layout = stylex.create({
  field: { width: "12rem", maxWidth: "100%" },
});

// One textarea in one state, one line tall so it stands in a states cell. The docs draw it once
// per state; hover and keyboard focus are forced from its own CSS. In a product, a Field around it
// sets `data-invalid` and `disabled`.
export default function TextareaState({
  value,
  invalid = false,
  readOnly = false,
  disabled = false,
}: {
  value?: string;
  invalid?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  return (
    <div {...stylex.props(layout.field)}>
      <Field data-invalid={invalid || undefined} disabled={disabled}>
        <Textarea
          aria-label="Notes"
          rows={1}
          placeholder="Add a note"
          defaultValue={value}
          readOnly={readOnly}
        />
      </Field>
    </div>
  );
}
