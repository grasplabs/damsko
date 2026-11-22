import { Checkbox } from "@grasp-os/ui/components/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { Switch } from "@grasp-os/ui/components/switch";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: { display: "grid", gap: space[3], width: "100%", maxWidth: 400 },
});

// `orientation="horizontal"`: a checkbox first and its words after it, or the words first and a
// switch at the end. A press on the words works the control.
export default function FieldHorizontal() {
  return (
    <div {...stylex.props(layout.column)}>
      <Field orientation="horizontal">
        <Checkbox name="digest" defaultChecked />
        <FieldContent>
          <FieldLabel>Weekly digest</FieldLabel>
          <FieldDescription>
            A summary of the week, every Monday.
          </FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel>Share with the team</FieldLabel>
          <FieldDescription>Everyone in Finance can open it.</FieldDescription>
        </FieldContent>
        <Switch name="share" />
      </Field>
    </div>
  );
}
