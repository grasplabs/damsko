"use client";

import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireItem,
  QuestionnaireProgress,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@grasp-os/ui/components/questionnaire";

import { layout } from "./layout";

// Sending held by the page, with why beside it: the person can still choose, and reach Send to
// hear the reason.
export default function QuestionnaireHeld() {
  return (
    <Questionnaire onSubmit={() => undefined} style={layout.column}>
      <QuestionnaireProgress>Question</QuestionnaireProgress>
      <QuestionnaireItem name="report" required>
        <QuestionnaireTitle>
          Which report should I start with?
        </QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="quarterly" defaultChecked>
            Quarterly summary
            <QuestionnaireChoiceDescription>
              Sales, costs and hiring since July
            </QuestionnaireChoiceDescription>
          </QuestionnaireChoice>
          <QuestionnaireChoice value="suppliers">
            Supplier review
          </QuestionnaireChoice>
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnaireSubmit
          disabled
          disabledReason="No assistant is connected, so the answer cannot be sent yet."
        />
      </QuestionnaireActions>
    </Questionnaire>
  );
}
