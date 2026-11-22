import { Checkbox, CheckboxGroup } from "@grasp-os/ui/components/checkbox";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldContent,
} from "@grasp-os/ui/components/field";

import { pageAgent } from "../../site/behaviour/agent";

// The agent fixture: not shown on the page, driven by tests/checkbox.spec.ts. It puts UI SDK's agent
// bridge on the window, so the spec can ask what an agent sees (every checkbox by its label, and
// whether it is checked) and check and empty boxes by name. The form is for what a submit sends.
pageAgent();

export default function CheckboxAgent() {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Field orientation="horizontal">
        <Checkbox name="summary" value="weekly" />
        <FieldContent>
          <FieldLabel>Send me a weekly summary</FieldLabel>
          <FieldDescription>Every Monday morning.</FieldDescription>
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel>Notifications</FieldLabel>
        <CheckboxGroup
          name="notifications"
          defaultValue={["email"]}
          allValues={["email", "sms"]}
        >
          <Field orientation="horizontal">
            <Checkbox parent />
            <FieldLabel>Select all</FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox nested value="email" />
            <FieldLabel>Email</FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox nested value="sms" />
            <FieldLabel>Text message</FieldLabel>
          </Field>
        </CheckboxGroup>
      </Field>
    </form>
  );
}
