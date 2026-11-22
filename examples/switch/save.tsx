import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { Switch } from "@grasp-os/ui/components/switch";
import * as stylex from "@stylexjs/stylex";

// Stand-ins for real requests: one that works and one that fails, said in the default words.
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const saveSummary = () => wait(1200);
const saveReminders = async () => {
  await wait(1200);
  throw new Error("The setting was not saved.");
};

const layout = stylex.create({
  // Room kept for "Could not save" under a row, so the rows do not move when it shows.
  list: {
    display: "grid",
    alignContent: "start",
    width: "100%",
    maxWidth: 360,
    minHeight: 112,
  },
});

export default function SwitchSave() {
  return (
    <div {...stylex.props(layout.list)}>
      <Field orientation="horizontal">
        <FieldLabel>Weekly summary by email</FieldLabel>
        <Switch onSave={saveSummary} />
      </Field>
      <Field orientation="horizontal">
        <FieldLabel>Reminders before a deadline</FieldLabel>
        <Switch onSave={saveReminders} />
      </Field>
    </div>
  );
}
