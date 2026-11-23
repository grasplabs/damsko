import { Field, FieldLabel } from "@grasp-os/ui/components-tw/field";
import { Input, PasswordInput } from "@grasp-os/ui/components-tw/input";
import { SearchIcon } from "@grasp-os/ui/lib-tw/icons";

// An icon at the start when it says what goes in faster: search. A password shows and hides itself.
export default function InputIcons() {
  return (
    <div className="grid w-full max-w-[384px] gap-5">
      <Input
        type="search"
        icon={SearchIcon}
        aria-label="Search projects"
        placeholder="Search projects"
      />
      <Field name="password">
        <FieldLabel>Password</FieldLabel>
        <PasswordInput placeholder="At least 12 characters" />
      </Field>
    </div>
  );
}
