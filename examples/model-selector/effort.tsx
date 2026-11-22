"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@grasp-os/ui/components/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@grasp-os/ui/components/input-group";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@grasp-os/ui/components/model-selector";
import { ChevronDownIcon, Icon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { logoOf, makers, models } from "./models";

const efforts = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const layout = stylex.create({
  stack: { display: "grid", width: "100%", maxWidth: 520 },
});

// Two menus under a message field, as shadcn's pattern has them: the model, and how hard it thinks.
// The model is searched; the effort is a short menu of three.
export default function ModelSelectorEffort() {
  const [value, setValue] = useState("sonnet");
  const [effort, setEffort] = useState("medium");
  const current = models.find((model) => model.id === value);
  const logo = current === undefined ? undefined : logoOf(current.maker);
  const chosen = efforts.find((each) => each.value === effort)?.label ?? "";
  return (
    <div {...stylex.props(layout.stack)}>
      <InputGroup>
        <InputGroupTextarea
          aria-label="Message"
          placeholder="Ask about the quarterly report"
        />
        <InputGroupAddon align="block-end">
          <ModelSelector>
            <ModelSelectorTrigger>
              {logo === undefined ? null : <ModelSelectorLogo logo={logo} />}
              <ModelSelectorName>{current?.name}</ModelSelectorName>
            </ModelSelectorTrigger>
            <ModelSelectorContent>
              <ModelSelectorInput />
              <ModelSelectorEmpty />
              <ModelSelectorList value={value} onValueChange={setValue}>
                {makers.map((maker) => (
                  <ModelSelectorGroup key={maker.id} heading={maker.name}>
                    {models
                      .filter(
                        (model) =>
                          model.maker === maker.id &&
                          model.unavailable === undefined
                      )
                      .map((model) => (
                        <ModelSelectorItem key={model.id} value={model.id}>
                          <ModelSelectorLogo logo={maker.logo} />
                          <ModelSelectorName>{model.name}</ModelSelectorName>
                        </ModelSelectorItem>
                      ))}
                  </ModelSelectorGroup>
                ))}
              </ModelSelectorList>
            </ModelSelectorContent>
          </ModelSelector>
          <DropdownMenu>
            <DropdownMenuTrigger asChild aria-label={`Effort: ${chosen}`}>
              <InputGroupButton size="sm">
                {chosen}
                <Icon icon={ChevronDownIcon} />
              </InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup
                value={effort}
                onValueChange={(next: string | null) => {
                  if (next !== null) {
                    setEffort(next);
                  }
                }}
              >
                <DropdownMenuLabel>Effort</DropdownMenuLabel>
                {efforts.map((each) => (
                  <DropdownMenuRadioItem
                    key={each.value}
                    value={each.value}
                    closeOnSelect
                  >
                    {each.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
