import {
  Queue,
  QueueItem,
  QueueItemContent,
  QueueItemDescription,
  QueueItemIndicator,
  QueueList,
  QueueSection,
  QueueSectionContent,
  QueueSectionLabel,
  QueueSectionTrigger,
} from "@grasp-os/ui/components/queue";
import {
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
} from "@grasp-os/ui/components/trace";
import { ListIcon } from "@grasp-os/ui/lib/icons";
import { size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: { width: "100%", maxWidth: `calc(${size.popupWidth} * 1.6)` },
});

const todos: { title: string; note?: string; detail?: string }[] = [
  {
    title: "Fix the focus ring on the select trigger",
    detail: "It is clipped by the field's hidden overflow.",
  },
  { title: "Update the registry snapshots", note: "12 files" },
  {
    title: "Add tests for the combobox",
    detail: "Typing, clearing and choosing with the keyboard.",
  },
];

// To-dos with more to say: a short note stands after the title; a longer one opens under it, the
// to-do a row that opens.
export default function QueueDescriptions() {
  return (
    <Queue style={layout.column}>
      <QueueSection>
        <QueueSectionTrigger>
          <QueueSectionLabel
            count={todos.length}
            label="to do"
            icon={ListIcon}
          />
        </QueueSectionTrigger>
        <QueueSectionContent>
          <QueueList>
            {todos.map((todo) => {
              const line = (
                <QueueItem key={todo.title}>
                  <QueueItemIndicator />
                  <QueueItemContent>{todo.title}</QueueItemContent>
                  {todo.note === undefined ? null : (
                    <QueueItemDescription>{todo.note}</QueueItemDescription>
                  )}
                </QueueItem>
              );
              if (todo.detail === undefined) {
                return line;
              }
              return (
                <TraceCollapsible key={todo.title}>
                  <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
                  <TraceCollapsibleContent>
                    {todo.detail}
                  </TraceCollapsibleContent>
                </TraceCollapsible>
              );
            })}
          </QueueList>
        </QueueSectionContent>
      </QueueSection>
    </Queue>
  );
}
