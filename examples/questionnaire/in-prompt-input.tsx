"use client";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
} from "@grasp-os/ui/components/prompt-input";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireItem,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@grasp-os/ui/components/questionnaire";

import { layout } from "./layout";

// A questionnaire in a prompt input's place for a while: it is a group, not a form, so it stands
// inside the prompt input's form, and its Enter and its Send answer the question, not send the
// message.
export default function QuestionnaireInPromptInput() {
  return (
    <PromptInput onSubmit={() => undefined} style={layout.column}>
      <PromptInputBody>
        <Questionnaire onSubmit={() => undefined}>
          <QuestionnaireItem name="report" required>
            <QuestionnaireTitle>
              Which report should I start with?
            </QuestionnaireTitle>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="quarterly">
                Quarterly summary
              </QuestionnaireChoice>
              <QuestionnaireChoice value="suppliers">
                Supplier review
              </QuestionnaireChoice>
            </QuestionnaireChoices>
          </QuestionnaireItem>
          <QuestionnaireActions>
            <QuestionnaireSubmit />
          </QuestionnaireActions>
        </Questionnaire>
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputSubmit />
      </PromptInputFooter>
    </PromptInput>
  );
}
