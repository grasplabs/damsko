"use client";

import type { QuestionnaireAnswer } from "@grasp-os/ui/components/questionnaire";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@grasp-os/ui/components/questionnaire";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { layout } from "./layout";

// Item names a model wrote, which every JavaScript object also knows (`__proto__`, `constructor`,
// `toString`): each is an answer like any other, and the list under it shows what `onSubmit` got.
const items = [
  { name: "__proto__", question: "Which report first?", choice: "Quarterly" },
  { name: "constructor", question: "Who reads it?", choice: "Finance" },
  { name: "toString", question: "In what form?", choice: "Slides" },
];

export default function QuestionnaireUntrusted() {
  const [got, setGot] = useState<Record<string, QuestionnaireAnswer> | null>(
    null
  );
  return (
    <div {...stylex.props(layout.column)}>
      <Questionnaire onSubmit={setGot} style={layout.column}>
        {items.map((item) => (
          <QuestionnaireItem key={item.name} name={item.name} required>
            <QuestionnaireTitle>{item.question}</QuestionnaireTitle>
            <QuestionnaireChoices>
              <QuestionnaireChoice value={item.choice.toLowerCase()}>
                {item.choice}
              </QuestionnaireChoice>
            </QuestionnaireChoices>
          </QuestionnaireItem>
        ))}
        <QuestionnaireActions>
          <QuestionnaireNext />
          <QuestionnaireSubmit />
        </QuestionnaireActions>
      </Questionnaire>
      {got !== null && (
        <ul aria-label="Answers received" {...stylex.props(layout.words)}>
          {Object.entries(got).map(([name, answer]) => (
            <li key={name}>
              {name}: {answer.values.join(", ")}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
