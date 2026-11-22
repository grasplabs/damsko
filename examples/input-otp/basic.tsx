import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@grasp-os/ui/components/input-otp";

// Six digits in two threes, as the code reads in the message. Paste it or let the phone fill it.
export default function InputOTPBasic() {
  return (
    <Field name="code">
      <FieldLabel>Verification code</FieldLabel>
      <InputOTP maxLength={6}>
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
      <FieldDescription>Sent to the phone ending 0417.</FieldDescription>
    </Field>
  );
}
