import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 20, width: "100%", maxWidth: 384 },
});

// The type brings the right keyboard on a phone, and the browser's own check.
export default function InputKinds() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Field>
        <FieldLabel>Work email</FieldLabel>
        <Input
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
        />
      </Field>
      <Field>
        <FieldLabel>Company website</FieldLabel>
        <Input type="url" placeholder="https://example.com" />
      </Field>
      <Field>
        <FieldLabel>Phone</FieldLabel>
        <Input type="tel" autoComplete="tel" placeholder="+31 20 123 4567" />
        <FieldDescription>Only for the delivery driver.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Daily summary at</FieldLabel>
        <Input type="time" defaultValue="09:00" />
        <FieldDescription>
          Typed, or stepped with the arrow keys.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Shared folder</FieldLabel>
        <Input
          readOnly
          defaultValue="https://files.example.com/projects/quarterly-review-2026/briefing-documents"
        />
      </Field>
    </div>
  );
}
