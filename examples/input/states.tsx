import { Field } from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";

// One input in one state. The docs draw it once per state; hover and keyboard focus are forced
// from the input's own CSS. In a product, a Field around it sets `data-invalid` and `disabled`.
export default function InputState({
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
    <Field data-invalid={invalid || undefined} disabled={disabled}>
      <Input
        aria-label="Work email"
        type="email"
        placeholder="name@example.com"
        defaultValue={value}
        readOnly={readOnly}
      />
    </Field>
  );
}
