import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@grasp-os/ui/components/native-select";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  field: { width: "100%", maxWidth: 320 },
});

// The browser's own select in the field box: a FieldLabel names it, the first option with the
// value "" is its placeholder, muted while it is chosen.
export default function NativeSelectBasic() {
  return (
    <Field name="channel" style={layout.field}>
      <FieldLabel>Release channel</FieldLabel>
      <NativeSelect defaultValue="">
        <NativeSelectOption value="" disabled>
          Choose a channel
        </NativeSelectOption>
        <NativeSelectOption value="stable">Stable</NativeSelectOption>
        <NativeSelectOption value="beta">Beta</NativeSelectOption>
        <NativeSelectOption value="nightly">Nightly</NativeSelectOption>
      </NativeSelect>
      <FieldDescription>Which releases this workspace takes.</FieldDescription>
    </Field>
  );
}
