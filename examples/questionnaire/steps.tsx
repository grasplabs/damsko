"use client";

import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@grasp-os/ui/components/questionnaire";

import { layout } from "./layout";

const items = [{ name: "report" }, { name: "audience" }, { name: "cover" }];

// Three questions in turn, one at a time: Next waits for an answer, Previous (or the left arrow)
// goes back with the answer kept, Cmd or Ctrl+Enter goes on from anywhere in it, and a question
// can be skipped. The first takes words of the person's own as well, in one more card. The last sends every answer.
export default function QuestionnaireSteps() {
  return (
    <Questionnaire
      items={items}
      onSubmit={() => undefined}
      style={layout.column}
    >
      <QuestionnaireProgress>Questions</QuestionnaireProgress>
      <QuestionnaireItem name="report">
        <QuestionnaireTitle>
          Which report should I start with?
        </QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="quarterly" recommended>
            Quarterly summary
            <QuestionnaireChoiceDescription>
              Sales, costs and hiring since July
            </QuestionnaireChoiceDescription>
          </QuestionnaireChoice>
          <QuestionnaireChoice value="suppliers">
            Supplier review
          </QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireInput />
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireItem name="audience" multiple>
        <QuestionnaireTitle>Who should get it?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="finance">Finance</QuestionnaireChoice>
          <QuestionnaireChoice value="operations">
            Operations
          </QuestionnaireChoice>
          <QuestionnaireChoice value="people">People</QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireItem name="cover">
        <QuestionnaireTitle>Anything it must cover?</QuestionnaireTitle>
        <QuestionnaireInput placeholder="The budget for the spring launch" />
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireSkip />
        <QuestionnaireNext />
        <QuestionnaireSubmit>Send answers</QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  );
}
