import { Suggestion, Suggestions } from "@grasp-os/ui/components/suggestion";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: { width: "100%", maxWidth: 240 },
});

// One suggestion longer than its row: it stays in the row, on one line, and ends in an ellipsis; its
// name is still every word.
export default function SuggestionLong() {
  return (
    <div {...stylex.props(layout.column)}>
      <Suggestions>
        <Suggestion suggestion="Compare this quarter's supplier costs with the last three" />
      </Suggestions>
    </div>
  );
}
