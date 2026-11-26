import { Marker, MarkerContent } from "@grasp-os/ui/components/marker";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

// Between parts of a conversation: a day, where the unread messages start, a span of work. The
// words are read as they are; the rules are drawn, not read. Where the unread messages start it is
// in the primary colour and announced as a separator, named by its words.
export default function MarkerSeparator() {
  return (
    <div {...stylex.props(layout.column)}>
      <Marker variant="separator">
        <MarkerContent>Today</MarkerContent>
      </Marker>
      <Marker variant="separator" color="primary" decorative={false}>
        <MarkerContent>New messages</MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>Worked for 42 seconds</MarkerContent>
      </Marker>
    </div>
  );
}
