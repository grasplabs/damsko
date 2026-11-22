import { Marker, MarkerContent } from "@grasp-os/ui/components/marker";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

// Between parts of a conversation: a day, where the unread messages start, a span of work. The
// words are read as they are; the rules are drawn, not read.
export default function MarkerSeparator() {
  return (
    <div {...stylex.props(layout.column)}>
      <Marker variant="separator">
        <MarkerContent>Today</MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>New messages</MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>Worked for 42 seconds</MarkerContent>
      </Marker>
    </div>
  );
}
