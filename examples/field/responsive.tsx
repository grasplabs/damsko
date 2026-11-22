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
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@grasp-os/ui/components/select";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 720 },
  control: { width: "100%" },
});

const zones = [
  { value: "utc", label: "UTC" },
  { value: "ams", label: "Amsterdam (UTC+1)" },
];

// A settings card: each setting a responsive Field, its name and a line of help at the start and
// its control on the end edge every row of the group shares. A value that cannot be changed here
// is a read-only field.
export default function FieldResponsive() {
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
                  <FieldLabel>Time zone</FieldLabel>
                  <FieldDescription>
                    For schedules and the times shown.
                  </FieldDescription>
                </FieldContent>
                <Select items={zones} defaultValue="utc">
                  <SelectTrigger size="sm" style={layout.control}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent />
                </Select>
              </Field>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel>Sign-in domains</FieldLabel>
                  <FieldDescription>
                    People sign in with an address in these.
                  </FieldDescription>
                </FieldContent>
                <Input
                  size="sm"
                  readOnly
                  defaultValue="example.com"
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
