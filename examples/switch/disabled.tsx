import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldContent,
} from "@grasp-os/ui/components/field";
import { Switch } from "@grasp-os/ui/components/switch";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  list: { display: "grid", width: "100%", maxWidth: 360 },
});

export default function SwitchDisabled() {
  return (
    <div {...stylex.props(layout.list)}>
      <Field orientation="horizontal" disabled>
        <FieldContent>
          <FieldLabel>Keep a copy of every export</FieldLabel>
          <FieldDescription>
            Your workspace keeps exports for a year. Ask an owner to change it.
          </FieldDescription>
        </FieldContent>
        <Switch defaultChecked />
      </Field>
      <Field orientation="horizontal" disabled>
        <FieldLabel>Share exports outside the workspace</FieldLabel>
        <Switch />
      </Field>
    </div>
  );
}
