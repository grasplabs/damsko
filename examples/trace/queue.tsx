import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@grasp-os/ui/components/trace";
import {
  CircleCheckIcon,
  CircleIcon,
  Icon,
  ListChecksIcon,
  ListIcon,
} from "@grasp-os/ui/lib/icons";
import { visuallyHidden } from "@grasp-os/ui/lib/styles";
import { size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: { width: "100%", maxWidth: `calc(${size.popupWidth} * 1.6)` },
});

const todos = [
  { title: "Write the migration guide", done: true },
  { title: "Add a changeset", done: true },
  { title: "Fix the focus ring on the select trigger", done: false },
  { title: "Update the registry snapshots", done: false },
  { title: "Add tests for the combobox", done: false },
];

const waiting = todos.filter((todo) => !todo.done);
const completed = todos.filter((todo) => todo.done);

// A queue: what waits and what is done, a row for each that opens on its list. A row's line says
// its count; a waiting item is `pending`, so it is said to be waiting, and a done one says so in
// words before its title, not by its tick alone.
export default function TraceQueue() {
  return (
    <Trace style={layout.column}>
      <TraceCollapsible defaultOpen>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <Icon icon={ListIcon} />
            </TraceIcon>
            <TraceTitle>{waiting.length} to do</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <Trace>
            {waiting.map((todo) => (
              <TraceLine key={todo.title} status="pending">
                <TraceIcon>
                  <Icon icon={CircleIcon} />
                </TraceIcon>
                <TraceTitle>{todo.title}</TraceTitle>
              </TraceLine>
            ))}
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <Icon icon={ListChecksIcon} />
            </TraceIcon>
            <TraceTitle>{completed.length} completed</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <Trace>
            {completed.map((todo) => (
              <TraceLine key={todo.title}>
                <TraceIcon>
                  <Icon icon={CircleCheckIcon} />
                </TraceIcon>
                <span {...stylex.props(visuallyHidden)}>Done, </span>
                <TraceTitle>{todo.title}</TraceTitle>
              </TraceLine>
            ))}
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
}
