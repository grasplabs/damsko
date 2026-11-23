import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@grasp-os/ui/components-tw/field";
import { Input } from "@grasp-os/ui/components-tw/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@grasp-os/ui/components/card";

// In a narrow card (its own width, not the window's) each control goes under its words, the row's
// full width.
export default function FieldNarrow() {
  return (
    <div className="w-full max-w-[360px]">
      <Card asChild>
        <section>
          <CardHeader>
            <CardTitle level={2}>Organization</CardTitle>
          </CardHeader>
          <CardContent flush>
            <FieldGroup>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel>Name</FieldLabel>
                  <FieldDescription>Your company's name.</FieldDescription>
                </FieldContent>
                <Input
                  size="sm"
                  defaultValue="Contoso Finance"
                  className="w-full"
                />
              </Field>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel>Billing email</FieldLabel>
                </FieldContent>
                <Input
                  size="sm"
                  type="email"
                  defaultValue="billing@contoso.example"
                  className="w-full"
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </section>
      </Card>
    </div>
  );
}
