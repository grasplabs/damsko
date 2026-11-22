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

export default function InputBasic() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Field name="name">
        <FieldLabel>Full name</FieldLabel>
        <Input autoComplete="name" placeholder="Anna de Vries" />
      </Field>
      <Field name="email">
        <FieldLabel>Work email</FieldLabel>
        <Input
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
        />
      </Field>
      <Field name="project">
        <FieldLabel>Project name</FieldLabel>
        <Input required placeholder="Quarterly review" />
        <FieldDescription>Everyone in the workspace sees it.</FieldDescription>
      </Field>
    </div>
  );
}
