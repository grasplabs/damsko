import { Card, CardContent } from "@grasp-os/ui/components/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import { PageHeader } from "@grasp-os/ui/components/page-header";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    width: "100%",
    maxWidth: 720,
  },
  control: { width: "100%" },
});

// One card on a page whose title already names it: no header row, named by aria-label for a
// screen reader, its rows flush to the card's top.
export default function CardNoTitle() {
  return (
    <div {...stylex.props(layout.page)}>
      <PageHeader size="sm" title="Profile" />
      <Card asChild size="sm" aria-label="Profile">
        <section>
          <CardContent flush>
            <FieldGroup>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel>Name</FieldLabel>
                  <FieldDescription>As your team sees it.</FieldDescription>
                </FieldContent>
                <Input
                  size="sm"
                  defaultValue="Sanne de Wit"
                  style={layout.control}
                />
              </Field>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel>Email</FieldLabel>
                  <FieldDescription>
                    Your sign-in; your admin changes it.
                  </FieldDescription>
                </FieldContent>
                <Input
                  size="sm"
                  readOnly
                  defaultValue="sanne@contoso.example"
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
