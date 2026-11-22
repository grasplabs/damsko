"use client";

import { Suggestion, Suggestions } from "@grasp-os/ui/components/suggestion";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: { display: "grid", gap: space["3"], width: "100%", maxWidth: 360 },
});

const suggestions = [
  "What changed since last week?",
  "Compare the two proposals",
  "Find the budget figures",
  "Who is waiting on an answer?",
  "Write a short status update",
  "Suggest next steps",
];

// More suggestions than the column holds: the row runs past its end and scrolls sideways, by
// wheel, touch and Tab, with no bar.
export default function SuggestionOverflow() {
  return (
    <div {...stylex.props(layout.column)}>
      <Suggestions aria-label="Ask about this project">
        {suggestions.map((suggestion) => (
          <Suggestion key={suggestion} suggestion={suggestion} />
        ))}
      </Suggestions>
    </div>
  );
}
