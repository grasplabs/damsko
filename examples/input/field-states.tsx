import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 20, width: "100%", maxWidth: 384 },
});

export default function InputFieldStates() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Field>
        <FieldLabel>Project name</FieldLabel>
        <Input defaultValue="Quarterly review" />
      </Field>
      <Field disabled>
        <FieldLabel>Workspace</FieldLabel>
        <Input defaultValue="Northwind" />
        <FieldDescription>
          Only an owner can rename the workspace.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Project ID</FieldLabel>
        <Input defaultValue="prj_4f81c2" readOnly />
      </Field>
      <Field data-invalid>
        <FieldLabel>Work email</FieldLabel>
        <Input type="email" defaultValue="anna@example.com" />
        <FieldError match>
          Use your work address, not a personal one.
        </FieldError>
      </Field>
    </div>
  );
}
