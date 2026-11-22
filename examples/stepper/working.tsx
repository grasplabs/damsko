import { Stepper } from "@grasp-os/ui/components/stepper";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  frame: {
    display: "grid",
    rowGap: space["8"],
    width: "100%",
    maxWidth: 560,
  },
});

const steps = [
  { label: "Map", description: "How the work is done today" },
  { label: "Rebuild", description: "The process, in Grasp Work" },
  { label: "Prove", description: "Hours and euros, before and after" },
];

// The current step under way: its ring gives way to the working light, travelling toward the next.
export default function StepperWorking() {
  return (
    <div {...stylex.props(layout.frame)}>
      <Stepper
        aria-label="Rebuilding the quote process"
        value={1}
        loading
        steps={steps}
      />
      <Stepper
        aria-label="Rebuilding the quote process"
        orientation="vertical"
        value={1}
        loading
        steps={steps}
      />
    </div>
  );
}
