"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@grasp-os/ui/components/questionnaire";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { layout } from "./layout";

const sources = [
  { value: "email", label: "Email" },
  { value: "calendar", label: "Calendar" },
  { value: "notes", label: "Meeting notes" },
];

// The page holds the answer: each choice's `checked` and the words' `value`, set back by their
// `onCheckedChange` and `onValueChange`. Here a button outside the questionnaire chooses for the
// person, as an assistant that guessed would.
export default function QuestionnaireControlled() {
  const [chosen, setChosen] = useState<string[]>([]);
  const [other, setOther] = useState("");
  return (
    <div {...stylex.props(layout.column)}>
      <Questionnaire onSubmit={() => undefined} style={layout.column}>
        <QuestionnaireItem name="sources" multiple>
          <QuestionnaireTitle>
            Where should I look for the decisions?
          </QuestionnaireTitle>
          <QuestionnaireChoices>
            {sources.map((source) => (
              <QuestionnaireChoice
                key={source.value}
                value={source.value}
                checked={chosen.includes(source.value)}
                onCheckedChange={(checked) => {
                  setChosen((now) =>
                    checked
                      ? [...now, source.value]
                      : now.filter((each) => each !== source.value)
                  );
                }}
              >
                {source.label}
              </QuestionnaireChoice>
            ))}
          </QuestionnaireChoices>
          <QuestionnaireInput value={other} onValueChange={setOther} />
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnaireSubmit />
        </QuestionnaireActions>
      </Questionnaire>
      <p role="status" {...stylex.props(layout.words)}>
        {chosen.length === 0
          ? "Nothing chosen"
          : `Chosen: ${chosen.join(", ")}`}
        {other === "" ? "" : `; other: ${other}`}
      </p>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setChosen(["email", "notes"]);
        }}
      >
        Choose email and notes
      </Button>
    </div>
  );
}
