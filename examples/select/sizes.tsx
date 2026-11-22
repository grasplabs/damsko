import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@grasp-os/ui/components/select";
import * as stylex from "@stylexjs/stylex";

const sorts = ["Last changed", "Name", "Owner"];

const layout = stylex.create({
  stack: { display: "grid", gap: 20, width: "100%", maxWidth: 384 },
});

// Small in a dense table or toolbar, default everywhere else, large for the one choice that matters
// on a touch screen. The same heights as Input.
export default function SelectSizes() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Field>
        <FieldLabel>Sort rows by</FieldLabel>
        <Select items={sorts} defaultValue="Last changed">
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent />
        </Select>
      </Field>
      <Field>
        <FieldLabel>Sort projects by</FieldLabel>
        <Select items={sorts} defaultValue="Last changed">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent />
        </Select>
      </Field>
      <Field>
        <FieldLabel>Sort people by</FieldLabel>
        <Select items={sorts} defaultValue="Last changed">
          <SelectTrigger size="lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent />
        </Select>
      </Field>
    </div>
  );
}
