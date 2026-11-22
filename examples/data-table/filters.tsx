"use client";

import { DataTableFilters } from "@grasp-os/ui/components/data-table";
import type {
  DataTableFilterCondition,
  DataTableFilterField,
} from "@grasp-os/ui/components/data-table";
import {
  ChartLineIcon,
  CircleUserIcon,
  TypeIcon,
} from "@grasp-os/ui/lib/icons";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const people = [
  { id: "anna", label: "Anna de Vries", icon: CircleUserIcon },
  { id: "omer", label: "Ömer Yıldız", icon: CircleUserIcon },
  { id: "sanne", label: "Sanne Bakker", icon: CircleUserIcon },
];

const fields: DataTableFilterField[] = [
  {
    id: "owner",
    label: "Owner",
    icon: CircleUserIcon,
    operators: [
      { id: "is", label: "is" },
      { id: "is-not", label: "is not" },
    ],
    defaultOperatorId: "is",
    value: { type: "select", options: people, compatibilityKey: "person" },
  },
  {
    id: "reviewer",
    label: "Reviewer",
    icon: CircleUserIcon,
    operators: [{ id: "is", label: "is" }],
    defaultOperatorId: "is",
    value: { type: "select", options: people, compatibilityKey: "person" },
  },
  {
    id: "views",
    label: "Views",
    icon: ChartLineIcon,
    operators: [
      { id: "greater-than", label: "is greater than" },
      { id: "less-than", label: "is less than" },
    ],
    defaultOperatorId: "greater-than",
    value: { type: "number", min: 0, step: 1 },
  },
  {
    id: "title",
    label: "Title",
    icon: TypeIcon,
    operators: [
      { id: "contains", label: "contains" },
      { id: "is", label: "is" },
    ],
    defaultOperatorId: "contains",
    value: { type: "text" },
  },
];

const layout = stylex.create({
  stack: {
    display: "grid",
    gap: space[4],
    justifyItems: "center",
    width: "100%",
    minWidth: 0,
  },
  state: {
    display: "block",
    maxWidth: "100%",
    margin: 0,
    overflowX: "auto",
    fontFamily: font.mono,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
    whiteSpace: "pre",
  },
});

// The filter alone, as a Data table with `filterable` draws it: choose a field, then an operator, then a value: Views and Title take a typed value.
export default function DataTableFiltersExample() {
  const [condition, setCondition] = useState<DataTableFilterCondition>({
    fieldId: "owner",
    operatorId: "is",
    value: "anna",
  });
  return (
    <div {...stylex.props(layout.stack)}>
      <DataTableFilters
        fields={fields}
        condition={condition}
        onConditionChange={setCondition}
      />
      <output aria-live="polite" {...stylex.props(layout.state)}>
        {JSON.stringify(condition, null, 2)}
      </output>
    </div>
  );
}
