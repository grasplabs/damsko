import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@grasp-os/ui/components/input-group";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 20, width: "100%", maxWidth: 384 },
});

// Words before or after what is typed: a prefix, a suffix, a unit. They are shown, never sent, and
// a press on them puts the caret in the input.
export default function InputGroupWords() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Field name="website">
        <FieldLabel>Website</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="northwind.example" />
        </InputGroup>
        <FieldDescription>Shown on your public profile.</FieldDescription>
      </Field>
      <Field name="storage">
        <FieldLabel>Storage limit</FieldLabel>
        <InputGroup>
          <InputGroupInput inputMode="numeric" defaultValue="250" />
          <InputGroupAddon align="inline-end">
            <InputGroupText>GB</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </Field>
    </div>
  );
}
