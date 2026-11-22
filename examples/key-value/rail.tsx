"use client";

import { Button } from "@grasp-os/ui/components/button";
import { KeyValueList } from "@grasp-os/ui/components/key-value";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

const layout = stylex.create({
  box: { display: "grid", gap: 16, width: "100%", maxWidth: 360 },
  models: { display: "grid", gap: 4, margin: 0, padding: 0, listStyle: "none" },
  again: { justifySelf: "start" },
});

const models = [
  "Claude Opus, the most capable",
  "Claude Sonnet, faster",
  "Claude Haiku, the quickest",
];

// A facts rail: each fact one line, in three groups. Model and Runs open in place, one at a time,
// and only the rows below move. Last run waits as a dot field at its width, then crossfades in.
export default function KeyValueRail() {
  const [pending, setPending] = useState(true);
  useEffect(() => {
    if (!pending) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setPending(false);
    }, 1600);
    return () => {
      clearTimeout(timer);
    };
  }, [pending]);
  return (
    <div {...stylex.props(layout.box)}>
      <KeyValueList
        orientation="horizontal"
        items={[
          { id: "knows", label: "Knows", value: "4 sources", group: "what" },
          {
            id: "model",
            label: "Model",
            value: "Claude Opus",
            group: "what",
            detail: (
              <ul {...stylex.props(layout.models)}>
                {models.map((model) => (
                  <li key={model}>{model}</li>
                ))}
              </ul>
            ),
          },
          {
            id: "answers-in",
            label: "Answers in",
            value: "Slack",
            group: "where",
          },
          {
            id: "runs",
            label: "Runs",
            value: "On request",
            group: "where",
            detail:
              "It answers when someone asks it, in Slack or here. It never runs on its own.",
          },
          {
            id: "owner",
            label: "Owner",
            value: "Sanne Bakker",
            group: "whose",
          },
          {
            id: "last-run",
            label: "Last run",
            value: "Today at 14:05",
            group: "whose",
            loading: pending,
          },
        ]}
      />
      <Button
        size="sm"
        variant="secondary"
        style={layout.again}
        onClick={() => {
          setPending(true);
        }}
      >
        Check again
      </Button>
    </div>
  );
}
