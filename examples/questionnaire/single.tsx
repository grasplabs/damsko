"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@grasp-os/ui/components/questionnaire";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { layout } from "./layout";

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

// One choice, or words of the person's own. Send waits for an answer; once sent, the answer
// stands in one line. Skip takes the question away.
export default function QuestionnaireSingle() {
  const [skipped, setSkipped] = useState(false);
  const [round, setRound] = useState(0);
  if (skipped) {
    return (
      <div {...stylex.props(layout.skipped)}>
        <p role="status" {...stylex.props(layout.words)}>
          Skipped. I'll start with the quarterly summary.
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSkipped(false);
            setRound(round + 1);
          }}
        >
          Choose after all
        </Button>
      </div>
    );
  }
  return (
    <Questionnaire key={round} onSubmit={() => wait(500)} style={layout.column}>
      <QuestionnaireProgress>Question</QuestionnaireProgress>
      <QuestionnaireItem name="report">
        <QuestionnaireTitle>
          Which report should I start with?
        </QuestionnaireTitle>
        <QuestionnaireDescription>
          I can write the others after it.
        </QuestionnaireDescription>
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
          <QuestionnaireChoice value="survey">
            Team survey results
          </QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireInput />
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnaireSkip
          onClick={() => {
            setSkipped(true);
          }}
        />
        <QuestionnaireSubmit />
      </QuestionnaireActions>
    </Questionnaire>
  );
}
