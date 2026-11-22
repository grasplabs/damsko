import { Button } from "@grasp-os/ui/components/button";
import { Spinner } from "@grasp-os/ui/components/spinner";
import { fadeIn } from "@grasp-os/ui/lib/styles";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

const comments = [
  { who: "Amara Okafor", said: "The totals on page 3 match the ledger now." },
  { who: "Jonas Weber", said: "Can we move the review to Thursday?" },
];

const layout = stylex.create({
  panel: {
    display: "grid",
    gap: space["3"],
    width: "100%",
    maxWidth: 400,
    minHeight: 120,
    alignContent: "start",
  },
  status: {
    display: "flex",
    alignItems: "center",
    gap: space["2"],
    margin: 0,
    color: colors.mutedForeground,
    fontSize: font.textSm,
  },
  list: {
    display: "grid",
    gap: space["2"],
    margin: 0,
    padding: 0,
    listStyle: "none",
    fontSize: font.textSm,
  },
  who: { fontWeight: font.weightMedium },
  actions: { display: "flex", justifyContent: "flex-end" },
});

// A short wait of unknown length, where the shape of what comes is not known either: a spinner
// beside words that say what is loading.
export default function LoadingSpinner() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!loading) {
      return;
    }
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1400);
    return () => {
      clearTimeout(timer);
    };
  }, [loading]);
  return (
    <div {...stylex.props(layout.panel)}>
      {loading ? (
        <p role="status" {...stylex.props(layout.status)}>
          <Spinner size="sm" />
          Loading comments
        </p>
      ) : (
        // The comments fade in where the spinner stood.
        <ul data-arrive="" {...stylex.props(layout.list, fadeIn)}>
          {comments.map((comment) => (
            <li key={comment.who}>
              <span {...stylex.props(layout.who)}>{comment.who}</span>:{" "}
              {comment.said}
            </li>
          ))}
        </ul>
      )}
      <div {...stylex.props(layout.actions)}>
        <Button
          variant="outline"
          size="sm"
          focusableWhenDisabled
          disabled={loading}
          onClick={() => {
            setLoading(true);
          }}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
}
