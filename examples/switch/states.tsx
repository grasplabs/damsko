import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { Switch } from "@grasp-os/ui/components/switch";
import type { ActionStatus } from "@grasp-os/ui/hooks/use-action";
import * as stylex from "@stylexjs/stylex";

// One switch in one state. The docs draw it once per state, off and on; hover, keyboard focus and
// pressed are forced from the switch's own CSS, and loading and error are its `status`. In a
// product `onSave` moves it through them.
const never = () => new Promise<void>(() => {});

// Every state in a box as tall as the tallest (failed, with its words under the switch), the
// switch at its top: a row of states is one size and the switches stand level.
const layout = stylex.create({
  box: { display: "grid", alignItems: "start", minHeight: 68 },
});

export default function SwitchState({
  value = "off",
  status = "idle",
  disabled = false,
}: {
  value?: "off" | "on";
  status?: ActionStatus;
  disabled?: boolean;
}) {
  return (
    <div {...stylex.props(layout.box)}>
      <Field orientation="horizontal" disabled={disabled}>
        <FieldLabel>Weekly summary</FieldLabel>
        <Switch
          defaultChecked={value === "on"}
          onSave={never}
          errorLabel="Could not save"
          status={status}
        />
      </Field>
    </div>
  );
}
