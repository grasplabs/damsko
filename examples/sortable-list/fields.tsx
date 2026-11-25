"use client";

import { Input } from "@grasp-os/ui/components/input";
import {
  SortableList,
  SortableListHandle,
  SortableListItem,
} from "@grasp-os/ui/components/sortable-list";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

interface Option {
  id: string;
  value: string;
}

const layout = stylex.create({
  list: { width: "100%", maxWidth: 384 },
  input: { flexGrow: 1 },
});

// A choice's options, each a field of its own: typing a space in a field types a space, and the
// handle beside it moves it.
export default function SortableListFields() {
  const [options, setOptions] = useState<Option[]>([
    { id: "a", value: "To do" },
    { id: "b", value: "Doing" },
    { id: "c", value: "Done" },
  ]);
  return (
    <SortableList
      aria-label="Options"
      value={options.map((option) => option.id)}
      onValueChange={(order) => {
        setOptions(
          order.flatMap((id) => options.filter((option) => option.id === id))
        );
      }}
      style={layout.list}
    >
      {options.map((option, index) => (
        <SortableListItem
          key={option.id}
          value={option.id}
          textValue={option.value}
        >
          <SortableListHandle aria-label={`Move ${option.value}`} />
          <Input
            aria-label={`Option ${index + 1}`}
            value={option.value}
            onValueChange={(value) => {
              setOptions(
                options.map((each) =>
                  each.id === option.id ? { ...each, value } : each
                )
              );
            }}
            style={layout.input}
          />
        </SortableListItem>
      ))}
    </SortableList>
  );
}
