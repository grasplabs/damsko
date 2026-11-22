"use client";

import { Button } from "@grasp-os/ui/components/button";
import { KeyValueList } from "@grasp-os/ui/components/key-value";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

const layout = stylex.create({
  box: { display: "grid", gap: 16, width: "100%", maxWidth: 560 },
  models: { display: "grid", gap: 4, margin: 0, padding: 0, listStyle: "none" },
  again: { justifySelf: "start" },
});

const models = [
  "Claude Sonnet 5.5, the default",
  "Claude Opus 5.5, for harder work",
  "Claude Haiku 5.5, the quickest",
];

// A facts rail beside an agent's brief: every value starts on one column just after the widest name,
// and the chevrons keep to the row's end. Model waits for its value, and opens once it has landed.
export default function KeyValueRailStart() {
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
        valueAlign="start"
        items={[
          {
            id: "knows",
            label: "Knows",
            value: "2 files",
            group: "what",
            detail: "Invoice policy 2026.pdf and Approvers.xlsx.",
          },
          {
            id: "model",
            label: "Model",
            value: "Claude Sonnet 5.5",
            group: "what",
            loading: pending,
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
            value: "Grasp",
            group: "where",
          },
          {
            id: "runs",
            label: "Runs",
            value: "On request",
            group: "where",
            detail:
              "It answers when someone asks it, here or in Slack. It never runs on its own.",
          },
          {
            id: "shared-with",
            label: "Shared with",
            value: "Finance team",
            group: "whose",
          },
        ]}
      />
      <Button
        size="sm"
        variant="outline"
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
