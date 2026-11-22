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
  FieldLegend,
  FieldSet,
} from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import { Switch } from "@grasp-os/ui/components/switch";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 720 },
  control: { width: "100%" },
});

// Two named sets in one card: the second stands under a hairline, so its name belongs to the rows
// under it; the first, at the card's top, has none. Its switches stand at their own width
// (`controls="fit"`).
export default function FieldSets() {
  return (
    <div {...stylex.props(layout.box)}>
      <Card asChild size="sm">
        <section>
          <CardHeader>
            <CardTitle level={2}>Workspace</CardTitle>
          </CardHeader>
          <CardContent flush>
            <FieldSet>
              <FieldLegend variant="label">Organization</FieldLegend>
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
              </FieldGroup>
            </FieldSet>
            <FieldSet>
              <FieldLegend variant="label">Notifications</FieldLegend>
              <FieldGroup controls="fit">
                <Field orientation="responsive">
                  <FieldContent>
                    <FieldLabel>Weekly summary</FieldLabel>
                    <FieldDescription>
                      An email every Monday with what changed.
                    </FieldDescription>
                  </FieldContent>
                  <Switch defaultChecked />
                </Field>
                <Field orientation="responsive">
                  <FieldContent>
                    <FieldLabel>Mentions</FieldLabel>
                    <FieldDescription>
                      An email when someone mentions you.
                    </FieldDescription>
                  </FieldContent>
                  <Switch />
                </Field>
              </FieldGroup>
            </FieldSet>
          </CardContent>
        </section>
      </Card>
    </div>
  );
}
