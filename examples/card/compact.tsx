import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@grasp-os/ui/components/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import { Text } from "@grasp-os/ui/components/text";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 16, width: "100%", maxWidth: 720 },
  control: { width: "100%" },
});

// `size="sm"`, a settings page's cards: the head at text-sm with 12px above and below, so a card
// with a sentence and one without leave the same room above their first row.
export default function CardCompact() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Card asChild size="sm">
        <section>
          <CardHeader>
            <CardTitle level={2}>Organization</CardTitle>
          </CardHeader>
          <CardContent flush>
            <FieldGroup>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel>Name</FieldLabel>
                  <FieldDescription>
                    Your company's name in Grasp.
                  </FieldDescription>
                </FieldContent>
                <Input
                  size="sm"
                  defaultValue="Contoso Finance"
                  style={layout.control}
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </section>
      </Card>
      <Card asChild size="sm">
        <section>
          <CardHeader>
            <CardTitle level={2}>Sign-in</CardTitle>
            <CardDescription>
              Grasp sets this up; ask Grasp to change it.
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <FieldGroup>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldTitle>Microsoft 365</FieldTitle>
                  <FieldDescription>
                    Only accounts of your tenant.
                  </FieldDescription>
                </FieldContent>
                <Text size="sm">On the sign-in page</Text>
              </Field>
            </FieldGroup>
          </CardContent>
        </section>
      </Card>
    </div>
  );
}
