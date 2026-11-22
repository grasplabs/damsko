import { Button } from "@grasp-os/ui/components/button";
import { Progress } from "@grasp-os/ui/components/progress";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

const layout = stylex.create({
  stack: {
    display: "grid",
    gap: space["4"],
    justifyItems: "start",
    width: "100%",
    maxWidth: 400,
  },
  rest: { margin: 0, color: colors.mutedForeground, fontSize: font.textSm },
});

// A long task whose length is known shows how far it has got. Start the export to watch it.
export default function LoadingProgress() {
  const [value, setValue] = useState<number | null>(null);
  const running = value !== null && value < 100;
  useEffect(() => {
    if (!running) {
      return;
    }
    const timer = setTimeout(() => {
      setValue((now) => Math.min(100, (now ?? 0) + 20));
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [running, value]);
  return (
    <div {...stylex.props(layout.stack)}>
      {/* Before the first press nothing is under way, so no bar claims it is. */}
      {value === null ? (
        <p {...stylex.props(layout.rest)}>
          The report has not been exported yet.
        </p>
      ) : (
        <Progress
          label={value === 100 ? "Report exported" : "Exporting the report"}
          value={value}
          variant={value === 100 ? "success" : "default"}
        />
      )}
      {/* The button keeps focus while it is off, so a keyboard user stays on it. */}
      <Button
        variant="outline"
        focusableWhenDisabled
        disabled={running}
        onClick={() => {
          setValue(0);
        }}
      >
        {value === null ? "Export report" : "Export again"}
      </Button>
    </div>
  );
}
