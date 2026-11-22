import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldContent,
} from "@grasp-os/ui/components/field";
import {
  RadioGroupItem,
  RadioGroup,
} from "@grasp-os/ui/components/radio-group";

export default function RadioGroupDescription() {
  return (
    <Field>
      <FieldLabel>Who can see this report</FieldLabel>
      <FieldDescription>
        You can change it later from the report's settings.
      </FieldDescription>
      <RadioGroup name="access" defaultValue="team">
        <Field orientation="horizontal">
          <RadioGroupItem value="me" />
          <FieldLabel>Only me</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem value="team" />
          <FieldContent>
            <FieldLabel>My team</FieldLabel>
            <FieldDescription>
              Everyone in the workspace's team can read it.
            </FieldDescription>
          </FieldContent>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem value="link" />
          <FieldContent>
            <FieldLabel>Anyone with the link</FieldLabel>
            <FieldDescription>
              No sign-in needed; the link can be passed on.
            </FieldDescription>
          </FieldContent>
        </Field>
      </RadioGroup>
    </Field>
  );
}
