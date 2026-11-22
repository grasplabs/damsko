import { Checkbox } from "@grasp-os/ui/components/checkbox";
import { Combobox, ComboboxEmpty } from "@grasp-os/ui/components/combobox";
import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import { Label } from "@grasp-os/ui/components/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@grasp-os/ui/components/radio-group";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@grasp-os/ui/components/select";
import { Slider } from "@grasp-os/ui/components/slider";
import { Switch } from "@grasp-os/ui/components/switch";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: { display: "grid", gap: space["5"], width: "100%", maxWidth: 360 },
});

const units = ["Hours", "Days", "Weeks"];
const zones = [
  { value: "ams", label: "Amsterdam" },
  { value: "lon", label: "London" },
  { value: "nyc", label: "New York" },
];

// Every control a Field names, each required: the label shows its mark, and the control's name is
// the label's words alone. The mark is drawn by the label, never part of its text.
export default function FormRequiredNames() {
  return (
    <div {...stylex.props(layout.column)}>
      <Field name="title">
        <FieldLabel>Report title</FieldLabel>
        <Input required />
      </Field>
      <Field name="unit">
        <FieldLabel>Count in</FieldLabel>
        <Select items={units} required>
          <SelectTrigger>
            <SelectValue placeholder="Choose a unit" />
          </SelectTrigger>
          <SelectContent />
        </Select>
      </Field>
      <Field name="zone">
        <FieldLabel>Time zone</FieldLabel>
        <Combobox items={zones} placeholder="Search time zones" required>
          <ComboboxEmpty>No time zone has that name</ComboboxEmpty>
        </Combobox>
      </Field>
      <Field orientation="horizontal">
        <FieldLabel>Allow decimals</FieldLabel>
        <Switch name="decimals" required />
      </Field>
      <Field orientation="horizontal">
        <Checkbox name="terms" required />
        <FieldLabel>I agree to the terms</FieldLabel>
      </Field>
      <Field>
        <FieldLabel>Send it</FieldLabel>
        <RadioGroup name="when" required>
          <Field orientation="horizontal">
            <RadioGroupItem value="now" />
            <FieldLabel>Now</FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <RadioGroupItem value="monday" />
            <FieldLabel>On Monday</FieldLabel>
          </Field>
        </RadioGroup>
      </Field>
      <Slider label="Share of the budget" defaultValue={40} />
      <div>
        <Label htmlFor="plain-code" required>
          Project code
        </Label>
        <Input id="plain-code" required />
      </div>
    </div>
  );
}
