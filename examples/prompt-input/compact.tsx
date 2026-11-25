"use client";

import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEffort,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@grasp-os/ui/components/model-selector";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@grasp-os/ui/components/prompt-input";
import { useState } from "react";

import {
  effortFor,
  logoOf,
  makers,
  modelOf,
  models,
} from "../model-selector/models";

// One row: the plus, the text, and at its end the model, dictation and Submit. Once the words no
// longer fit their line the text takes the card's whole width and the tools go under it.
export default function PromptInputCompact() {
  const [model, setModel] = useState("opus");
  const [effort, setEffort] = useState("medium");
  const current = modelOf(model);
  const logo = current === undefined ? undefined : logoOf(current.maker);
  const levels = current?.levels ?? [];
  const level = levels.find((each) => each.value === effort)?.label;
  const name = current?.name ?? "";
  return (
    <PromptInput compact onSubmit={() => undefined}>
      <PromptInputBody>
        <PromptInputTextarea aria-label="Message" placeholder="Ask anything" />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>
          <PromptInputActionMenu>
            <PromptInputActionMenuTrigger />
            <PromptInputActionMenuContent>
              <PromptInputActionAddAttachments />
            </PromptInputActionMenuContent>
          </PromptInputActionMenu>
        </PromptInputTools>
        <PromptInputTools align="end">
          <ModelSelector
            value={model}
            onValueChange={(next) => {
              setModel(next);
              setEffort(effortFor(next, effort));
            }}
            effort={effort}
            onEffortChange={setEffort}
          >
            {/* The level alone, the model in its tooltip: short of room, the row folds the level
                to the maker's mark. A model with no levels says its name, which never folds. */}
            <ModelSelectorTrigger
              tooltip={level === undefined ? undefined : `${name}, ${level}`}
            >
              {logo === undefined ? null : <ModelSelectorLogo logo={logo} />}
              <ModelSelectorName>{level ?? name}</ModelSelectorName>
            </ModelSelectorTrigger>
            <ModelSelectorContent side="top" align="end">
              <ModelSelectorList>
                {makers.flatMap((maker) =>
                  models
                    .filter((each) => each.maker === maker.id)
                    .map((each) => (
                      <ModelSelectorItem
                        key={each.id}
                        value={each.id}
                        description={each.description}
                        disabled={each.unavailable}
                      >
                        <ModelSelectorLogo logo={maker.logo} />
                        <ModelSelectorName>{each.name}</ModelSelectorName>
                      </ModelSelectorItem>
                    ))
                )}
              </ModelSelectorList>
              <ModelSelectorEffort levels={levels} />
            </ModelSelectorContent>
          </ModelSelector>
          <PromptInputSpeechButton />
          <PromptInputSubmit />
        </PromptInputTools>
      </PromptInputFooter>
    </PromptInput>
  );
}
