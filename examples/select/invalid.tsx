import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@grasp-os/ui/components/select";
import * as stylex from "@stylexjs/stylex";

const teams = ["Design", "Engineering", "Finance", "Operations", "Sales"];

const layout = stylex.create({
  stack: { display: "grid", gap: 20, width: "100%", maxWidth: 384 },
});

export default function SelectFieldStates() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Field data-invalid>
        <FieldLabel>Team</FieldLabel>
        <Select items={teams} required>
          <SelectTrigger>
            <SelectValue placeholder="Choose a team" />
          </SelectTrigger>
          <SelectContent />
        </Select>
        <FieldError match>Choose the team this project belongs to.</FieldError>
      </Field>
      <Field disabled>
        <FieldLabel>Billing team</FieldLabel>
        <Select items={teams} defaultValue="Finance">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent />
        </Select>
        <FieldDescription>Only an owner can change who pays.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Created by team</FieldLabel>
        <Select items={teams} defaultValue="Operations" readOnly>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent />
        </Select>
      </Field>
    </div>
  );
}
