"use client";

import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEffort,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorMaker,
  ModelSelectorMakers,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@grasp-os/ui/components/model-selector";
import { useState } from "react";

import { effortFor, logoOf, makers, modelOf, models } from "./models";

// With effort: the chip shows the maker's logo and the level in a word, the model in its tooltip.
// Picking a model keeps the panel open, so its level is set in the same opening; a model with one
// level has no row.
export default function ModelSelectorWithEffort() {
  const [value, setValue] = useState("opus");
  const [effort, setEffort] = useState("medium");
  const current = modelOf(value);
  const logo = current === undefined ? undefined : logoOf(current.maker);
  const levels = current?.levels ?? [];
  const level = levels.find((each) => each.value === effort)?.label;
  const name = current?.name ?? "";
  return (
    <ModelSelector
      value={value}
      onValueChange={(next) => {
        setValue(next);
        setEffort(effortFor(next, effort));
      }}
      effort={effort}
      onEffortChange={setEffort}
    >
      <ModelSelectorTrigger
        tooltip={level === undefined ? undefined : `${name}, ${level}`}
      >
        {logo === undefined ? null : <ModelSelectorLogo logo={logo} />}
        <ModelSelectorName>{level ?? name}</ModelSelectorName>
      </ModelSelectorTrigger>
      <ModelSelectorContent>
        <ModelSelectorInput />
        <ModelSelectorMakers>
          {makers.map((maker) => (
            <ModelSelectorMaker
              key={maker.id}
              value={maker.id}
              label={maker.name}
              logo={maker.logo}
            />
          ))}
        </ModelSelectorMakers>
        <ModelSelectorList>
          <ModelSelectorEmpty />
          {makers.map((maker) => (
            <ModelSelectorGroup
              key={maker.id}
              value={maker.id}
              heading={maker.name}
            >
              {models
                .filter((model) => model.maker === maker.id)
                .map((model) => (
                  <ModelSelectorItem
                    key={model.id}
                    value={model.id}
                    keywords={[maker.name]}
                    description={model.description}
                    disabled={model.unavailable}
                  >
                    <ModelSelectorLogo logo={maker.logo} />
                    <ModelSelectorName>{model.name}</ModelSelectorName>
                  </ModelSelectorItem>
                ))}
            </ModelSelectorGroup>
          ))}
        </ModelSelectorList>
        <ModelSelectorEffort levels={levels} />
      </ModelSelectorContent>
    </ModelSelector>
  );
}
