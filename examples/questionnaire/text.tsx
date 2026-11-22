"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Questionnaire,
  QuestionnaireActions,
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

// The person's own words only: the field is named by the question. Enter sends, Shift+Enter
// starts a line. Skip takes the question away, and the assistant goes on without an answer.
export default function QuestionnaireText() {
  const [skipped, setSkipped] = useState(false);
  const [round, setRound] = useState(0);
  if (skipped) {
    return (
      <div {...stylex.props(layout.skipped)}>
        <p role="status" {...stylex.props(layout.words)}>
          Skipped. The summary covers everything.
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSkipped(false);
            setRound(round + 1);
          }}
        >
          Answer it after all
        </Button>
      </div>
    );
  }
  return (
    <Questionnaire key={round} onSubmit={() => undefined} style={layout.column}>
      <QuestionnaireProgress>Question</QuestionnaireProgress>
      <QuestionnaireItem name="focus">
        <QuestionnaireTitle>
          What should the summary focus on?
        </QuestionnaireTitle>
        <QuestionnaireInput placeholder="The spring launch and its budget" />
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
