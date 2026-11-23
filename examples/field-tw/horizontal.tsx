import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components-tw/field";
import { Checkbox } from "@grasp-os/ui/components/checkbox";
import { Switch } from "@grasp-os/ui/components/switch";

// `orientation="horizontal"`: a checkbox first and its words after it, or the words first and a
// switch at the end. A press on the words works the control.
export default function FieldHorizontal() {
  return (
    <div className="grid w-full max-w-[400px] gap-3">
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
