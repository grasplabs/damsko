import {
  Checkpoint,
  CheckpointIcon,
  CheckpointTrigger,
} from "@grasp-os/ui/components/checkpoint";
import { ClockIcon, Icon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

// A mark before the words: the bookmark, or one of its own. With no tooltip the trigger is a plain
// button, named for the checkpoint it restores.
export default function CheckpointIconExample() {
  return (
    <div {...stylex.props(layout.column)}>
      <Checkpoint>
        <CheckpointIcon />
        Draft saved
        <CheckpointTrigger aria-label="Restore to Draft saved">
          Restore
        </CheckpointTrigger>
      </Checkpoint>
      <Checkpoint>
        <CheckpointIcon>
          <Icon icon={ClockIcon} />
        </CheckpointIcon>
        10:42
        <CheckpointTrigger aria-label="Restore to 10:42">
          Restore
        </CheckpointTrigger>
      </Checkpoint>
    </div>
  );
}
