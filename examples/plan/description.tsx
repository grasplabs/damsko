import {
  Plan,
  PlanContent,
  PlanDescription,
  PlanHeader,
  PlanTitle,
} from "@grasp-os/ui/components/plan";
import {
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@grasp-os/ui/components/trace";
import {
  ClipboardListIcon,
  CircleCheckIcon,
  CircleIcon,
  Icon,
} from "@grasp-os/ui/lib/icons";
import { size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  column: { width: "100%", maxWidth: `calc(${size.popupWidth} * 1.6)` },
  note: { margin: 0, paddingBlock: space["2"] },
});

const steps = [
  "Add a dark variant to the theme tokens",
  "Read the theme from a cookie on the server",
  "Add a toggle to the settings page",
  "Check contrast on the charts",
];

// A plan with a word about it above its steps: why it goes the way it does.
export default function PlanDescriptionExample() {
  return (
    <Plan defaultOpen style={styles.column}>
      <PlanHeader icon={ClipboardListIcon}>
        <PlanTitle>Plan: add dark mode</PlanTitle>
        <PlanDescription>1 of {steps.length} done</PlanDescription>
      </PlanHeader>
      <PlanContent>
        <p {...stylex.props(styles.note)}>
          Store the theme in a cookie so the server draws the right one and the
          page does not flash on load.
        </p>
        {steps.map((step, index) => (
          <TraceLine key={step} status={index > 0 ? "pending" : undefined}>
            <TraceIcon>
              <Icon icon={index === 0 ? CircleCheckIcon : CircleIcon} />
            </TraceIcon>
            <TraceTitle>{step}</TraceTitle>
          </TraceLine>
        ))}
      </PlanContent>
    </Plan>
  );
}
