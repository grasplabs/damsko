"use client";

import { Badge } from "@grasp-os/ui/components/badge";
import { Button } from "@grasp-os/ui/components/button";
import {
  Card,
  CardAction,
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@grasp-os/ui/components/input-group";
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

const languages = [
  { value: "en", label: "English" },
  { value: "nl", label: "Nederlands" },
];

// A profile's settings: every control at sm, 32px, the field with a Badge inside as tall as the
// others, and the section's Button beside its heading at the same size.
export default function ControlsSettingRow() {
  return (
    <div {...stylex.props(layout.box)}>
      <Card asChild>
        <section>
          <CardHeader>
            <CardTitle level={2}>Profile</CardTitle>
            <CardAction>
              <Button size="sm" variant="secondary">
                Change photo
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent flush>
            <FieldGroup>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel>Name</FieldLabel>
                  <FieldDescription>
                    How people see you in Grasp.
                  </FieldDescription>
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
                    Where Grasp sends what you follow.
                  </FieldDescription>
                </FieldContent>
                <InputGroup size="sm" style={layout.control}>
                  <InputGroupInput readOnly defaultValue="admin@example.com" />
                  <InputGroupAddon align="inline-end">
                    <Badge>Admin</Badge>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel>Language</FieldLabel>
                  <FieldDescription>
                    For every word Grasp shows you.
                  </FieldDescription>
                </FieldContent>
                <Select items={languages} defaultValue="en">
                  <SelectTrigger size="sm" style={layout.control}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent />
                </Select>
              </Field>
            </FieldGroup>
          </CardContent>
        </section>
      </Card>
    </div>
  );
}
