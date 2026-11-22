"use client";

import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorFavorite,
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

// With favourites: a star heads the makers and lists them; each row's star adds its model or takes
// it out without picking it.
export default function ModelSelectorFavorites() {
  const [value, setValue] = useState("opus");
  const [favorites, setFavorites] = useState(["opus", "gemini-pro"]);
  const current = modelOf(value);
  const logo = current === undefined ? undefined : logoOf(current.maker);
  return (
    <ModelSelector
      value={value}
      onValueChange={setValue}
      favorites={favorites}
      onFavoritesChange={setFavorites}
    >
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
                    <ModelSelectorFavorite />
                  </ModelSelectorItem>
                ))}
            </ModelSelectorGroup>
          ))}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  );
}
