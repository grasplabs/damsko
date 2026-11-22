"use client";

import { Button } from "@grasp-os/ui/components/button";
import { Card, CardContent } from "@grasp-os/ui/components/card";
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
import { SectionHeader } from "@grasp-os/ui/components/section-header";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@grasp-os/ui/components/select";
import { Switch } from "@grasp-os/ui/components/switch";
import { Icon, PencilIcon } from "@grasp-os/ui/lib/icons";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import type { ReactNode } from "react";

const layout = stylex.create({
  // A group's title stands a small step over its card, its words where the rows' start.
  group: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    rowGap: space["2"],
    minWidth: 0,
  },
  head: { paddingInline: space.tableCellInline },
});

interface SettingsGroupProps {
  id: string;
  title: string;
  children: ReactNode;
}

// A topic: its title on the page, a small step over the card of its rows.
const SettingsGroup = ({ id, title, children }: SettingsGroupProps) => (
  <section aria-labelledby={id} {...stylex.props(layout.group)}>
    <div {...stylex.props(layout.head)}>
      <SectionHeader id={id} title={title} variant="group" />
    </div>
    <Card size="sm">
      <CardContent flush>
        <FieldGroup controls="fit">{children}</FieldGroup>
      </CardContent>
    </Card>
  </section>
);

const sidebars = [
  { value: "expanded", label: "Expanded" },
  { value: "compact", label: "Compact" },
];
const enters = [
  { value: "send", label: "Send" },
  { value: "newline", label: "New line" },
];

// Settings > General: the page's title, then a short heading over each group of rows, in a centred
// column 640px wide. Every row is a name and one line of help, and one control on the shared edge:
// a select, a switch, an icon or a quiet text action.
export default function SettingsPage() {
  const [pinnedTop, setPinnedTop] = useState(false);
  const [scrollTop, setScrollTop] = useState(true);
  const [sounds, setSounds] = useState(false);
  return (
    <Container size="sm" align="center">
      <PageHeader size="sm" title="General" />
      <SettingsGroup id="settings-interface" title="Interface">
        <Field orientation="responsive">
          <FieldContent>
            <FieldTitle>Sidebar pages</FieldTitle>
            <FieldDescription>
              Choose which pages show in the sidebar.
            </FieldDescription>
          </FieldContent>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Edit sidebar pages"
          >
            <Icon icon={PencilIcon} />
          </Button>
        </Field>
        <Field orientation="responsive">
          <FieldContent>
            <FieldLabel>Sidebar layout</FieldLabel>
            <FieldDescription>
              Expanded shows every section, Compact one at a time.
            </FieldDescription>
          </FieldContent>
          <Select items={sidebars} defaultValue="expanded">
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent />
          </Select>
        </Field>
        <Field orientation="responsive">
          <FieldContent>
            <FieldLabel>Pinned at top</FieldLabel>
            <FieldDescription>
              List pinned pages above the rest.
            </FieldDescription>
          </FieldContent>
          <Switch checked={pinnedTop} onCheckedChange={setPinnedTop} />
        </Field>
        <Field orientation="responsive">
          <FieldContent>
            <FieldLabel>Scroll new messages to top</FieldLabel>
            <FieldDescription>
              Keep your latest message at the top as the reply comes in.
            </FieldDescription>
          </FieldContent>
          <Switch checked={scrollTop} onCheckedChange={setScrollTop} />
        </Field>
      </SettingsGroup>
      <SettingsGroup id="settings-input" title="Input">
        <Field orientation="responsive">
          <FieldContent>
            <FieldLabel>Enter behaviour</FieldLabel>
            <FieldDescription>
              What pressing Enter does in a message.
            </FieldDescription>
          </FieldContent>
          <Select items={enters} defaultValue="send">
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent />
          </Select>
        </Field>
        <Field orientation="responsive">
          <FieldContent>
            <FieldLabel>Sounds</FieldLabel>
            <FieldDescription>
              A short sound when a task finishes.
            </FieldDescription>
          </FieldContent>
          <Switch checked={sounds} onCheckedChange={setSounds} />
        </Field>
        <Field orientation="responsive">
          <FieldContent>
            <FieldTitle>Microphone</FieldTitle>
            <FieldDescription>
              Allow microphone access to choose an input.
            </FieldDescription>
          </FieldContent>
          <Button size="sm" variant="ghost">
            Allow access
          </Button>
        </Field>
      </SettingsGroup>
    </Container>
  );
}
