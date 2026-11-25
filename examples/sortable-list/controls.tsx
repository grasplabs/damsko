"use client";

import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import {
  SortableList,
  SortableListHandle,
  SortableListItem,
} from "@grasp-os/ui/components/sortable-list";
import { Switch } from "@grasp-os/ui/components/switch";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

interface Step {
  id: string;
  name: string;
  on: boolean;
}

const layout = stylex.create({
  list: { width: "100%", maxWidth: 384 },
  field: { flexGrow: 1 },
});

// Each item holds its own control: the switch keeps its keys and presses, and only the handle
// moves the item.
export default function SortableListControls() {
  const [steps, setSteps] = useState<Step[]>([
    { id: "welcome", name: "Welcome", on: true },
    { id: "ai", name: "Its AI", on: true },
    { id: "people", name: "Its people", on: false },
    { id: "review", name: "Review", on: true },
  ]);
  return (
    <SortableList
      aria-label="Steps, in order"
      value={steps.map((step) => step.id)}
      onValueChange={(order) => {
        setSteps(order.flatMap((id) => steps.filter((step) => step.id === id)));
      }}
      style={layout.list}
    >
      {steps.map((step) => (
        <SortableListItem key={step.id} value={step.id} textValue={step.name}>
          <SortableListHandle aria-label={`Move ${step.name}`} />
          <Field orientation="horizontal" style={layout.field}>
            <FieldLabel>{step.name}</FieldLabel>
            <Switch
              checked={step.on}
              onCheckedChange={(on) => {
                setSteps(
                  steps.map((each) =>
                    each.id === step.id ? { ...each, on } : each
                  )
                );
              }}
            />
          </Field>
        </SortableListItem>
      ))}
    </SortableList>
  );
}
