import { Stepper } from "@grasp-os/ui/components/stepper";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 32, width: "100%", maxWidth: 560 },
});

// A step that stopped says so on its mark and its name; and once every step is done, the stepper
// shows them all ticked.
export default function StepperFailed() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Stepper
        aria-label="Importing contacts"
        value={1}
        steps={[
          { label: "Upload" },
          { label: "Match columns", status: "error" },
          { label: "Import" },
        ]}
      />
      <Stepper
        aria-label="Importing contacts"
        value={3}
        steps={[
          { label: "Upload" },
          { label: "Match columns" },
          { label: "Import" },
        ]}
      />
    </div>
  );
}
