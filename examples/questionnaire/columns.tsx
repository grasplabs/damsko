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

const teams = [
  { value: "finance", label: "Finance" },
  { value: "operations", label: "Operations" },
  { value: "people", label: "People" },
  { value: "sales", label: "Sales" },
  { value: "legal", label: "Legal" },
  { value: "support", label: "Support" },
];

// Short choices in two columns; one on a phone.
export default function QuestionnaireColumns() {
  return (
    <Questionnaire onSubmit={() => undefined} style={layout.column}>
      <QuestionnaireItem name="teams" multiple required>
        <QuestionnaireTitle>
          Which teams should get the summary?
        </QuestionnaireTitle>
        <QuestionnaireChoices columns={2}>
          {teams.map((team) => (
            <QuestionnaireChoice key={team.value} value={team.value}>
              {team.label}
            </QuestionnaireChoice>
          ))}
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnaireSubmit />
      </QuestionnaireActions>
    </Questionnaire>
  );
}
