import { Stepper } from "@grasp-os/ui/components/stepper";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stepper: { width: "100%", maxWidth: 560 },
});

// Across, the names beside their marks: the steps before the current one are done.
export default function StepperBasic() {
  return (
    <Stepper
      aria-label="Setting up the workspace"
      value={1}
      steps={[
        { label: "Details" },
        { label: "Members" },
        { label: "Billing" },
        { label: "Review" },
      ]}
      style={layout.stepper}
    />
  );
}
