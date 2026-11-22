"use client";

import { Input } from "@grasp-os/ui/components/input";
import { StepperNav } from "@grasp-os/ui/components/stepper";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  form: {
    display: "grid",
    gap: space["6"],
    width: "100%",
    maxWidth: "40rem",
  },
  field: {
    display: "grid",
    gap: space["2"],
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.foreground,
  },
});

const questions = ["Your name", "Your team", "Your role"];

// In a form, with no onNext: Next is the form's submit button, so Enter in the field goes on, as a
// form's does, and Alt+Left goes back.
export default function StepperNavForm() {
  const [at, setAt] = useState(0);
  const question = questions[at] ?? "";
  return (
    <form
      {...stylex.props(layout.form)}
      onSubmit={(event) => {
        event.preventDefault();
        setAt((was) => Math.min(questions.length - 1, was + 1));
      }}
    >
      <label {...stylex.props(layout.field)}>
        {question}
        <Input key={question} name="answer" />
      </label>
      <StepperNav
        step={at}
        total={questions.length}
        onBack={() => {
          setAt((was) => Math.max(0, was - 1));
        }}
      />
    </form>
  );
}
