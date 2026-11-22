"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
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

// Several choices, as checkboxes.
export default function QuestionnaireMulti() {
  const [skipped, setSkipped] = useState(false);
  const [round, setRound] = useState(0);
  if (skipped) {
    return (
      <div {...stylex.props(layout.skipped)}>
        <p role="status" {...stylex.props(layout.words)}>
          Skipped. I'll look everywhere.
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
    <Questionnaire key={round} onSubmit={() => undefined} style={layout.column}>
      <QuestionnaireProgress>Question</QuestionnaireProgress>
      <QuestionnaireItem name="sources" multiple>
        <QuestionnaireTitle>
          Where should I look for the decisions?
        </QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="email">Email</QuestionnaireChoice>
          <QuestionnaireChoice value="calendar">Calendar</QuestionnaireChoice>
          <QuestionnaireChoice value="notes">Meeting notes</QuestionnaireChoice>
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
