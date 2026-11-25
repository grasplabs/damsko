import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@grasp-os/ui/components/native-select";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 20, width: "100%", maxWidth: 384 },
});

const sorts = ["Last changed", "Name", "Owner"];

// Small in a dense table or toolbar, default everywhere else, large for the one choice that matters
// on a touch screen. Input's, Select's and Button's heights.
export default function NativeSelectSizes() {
  return (
    <div {...stylex.props(layout.stack)}>
      {(["sm", "default", "lg"] as const).map((size) => (
        <Field key={size}>
          <FieldLabel>
            {size === "sm"
              ? "Sort rows by"
              : size === "default"
                ? "Sort projects by"
                : "Sort people by"}
          </FieldLabel>
          <NativeSelect size={size} defaultValue="Last changed">
            {sorts.map((sort) => (
              <NativeSelectOption key={sort} value={sort}>
                {sort}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
      ))}
    </div>
  );
}
