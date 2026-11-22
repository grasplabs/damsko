import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@grasp-os/ui/components/input-otp";
import { useState } from "react";

import { pageAgent } from "../../site/behaviour/agent";

// The agent fixture: not shown on the page, used by tests/input-otp.spec.ts. An agent bridge over
// one code, so the spec can prove an agent finds it by its label and fills it, and a line that
// says when the code is whole (`onComplete`).
pageAgent();

export default function InputOTPAgent() {
  const [complete, setComplete] = useState<string | null>(null);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
      style={{ display: "grid", gap: 16, width: 320 }}
    >
      <Field name="code">
        <FieldLabel>Verification code</FieldLabel>
        <InputOTP
          maxLength={6}
          onComplete={(code) => {
            setComplete(code);
          }}
        >
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
      {complete !== null && <p>Checking {complete}</p>}
    </form>
  );
}
