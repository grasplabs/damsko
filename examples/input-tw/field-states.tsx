import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@grasp-os/ui/components-tw/field";
import { Input } from "@grasp-os/ui/components-tw/input";

export default function InputFieldStates() {
  return (
    <div className="grid w-full max-w-[384px] gap-5">
      <Field>
        <FieldLabel>Project name</FieldLabel>
        <Input defaultValue="Quarterly review" />
      </Field>
      <Field disabled>
        <FieldLabel>Workspace</FieldLabel>
        <Input defaultValue="Northwind" />
        <FieldDescription>
          Only an owner can rename the workspace.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Project ID</FieldLabel>
        <Input defaultValue="prj_4f81c2" readOnly />
      </Field>
      <Field data-invalid>
        <FieldLabel>Work email</FieldLabel>
        <Input type="email" defaultValue="anna@example.com" />
        <FieldError match>
          Use your work address, not a personal one.
        </FieldError>
      </Field>
    </div>
  );
}
