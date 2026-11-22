import {
  Task,
  TaskContent,
  TaskItem,
  TaskItemFile,
  TaskTrigger,
} from "@grasp-os/ui/components/task";
import { FileDocIcon, SearchIcon } from "@grasp-os/ui/lib/icons";
import { size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: { width: "100%", maxWidth: `calc(${size.popupWidth} * 1.6)` },
});

// A finished task, open on the steps it took: each a mark and what it did, a file it read as a
// chip. A press on its line folds it.
export default function TaskBasic() {
  return (
    <Task style={layout.column}>
      <TaskTrigger title="Found the project files" />
      <TaskContent>
        <TaskItem icon={SearchIcon}>Searched for page.tsx</TaskItem>
        <TaskItem icon={FileDocIcon}>
          Read <TaskItemFile>app/page.tsx</TaskItemFile>
        </TaskItem>
        <TaskItem icon={SearchIcon}>Scanned 52 files</TaskItem>
        <TaskItem icon={FileDocIcon}>
          Read <TaskItemFile>app/layout.tsx</TaskItemFile>
        </TaskItem>
      </TaskContent>
    </Task>
  );
}
