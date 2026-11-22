import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldContent,
} from "@grasp-os/ui/components/field";
import { Switch } from "@grasp-os/ui/components/switch";

import { pageAgent } from "../../site/behaviour/agent";

// The agent fixture: not shown on the page, driven by tests/switch.spec.ts. It puts UI SDK's agent
// bridge on the window, so the spec can ask what an agent sees (every switch by its label, and
// whether it is on) and turn switches by name, one of them through a save. The form is for what a
// submit sends.
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

pageAgent();

export default function SwitchAgent() {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel>Weekly summary</FieldLabel>
          <FieldDescription>Every Monday morning.</FieldDescription>
        </FieldContent>
        <Switch name="summary" />
      </Field>
      <Field orientation="horizontal">
        <FieldLabel>Reminders</FieldLabel>
        <Switch onSave={() => wait(300)} errorLabel="Could not save" />
      </Field>
    </form>
  );
}
