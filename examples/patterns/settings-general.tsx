"use client";

import { Alert, AlertDescription } from "@grasp-os/ui/components/alert";
import { Card, CardContent } from "@grasp-os/ui/components/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldStatus,
} from "@grasp-os/ui/components/field";
import type { FieldStatusValue } from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import { PageHeader } from "@grasp-os/ui/components/page-header";
import { SectionHeader } from "@grasp-os/ui/components/section-header";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@grasp-os/ui/components/select";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import type { ReactNode } from "react";

const layout = stylex.create({
  page: {
    display: "grid",
    gap: space.sectionHeaderGap,
    width: "100%",
    maxWidth: 720,
  },
  // A group's title stands a small step over its card, its words where the rows' start.
  group: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    rowGap: space["2"],
    minWidth: 0,
  },
  head: { paddingInline: space.tableCellInline },
  note: { margin: space.tableCellInline },
  control: { width: "100%" },
});

interface SettingsGroupProps {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}

// A topic: its title on the page, a small step over the card of its rows.
const SettingsGroup = ({
  id,
  title,
  description,
  children,
}: SettingsGroupProps) => (
  <section aria-labelledby={id} {...stylex.props(layout.group)}>
    <div {...stylex.props(layout.head)}>
      <SectionHeader
        id={id}
        title={title}
        description={description}
        variant="group"
      />
    </div>
    <Card size="sm">
      <CardContent flush>{children}</CardContent>
    </Card>
  </section>
);

const zones = [
  { value: "utc", label: "UTC" },
  { value: "ams", label: "Amsterdam (UTC+1)" },
];
const weeks = [
  { value: "mon", label: "Monday" },
  { value: "sun", label: "Sunday" },
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Settings > Workspace, a page of plain settings: what can change as settings, what cannot as a
// read-only field. A select saves as it changes; this time zone's save failed: the choice is kept,
// and Try again saves it.
export default function SettingsGeneral() {
  const [zone, setZone] = useState<FieldStatusValue>("error");
  const retry = async () => {
    setZone("loading");
    await wait(900);
    setZone("success");
  };
  return (
    <div {...stylex.props(layout.page)}>
      <PageHeader size="sm" title="Workspace" />
      <SettingsGroup id="workspace-organization" title="Organization">
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
            <Select items={zones} defaultValue="ams">
              <SelectTrigger size="sm" style={layout.control}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent />
            </Select>
            <FieldStatus status={zone} onRetry={() => void retry()} />
          </Field>
          <Field orientation="responsive">
            <FieldContent>
              <FieldLabel>Data location</FieldLabel>
              <FieldDescription>Where your data is kept.</FieldDescription>
            </FieldContent>
            <Input
              size="sm"
              readOnly
              defaultValue="European Union"
              style={layout.control}
            />
          </Field>
        </FieldGroup>
      </SettingsGroup>
      <SettingsGroup id="workspace-region" title="Language and region">
        <FieldGroup>
          <Field orientation="responsive">
            <FieldContent>
              <FieldLabel>Week starts on</FieldLabel>
            </FieldContent>
            <Select items={weeks} defaultValue="mon">
              <SelectTrigger size="sm" style={layout.control}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent />
            </Select>
          </Field>
        </FieldGroup>
        <Alert appearance="subtle" style={layout.note}>
          <AlertDescription>
            Dates in reports follow each reader's own language.
          </AlertDescription>
        </Alert>
      </SettingsGroup>
      <SettingsGroup
        id="workspace-access"
        title="Support access"
        description="Support staff can open this workspace only while access is on."
      >
        <FieldGroup>
          <Field orientation="responsive">
            <FieldContent>
              <FieldLabel>Access</FieldLabel>
              <FieldDescription>
                Turned on by an admin, for one request.
              </FieldDescription>
            </FieldContent>
            <Input
              size="sm"
              readOnly
              defaultValue="Off"
              style={layout.control}
            />
          </Field>
        </FieldGroup>
      </SettingsGroup>
    </div>
  );
}
