import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@grasp-os/ui/components/input-otp";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 20 },
});

// The code's length decides the squares; a separator splits a long one so it is easier to copy.
export default function InputOTPLengths() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Field name="pin">
        <FieldLabel>PIN</FieldLabel>
        <InputOTP maxLength={4}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
      </Field>
      <Field name="recovery">
        <FieldLabel>Recovery code</FieldLabel>
        <InputOTP maxLength={8} pattern="alphanumeric">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
            <InputOTPSlot index={6} />
            <InputOTPSlot index={7} />
          </InputOTPGroup>
        </InputOTP>
      </Field>
    </div>
  );
}
