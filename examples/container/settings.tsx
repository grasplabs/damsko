import { Button } from "@grasp-os/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@grasp-os/ui/components/card";
import { Container } from "@grasp-os/ui/components/container";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@grasp-os/ui/components/field";
import { PageHeader } from "@grasp-os/ui/components/page-header";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@grasp-os/ui/components/select";
import { Switch } from "@grasp-os/ui/components/switch";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import DataTableMembers from "../data-table/members";

const layout = stylex.create({
  control: { width: "100%" },
});

const zones = [
  { value: "utc", label: "UTC" },
  { value: "ams", label: "Amsterdam (UTC+1)" },
];

// A settings page as the product builds it: the serif page title, a card per topic in a column about
// 720px wide in the page's middle, and the members table under them in the same column, its edges on
// the cards' edges.
export default function ContainerSettings() {
  const [summary, setSummary] = useState(true);
  return (
    <Container>
      <PageHeader size="sm" title="Workspace" />
      <Card asChild size="sm">
        <section>
          <CardHeader>
            <CardTitle level={2}>General</CardTitle>
          </CardHeader>
          <CardContent flush>
            <FieldGroup>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel>Time zone</FieldLabel>
                  <FieldDescription>
                    For schedules and the times Grasp shows.
                  </FieldDescription>
                </FieldContent>
                <Select items={zones} defaultValue="ams">
                  <SelectTrigger size="sm" style={layout.control}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent />
                </Select>
              </Field>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel>Weekly summary</FieldLabel>
                  <FieldDescription>
                    An email every Monday with what changed.
                  </FieldDescription>
                </FieldContent>
                <Switch checked={summary} onCheckedChange={setSummary} />
              </Field>
            </FieldGroup>
          </CardContent>
        </section>
      </Card>
      <Card asChild size="sm">
        <section>
          <CardHeader>
            <CardTitle level={2}>Danger zone</CardTitle>
          </CardHeader>
          <CardContent flush>
            <FieldGroup>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldTitle>Leave the workspace</FieldTitle>
                  <FieldDescription>
                    You lose access at once; an owner can invite you again.
                  </FieldDescription>
                </FieldContent>
                <Button size="sm" variant="secondary">
                  Leave
                </Button>
              </Field>
            </FieldGroup>
          </CardContent>
        </section>
      </Card>
      <DataTableMembers />
    </Container>
  );
}
