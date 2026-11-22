import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 20, width: "100%", maxWidth: 384 },
});

// Small in a dense table or toolbar, default everywhere else, large for the one field that matters
// on a touch screen. The same heights as Button and Select.
export default function InputSizes() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Field>
        <FieldLabel>Filter rows</FieldLabel>
        <Input size="sm" placeholder="Name or owner" />
      </Field>
      <Field>
        <FieldLabel>Project name</FieldLabel>
        <Input placeholder="Quarterly review" />
      </Field>
      <Field>
        <FieldLabel>Work email</FieldLabel>
        <Input size="lg" type="email" placeholder="name@example.com" />
      </Field>
    </div>
  );
}
