import { MessageSkeleton } from "@grasp-os/ui/components/message";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

// An old chat loading: a pair of placeholders in each message's own shape. They are busy and
// hidden from screen readers; the conversation they stand in says once what is loading.
export default function MessageLoading() {
  return (
    <div {...stylex.props(layout.column)}>
      <MessageSkeleton align="end" />
      <MessageSkeleton lines={3} />
      <MessageSkeleton align="end" lines={2} />
      <MessageSkeleton lines={2} />
    </div>
  );
}
