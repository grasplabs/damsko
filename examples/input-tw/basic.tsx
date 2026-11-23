import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components-tw/field";
import { Input } from "@grasp-os/ui/components-tw/input";

export default function InputBasic() {
  return (
    <div className="grid w-full max-w-[384px] gap-5">
      <Field name="name">
        <FieldLabel>Full name</FieldLabel>
        <Input autoComplete="name" placeholder="Anna de Vries" />
      </Field>
      <Field name="email">
        <FieldLabel>Work email</FieldLabel>
        <Input
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
        />
      </Field>
      <Field name="project">
        <FieldLabel>Project name</FieldLabel>
        <Input required placeholder="Quarterly review" />
        <FieldDescription>Everyone in the workspace sees it.</FieldDescription>
      </Field>
    </div>
  );
}
