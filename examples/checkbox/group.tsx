import { Checkbox, CheckboxGroup } from "@grasp-os/ui/components/checkbox";
import {
  Field,
  FieldLabel,
  FieldDescription,
} from "@grasp-os/ui/components/field";

const channels = [
  { value: "email", label: "Email" },
  { value: "sms", label: "Text message" },
  { value: "app", label: "In the app" },
];

export default function CheckboxGroupExample() {
  return (
    <Field>
      <FieldLabel>Notifications</FieldLabel>
      <FieldDescription>How we tell you a review is waiting.</FieldDescription>
      <CheckboxGroup
        name="notifications"
        defaultValue={["email"]}
        allValues={channels.map((channel) => channel.value)}
      >
        <Field orientation="horizontal">
          <Checkbox parent />
          <FieldLabel>Select all</FieldLabel>
        </Field>
        {channels.map((channel) => (
          <Field orientation="horizontal" key={channel.value}>
            <Checkbox nested value={channel.value} />
            <FieldLabel>{channel.label}</FieldLabel>
          </Field>
        ))}
      </CheckboxGroup>
    </Field>
  );
}
