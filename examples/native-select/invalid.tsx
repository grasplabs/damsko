import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@grasp-os/ui/components/native-select";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 20, width: "100%", maxWidth: 384 },
});

const teams = ["Design", "Engineering", "Finance", "Operations", "Sales"];

// Wrong, with what to do; and out of use, with why. Both from the Field round it.
export default function NativeSelectStates() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Field data-invalid>
        <FieldLabel>Team</FieldLabel>
        <NativeSelect defaultValue="" required>
          <NativeSelectOption value="">Choose a team</NativeSelectOption>
          {teams.map((team) => (
            <NativeSelectOption key={team} value={team}>
              {team}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <FieldError match>Choose the team this project belongs to.</FieldError>
      </Field>
      <Field disabled>
        <FieldLabel>Billing team</FieldLabel>
        <NativeSelect defaultValue="Finance">
          {teams.map((team) => (
            <NativeSelectOption key={team} value={team}>
              {team}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <FieldDescription>Only an owner can change who pays.</FieldDescription>
      </Field>
    </div>
  );
}
