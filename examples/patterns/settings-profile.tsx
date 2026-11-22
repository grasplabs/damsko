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

// Settings > Profile: a page with one topic is one card with no title of its own (the page's title
// names it), named by aria-label for a screen reader, its rows flush to the card's top.
export default function SettingsProfile() {
  return (
    <div {...stylex.props(layout.page)}>
      <PageHeader size="sm" title="Profile" />
      <Card size="sm" aria-label="Profile">
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
      </Card>
    </div>
  );
}
