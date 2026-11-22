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
import { media, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import {
  effortFor,
  logoOf,
  makers,
  modelOf,
  models,
} from "../model-selector/models";

const styles = stylex.create({
  // The model, dictation and Submit stand together at the row's end, a step apart.
  end: { gridArea: "end", marginInlineStart: "auto" },
  apart: { marginInlineStart: space["1"] },
  chip: {},
  // On a phone the chip is the maker's mark alone: its tooltip and its name say the rest.
  level: { display: { default: null, [media.maxSm]: "none" } },
});

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
  const said = level === undefined ? name : `${name}, ${level}`;
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
        <PromptInputTools style={styles.end}>
          <ModelSelector
            value={model}
            onValueChange={(next) => {
              setModel(next);
              setEffort(effortFor(next, effort));
            }}
            effort={effort}
            onEffortChange={setEffort}
          >
            <ModelSelectorTrigger tooltip={said} style={styles.chip}>
              {logo === undefined ? null : <ModelSelectorLogo logo={logo} />}
              <ModelSelectorName style={styles.level}>
                {level ?? name}
              </ModelSelectorName>
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
          <PromptInputSpeechButton style={styles.apart} />
          <PromptInputSubmit style={styles.apart} />
        </PromptInputTools>
      </PromptInputFooter>
    </PromptInput>
  );
}
