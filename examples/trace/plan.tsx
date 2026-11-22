import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
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

// A plan: every step known before the work starts, so the ones still to come are shown, waiting.
// One row that opens, its line the goal and how many steps are done, running while the plan is
// worked through; under it the done steps ticked, the running one in ink and shimmering.
export default function TracePlan() {
  return (
    <Trace style={layout.column}>
      <TraceCollapsible defaultOpen>
        <TraceCollapsibleTrigger>
          <TraceLine status="running">
            <TraceIcon>
              <Icon icon={ClipboardListIcon} />
            </TraceIcon>
            <TraceTitle>
              Plan: move the dialogs to the new primitives
            </TraceTitle>
            <TraceDescription>
              {done} of {steps.length} done
            </TraceDescription>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <Trace>
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
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
}
