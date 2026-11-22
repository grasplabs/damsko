import { Field, FieldError, FieldLabel } from "@grasp-os/ui/components/field";
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

// A code the server turned down, one shown to copy, and one out of use.
export default function InputOTPStates() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Field data-invalid>
        <FieldLabel>Verification code</FieldLabel>
        <InputOTP maxLength={6} defaultValue="902114">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <FieldError match>That code has expired. Ask for a new one.</FieldError>
      </Field>
      <Field>
        <FieldLabel>Pairing code</FieldLabel>
        <InputOTP maxLength={6} readOnly defaultValue="573208">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </Field>
      <Field disabled>
        <FieldLabel>Backup code</FieldLabel>
        <InputOTP maxLength={6} defaultValue="160482">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </Field>
    </div>
  );
}
