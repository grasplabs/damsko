import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { FormRow } from "@grasp-os/ui/components/form";
import { Input } from "@grasp-os/ui/components/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@grasp-os/ui/components/native-select";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@grasp-os/ui/components/select";

const regions = ["Europe", "Americas", "Asia"];

// One row of a form: a field, a select and a native select, cut, filled and edged alike, so a
// form can use whichever fits each choice.
export default function NativeSelectFields() {
  return (
    <FormRow>
      <Field>
        <FieldLabel>Workspace</FieldLabel>
        <Input defaultValue="Northwind" />
      </Field>
      <Field>
        <FieldLabel>Region</FieldLabel>
        <Select items={regions} defaultValue="Europe">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent />
        </Select>
      </Field>
      <Field>
        <FieldLabel>Data region</FieldLabel>
        <NativeSelect defaultValue="Europe">
          {regions.map((region) => (
            <NativeSelectOption key={region} value={region}>
              {region}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
    </FormRow>
  );
}
