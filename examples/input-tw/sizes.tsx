import { Field, FieldLabel } from "@grasp-os/ui/components-tw/field";
import { Input } from "@grasp-os/ui/components-tw/input";

// Small in a dense table or toolbar, default everywhere else, large for the one field that matters
// on a touch screen. The same heights as Button and Select.
export default function InputSizes() {
  return (
    <div className="grid w-full max-w-[384px] gap-5">
      <Field>
        <FieldLabel>Filter rows</FieldLabel>
        <Input size="sm" placeholder="Name or owner" />
      </Field>
      <Field>
        <FieldLabel>Project name</FieldLabel>
        <Input placeholder="Quarterly review" />
      </Field>
      <Field>
        <FieldLabel>Work email</FieldLabel>
        <Input size="lg" type="email" placeholder="name@example.com" />
      </Field>
    </div>
  );
}
