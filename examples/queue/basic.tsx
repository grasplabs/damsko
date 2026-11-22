import {
  Queue,
  QueueItem,
  QueueItemContent,
  QueueItemIndicator,
  QueueList,
  QueueSection,
  QueueSectionContent,
  QueueSectionLabel,
  QueueSectionTrigger,
} from "@grasp-os/ui/components/queue";
import { ListChecksIcon, ListIcon } from "@grasp-os/ui/lib/icons";
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

const left = todos.filter((todo) => !todo.done);
const completed = todos.filter((todo) => todo.done);

// An assistant's to-dos in two sections: what is left, open, and what is done, folded.
export default function QueueBasic() {
  return (
    <Queue style={layout.column}>
      <QueueSection>
        <QueueSectionTrigger>
          <QueueSectionLabel
            count={left.length}
            label="to do"
            icon={ListIcon}
          />
        </QueueSectionTrigger>
        <QueueSectionContent>
          <QueueList>
            {left.map((todo) => (
              <QueueItem key={todo.title}>
                <QueueItemIndicator />
                <QueueItemContent>{todo.title}</QueueItemContent>
              </QueueItem>
            ))}
          </QueueList>
        </QueueSectionContent>
      </QueueSection>
      <QueueSection defaultOpen={false}>
        <QueueSectionTrigger>
          <QueueSectionLabel
            count={completed.length}
            label="completed"
            icon={ListChecksIcon}
          />
        </QueueSectionTrigger>
        <QueueSectionContent>
          <QueueList>
            {completed.map((todo) => (
              <QueueItem key={todo.title}>
                <QueueItemIndicator completed />
                <QueueItemContent>{todo.title}</QueueItemContent>
              </QueueItem>
            ))}
          </QueueList>
        </QueueSectionContent>
      </QueueSection>
    </Queue>
  );
}
