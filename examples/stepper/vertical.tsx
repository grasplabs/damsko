import { Stepper } from "@grasp-os/ui/components/stepper";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stepper: { width: "100%", maxWidth: 360 },
});

// Down, with a line under each name: for a side panel, or steps that need saying more.
export default function StepperVertical() {
  return (
    <Stepper
      aria-label="Publishing the report"
      orientation="vertical"
      value={2}
      steps={[
        { label: "Draft", description: "Written and saved on 3 March." },
        { label: "Review", description: "Two reviewers agreed." },
        { label: "Approval", description: "Waiting for the owner to approve." },
        { label: "Published", description: "Shared with the whole workspace." },
      ]}
      style={layout.stepper}
    />
  );
}
