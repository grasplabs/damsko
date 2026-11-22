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
import { size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: { width: "100%", maxWidth: `calc(${size.popupWidth} * 1.6)` },
});

const steps: { title: string; status: "done" | "running" | "pending" }[] = [
  { title: "Install the new primitives", status: "done" },
  { title: "Replace the old imports", status: "done" },
  { title: "Rename asChild to render", status: "running" },
  { title: "Update the data-state selectors", status: "pending" },
  { title: "Run the type checker", status: "pending" },
];

const done = steps.filter((step) => step.status === "done").length;

// A plan under way, open on its steps: the done ones ticked, the running one in ink and shimmering,
// the rest waiting. The line counts how many are done.
export default function PlanBasic() {
  return (
    <Plan isStreaming defaultOpen style={layout.column}>
      <PlanHeader icon={ClipboardListIcon}>
        <PlanTitle>Plan: move the dialogs to the new primitives</PlanTitle>
        <PlanDescription>
          {done} of {steps.length} done
        </PlanDescription>
      </PlanHeader>
      <PlanContent>
        {steps.map((step) => (
          <TraceLine
            key={step.title}
            status={step.status === "done" ? undefined : step.status}
          >
            <TraceIcon>
              <Icon
                icon={step.status === "done" ? CircleCheckIcon : CircleIcon}
              />
            </TraceIcon>
            <TraceTitle>{step.title}</TraceTitle>
          </TraceLine>
        ))}
      </PlanContent>
    </Plan>
  );
}
