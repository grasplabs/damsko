"use client";

import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@grasp-os/ui/components/model-selector";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@grasp-os/ui/components/toggle-group";
import { useState } from "react";

import { logoOf, models } from "./models";

const efforts = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

// The footer is the product's: here, how hard the model thinks, as a toggle group under the list.
// Picking a model closes the list; the effort stays as it was set.
export default function ModelSelectorFooter() {
  const [value, setValue] = useState("opus");
  const [effort, setEffort] = useState("medium");
  const current = models.find((model) => model.id === value);
  const logo = current === undefined ? undefined : logoOf(current.maker);
  const chosen = efforts.find((each) => each.value === effort)?.label;
  return (
    <ModelSelector>
      <ModelSelectorTrigger aria-label={`Model: ${current?.name}, ${chosen}`}>
        {logo === undefined ? null : <ModelSelectorLogo logo={logo} />}
        <ModelSelectorName>{current?.name}</ModelSelectorName>
      </ModelSelectorTrigger>
      <ModelSelectorContent
        footer={
          <ToggleGroup
            aria-label="Effort"
            value={[effort]}
            onValueChange={(next: string[]) => {
              const [first] = next;
              if (first !== undefined) {
                setEffort(first);
              }
            }}
          >
            {efforts.map((each) => (
              <ToggleGroupItem key={each.value} value={each.value}>
                {each.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        }
      >
        <ModelSelectorInput />
        <ModelSelectorEmpty />
        <ModelSelectorList value={value} onValueChange={setValue}>
          {models
            .filter((model) => model.unavailable === undefined)
            .map((model) => {
              const mark = logoOf(model.maker);
              return (
                <ModelSelectorItem key={model.id} value={model.id}>
                  {mark === undefined ? null : (
                    <ModelSelectorLogo logo={mark} />
                  )}
                  <ModelSelectorName>{model.name}</ModelSelectorName>
                </ModelSelectorItem>
              );
            })}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  );
}
