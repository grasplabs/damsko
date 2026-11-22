"use client";

import { Suggestion, Suggestions } from "@grasp-os/ui/components/suggestion";
import { colors, font, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  column: {
    display: "grid",
    gap: space["3"],
    width: "100%",
    maxWidth: `calc(${size.popupWidth} * 1.6)`,
  },
  said: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
  },
});

const suggestions = [
  "Summarise this thread",
  "Draft a reply",
  "List the open questions",
  "Turn this into a checklist",
];

// Prompts a person can send with one press. A press hands the suggestion's words to `onClick`.
export default function SuggestionBasic() {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div {...stylex.props(layout.column)}>
      <Suggestions>
        {suggestions.map((suggestion) => (
          <Suggestion
            key={suggestion}
            suggestion={suggestion}
            onClick={setPicked}
          />
        ))}
      </Suggestions>
      <p {...stylex.props(layout.said)}>
        {picked === null ? "Nothing sent yet" : `Sent: ${picked}`}
      </p>
    </div>
  );
}
