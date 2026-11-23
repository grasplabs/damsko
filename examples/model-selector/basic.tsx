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
  ModelSelectorMaker,
  ModelSelectorMakers,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@grasp-os/ui/components/model-selector";
import { useState } from "react";

import { logoOf, makers, modelOf, models } from "./models";

// The makers down the side, the chosen maker's models beside them. Typing searches every maker;
// picking a model closes the panel, and the chip then names it.
export default function ModelSelectorBasic() {
  const [value, setValue] = useState("sonnet");
  const current = modelOf(value);
  const logo = current === undefined ? undefined : logoOf(current.maker);
  return (
    <ModelSelector value={value} onValueChange={setValue}>
      <ModelSelectorTrigger>
        {logo === undefined ? null : <ModelSelectorLogo logo={logo} />}
        <ModelSelectorName>{current?.name}</ModelSelectorName>
      </ModelSelectorTrigger>
      <ModelSelectorContent>
        <ModelSelectorInput />
        <ModelSelectorMakers>
          {makers.map((maker) => (
            <ModelSelectorMaker
              key={maker.id}
              value={maker.id}
              aria-label={maker.name}
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
      </ModelSelectorContent>
    </ModelSelector>
  );
}
