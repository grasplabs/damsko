import { Badge } from "@grasp-os/ui/components/badge";
import { Button } from "@grasp-os/ui/components/button";
import { Card, CardContent } from "@grasp-os/ui/components/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import { SectionHeader } from "@grasp-os/ui/components/section-header";
import { Text } from "@grasp-os/ui/components/text";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  // Groups stand a section's gap apart, the title a small step over its card: four groups, not
  // eight things.
  stack: {
    display: "grid",
    gap: space.sectionHeaderGap,
    width: "100%",
    maxWidth: 720,
  },
  // The title over its card, on the page's ground, a small step above it.
  group: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    rowGap: space[2],
    minWidth: 0,
  },
  // Its words start where the rows' do.
  head: { paddingInline: space.tableCellInline },
  control: { width: "100%" },
});

// A billing page's groups: each title on the page above its card of rows, its words where the
// rows' start. A composition, not a part: a section named by its SectionHeader, then the Card.
export default function CardGrouped() {
  return (
    <div {...stylex.props(layout.stack)}>
      <section aria-labelledby="plan" {...stylex.props(layout.group)}>
        <div {...stylex.props(layout.head)}>
          <SectionHeader
            id="plan"
            title="Plan"
            variant="group"
            actions={
              <Button size="xs" variant="secondary">
                Change plan
              </Button>
            }
          />
        </div>
        <Card size="sm">
          <CardContent flush>
            <FieldGroup>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldTitle>Plan</FieldTitle>
                  <FieldDescription>
                    Billed yearly, renews on 1 March.
                  </FieldDescription>
                </FieldContent>
                <Badge variant="info">Business</Badge>
              </Field>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldTitle>Seats</FieldTitle>
                </FieldContent>
                <Text size="sm">12 of 15 in use</Text>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </section>
      <section aria-labelledby="billing-emails" {...stylex.props(layout.group)}>
        <div {...stylex.props(layout.head)}>
          <SectionHeader
            id="billing-emails"
            title="Billing emails"
            description="Invoices and receipts go to these addresses."
            variant="group"
          />
        </div>
        <Card size="sm">
          <CardContent flush>
            <FieldGroup>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel>Invoices</FieldLabel>
                  <FieldDescription>
                    A PDF on the first of each month.
                  </FieldDescription>
                </FieldContent>
                <Input
                  size="sm"
                  defaultValue="finance@contoso.example"
                  style={layout.control}
                />
              </Field>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel>Receipts</FieldLabel>
                </FieldContent>
                <Input
                  size="sm"
                  defaultValue="finance@contoso.example"
                  style={layout.control}
                />
              </Field>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel>Copy to</FieldLabel>
                </FieldContent>
                <Input
                  size="sm"
                  placeholder="name@example.com"
                  style={layout.control}
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
