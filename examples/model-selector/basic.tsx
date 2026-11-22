"use client";

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
import { useState } from "react";

import { makers, models } from "./models";

// The models by maker, each with its maker's logo. Typing narrows the list; the arrows and Enter
// pick, and the trigger then says the model picked.
export default function ModelSelectorBasic() {
  const [value, setValue] = useState("sonnet");
  const current = models.find((model) => model.id === value);
  const logo = makers.find((maker) => maker.id === current?.maker)?.logo;
  return (
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
                .filter((model) => model.maker === maker.id)
                .map((model) => (
                  <ModelSelectorItem
                    key={model.id}
                    value={model.id}
                    keywords={[maker.name]}
                    description={model.unavailable ?? model.description}
                    disabled={model.unavailable !== undefined}
                  >
                    <ModelSelectorLogo logo={maker.logo} />
                    <ModelSelectorName>{model.name}</ModelSelectorName>
                  </ModelSelectorItem>
                ))}
            </ModelSelectorGroup>
          ))}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  );
}
