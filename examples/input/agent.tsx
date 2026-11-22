import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";

import { pageAgent } from "../../site/behaviour/agent";

// The agent fixture: not shown on the page, used by tests/input.spec.ts. An agent bridge over a
// small form, so the check can prove an agent finds each field by its label, reads and sets its
// value, and never reads a password or a `secret` value back.
pageAgent();

export default function InputAgent() {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
      style={{ display: "grid", gap: 16, width: 280 }}
    >
      <Field name="email">
        <FieldLabel>Work email</FieldLabel>
        <Input type="email" defaultValue="anna@acme.example" />
      </Field>
      <Field name="project">
        <FieldLabel>Project name</FieldLabel>
        <Input placeholder="Quarterly review" />
      </Field>
      <Field name="key">
        <FieldLabel>API key</FieldLabel>
        <Input secret defaultValue="sk_live_51Hx" />
      </Field>
      <Field name="password">
        <FieldLabel>Password</FieldLabel>
        <Input type="password" defaultValue="correct horse" />
      </Field>
    </form>
  );
}
