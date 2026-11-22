"use client";

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

const offline = () =>
  new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("offline"));
    }, 500);
  });

// The answer could not be sent: the questionnaire says so, keeps the choice, and can be sent
// again.
export default function QuestionnaireFailed() {
  return (
    <Questionnaire onSubmit={offline} style={layout.column}>
      <QuestionnaireItem name="format" required>
        <QuestionnaireTitle>How should I write it up?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="short">A short list</QuestionnaireChoice>
          <QuestionnaireChoice value="full">A full report</QuestionnaireChoice>
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnaireSubmit />
      </QuestionnaireActions>
    </Questionnaire>
  );
}
