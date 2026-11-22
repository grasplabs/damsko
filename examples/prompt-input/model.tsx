"use client";

import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEffort,
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
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@grasp-os/ui/components/prompt-input";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import {
  effortFor,
  logoOf,
  makers,
  modelOf,
  models,
} from "../model-selector/models";
import { layout } from "./layout";

const styles = stylex.create({
  // The tools take the row beside Submit; Submit stays at the foot's end.
  tools: { flexGrow: 1, flexBasis: 0, minWidth: 0 },
  submit: { alignSelf: "end" },
});

// The model and how hard it thinks, as one chip among the tools: the Model selector, opening
// upwards. The prompt input holds neither choice; the page keeps them and sends them along.
export default function PromptInputModel() {
  const [model, setModel] = useState("opus");
  const [effort, setEffort] = useState("medium");
  const [favorites, setFavorites] = useState(["opus", "gemini-pro"]);
  const [sent, setSent] = useState("");
  const current = modelOf(model);
  const logo = current === undefined ? undefined : logoOf(current.maker);
  const levels = current?.levels ?? [];
  const level = levels.find((each) => each.value === effort)?.label;
  const name = current?.name ?? "";
  const said = level === undefined ? name : `${name}, ${level}`;
  return (
    <div {...stylex.props(layout.column)}>
      <PromptInput
        aria-label="Message the assistant"
        onSubmit={({ text }) => {
          setSent(`${said}: ${text}`);
        }}
      >
        <PromptInputHeader>
          <PromptInputAttachments />
        </PromptInputHeader>
        <PromptInputBody>
          <PromptInputTextarea
            aria-label="Message"
            placeholder="Ask the agent to change your code"
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools style={styles.tools}>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            <ModelSelector
              value={model}
              onValueChange={(next) => {
                setModel(next);
                setEffort(effortFor(next, effort));
              }}
              favorites={favorites}
              onFavoritesChange={setFavorites}
              effort={effort}
              onEffortChange={setEffort}
            >
              <ModelSelectorTrigger
                tooltip={level === undefined ? undefined : said}
              >
                {logo === undefined ? null : <ModelSelectorLogo logo={logo} />}
                <ModelSelectorName>{level ?? name}</ModelSelectorName>
              </ModelSelectorTrigger>
              <ModelSelectorContent side="top">
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
                        .filter((each) => each.maker === maker.id)
                        .map((each) => (
                          <ModelSelectorItem
                            key={each.id}
                            value={each.id}
                            keywords={[maker.name]}
                            description={each.description}
                            disabled={each.unavailable}
                          >
                            <ModelSelectorLogo logo={maker.logo} />
                            <ModelSelectorName>{each.name}</ModelSelectorName>
                            <ModelSelectorFavorite />
                          </ModelSelectorItem>
                        ))}
                    </ModelSelectorGroup>
                  ))}
                </ModelSelectorList>
                <ModelSelectorEffort levels={levels} />
              </ModelSelectorContent>
            </ModelSelector>
          </PromptInputTools>
          <PromptInputSubmit style={styles.submit} />
        </PromptInputFooter>
      </PromptInput>
      <p aria-live="polite" {...stylex.props(layout.sent)}>
        {sent === "" ? "Nothing sent yet." : `Sent with ${sent}`}
      </p>
    </div>
  );
}
