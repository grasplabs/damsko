import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@grasp-os/ui/components/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 360 },
  control: { width: "100%" },
});

// In a narrow card (its own width, not the window's) each control goes under its words, the row's
// full width.
export default function FieldNarrow() {
  return (
    <div {...stylex.props(layout.box)}>
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
                  style={layout.control}
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
                  style={layout.control}
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </section>
      </Card>
    </div>
  );
}
