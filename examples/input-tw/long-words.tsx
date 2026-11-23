import { Button } from "@grasp-os/ui/components-tw/button";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@grasp-os/ui/components-tw/field";
import { Input } from "@grasp-os/ui/components-tw/input";
import { Badge } from "@grasp-os/ui/components/badge";
import { Card, CardDescription, CardTitle } from "@grasp-os/ui/components/card";

// How interface words break, in narrow columns: a long Dutch compound (lang="nl") breaks with a
// hyphen, in a Label and a Card; a short English word ("already") is never cut, in a FieldError; a
// Button's and a Badge's short words stay whole.
export default function InputLongWords() {
  return (
    <div className="flex flex-wrap items-start gap-4">
      <div lang="nl" data-case="label" className="w-[132px]">
        <Field>
          <FieldLabel>Aansprakelijkheidsverzekering</FieldLabel>
          <Input defaultValue="" />
        </Field>
      </div>
      <div data-case="error" className="w-[132px]">
        <Field data-invalid>
          <FieldLabel>Email</FieldLabel>
          <Input defaultValue="amara@contoso.example" />
          <FieldError match>This address is already invited.</FieldError>
        </Field>
      </div>
      <div lang="nl" data-case="card" className="w-[132px]">
        <Card>
          <CardTitle>Polis</CardTitle>
          <CardDescription>
            Aansprakelijkheidsverzekering voor bedrijven
          </CardDescription>
        </Card>
      </div>
      <div data-case="button" className="w-[132px]">
        <Button variant="outline">Already sent</Button>
      </div>
      <div data-case="badge" className="w-[132px]">
        <Badge variant="warning">Already waiting</Badge>
      </div>
    </div>
  );
}
