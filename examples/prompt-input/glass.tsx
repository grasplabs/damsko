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
import {
  colors,
  font,
  media,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
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
  // A page that scrolls behind the prompt input at its foot.
  page: {
    position: "relative",
    width: "100%",
    maxWidth: size.promptInputWidth,
  },
  words: {
    margin: 0,
    paddingBlockEnd: space["12"],
    color: colors.foreground,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
  foot: {
    position: "absolute",
    insetInline: 0,
    bottom: 0,
  },
  // On a phone there is no room for the model in the row.
  chip: { display: { default: null, [media.maxSm]: "none" } },
  level: {},
});

// Over what scrolls behind it, as at a chat's foot: the card's colour most of the way, over a
// blur of the words under it. One row, with the model, dictation and Submit at its end.
export default function PromptInputGlass() {
  const [model, setModel] = useState("opus");
  const [effort, setEffort] = useState("medium");
  const current = modelOf(model);
  const logo = current === undefined ? undefined : logoOf(current.maker);
  const levels = current?.levels ?? [];
  const level = levels.find((each) => each.value === effort)?.label;
  const name = current?.name ?? "";
  const said = level === undefined ? name : `${name}, ${level}`;
  return (
    <div {...stylex.props(styles.page)}>
      <p {...stylex.props(styles.words)}>
        Seat prices held at 12 a seat through the spring, while churn among
        teams of fewer than ten fell for the third month running. The pilot at
        13 a seat ran in two regions and ends on the last day of the quarter;
        its first figures arrive the week after.
      </p>
      <div {...stylex.props(styles.foot)}>
        <PromptInput variant="glass" compact onSubmit={() => undefined}>
          <PromptInputBody>
            <PromptInputTextarea
              aria-label="Message"
              placeholder="Ask a follow-up"
            />
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
                <ModelSelectorTrigger tooltip={said} style={styles.chip}>
                  {logo === undefined ? null : (
                    <ModelSelectorLogo logo={logo} />
                  )}
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
              <PromptInputSpeechButton />
              <PromptInputSubmit />
            </PromptInputTools>
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
