import { Field } from "@grasp-os/ui/components/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@grasp-os/ui/components/input-otp";

// One code in one state, a four-digit PIN so it fits its cell. The docs draw it once per state;
// hover is forced from the code's own CSS. In a product, a Field around it sets `data-invalid` and
// `disabled`.
export default function InputOTPState({
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
      <InputOTP
        maxLength={4}
        aria-label="PIN"
        defaultValue={value}
        readOnly={readOnly}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>
    </Field>
  );
}
