"use client";

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
  FieldStatus,
} from "@grasp-os/ui/components/field";
import type { FieldStatusValue } from "@grasp-os/ui/components/field";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@grasp-os/ui/components/select";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 720 },
  control: { width: "100%" },
});

const models = [
  { value: "fast", label: "Fast" },
  { value: "careful", label: "Careful" },
];
const retention = [
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Settings that save when they change: a spinner, then a tick that leaves, beside the control. The
// second one failed: it keeps the choice and offers Try again, which saves it.
export default function FieldStatusExample() {
  const [model, setModel] = useState<FieldStatusValue>("idle");
  const [keep, setKeep] = useState<FieldStatusValue>("error");
  const save = async (set: (status: FieldStatusValue) => void) => {
    set("loading");
    await wait(900);
    set("success");
  };
  return (
    <div {...stylex.props(layout.box)}>
      <Card asChild>
        <section>
          <CardHeader>
            <CardTitle level={2}>Models</CardTitle>
          </CardHeader>
          <CardContent flush>
            <FieldGroup>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel>Default model</FieldLabel>
                  <FieldDescription>
                    What every assistant uses unless told otherwise.
                  </FieldDescription>
                </FieldContent>
                <Select
                  items={models}
                  defaultValue="fast"
                  onValueChange={() => void save(setModel)}
                >
                  <SelectTrigger size="sm" style={layout.control}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent />
                </Select>
                <FieldStatus status={model} />
              </Field>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel>Keep conversations</FieldLabel>
                  <FieldDescription>
                    Older ones are deleted for everyone.
                  </FieldDescription>
                </FieldContent>
                <Select items={retention} defaultValue="90">
                  <SelectTrigger size="sm" style={layout.control}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent />
                </Select>
                <FieldStatus status={keep} onRetry={() => void save(setKeep)} />
              </Field>
            </FieldGroup>
          </CardContent>
        </section>
      </Card>
    </div>
  );
}
