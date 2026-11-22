import { Bubble, BubbleContent } from "@grasp-os/ui/components/bubble";
import {
  Message,
  MessageContent,
  MessageError,
  MessageResponse,
} from "@grasp-os/ui/components/message";
import type { MessageStatus } from "@grasp-os/ui/components/message";
import * as stylex from "@stylexjs/stylex";

// A state cell centres what it holds: the message is as wide as its words. In a conversation a
// Bubble keeps to 80% of the column; here the specimen is the column, so the Bubble may fill it.
const layout = stylex.create({
  cell: {
    "--damsko-message-bubble-width": "100%",
    width: "max-content",
    maxWidth: "100%",
  },
});

// One message in one state. The docs draw it once per state, without its actions: those are
// Buttons, whose states are on Button's page.
export default function MessageState({
  align = "start",
  status = "done",
}: {
  align?: "start" | "end";
  status?: MessageStatus;
}) {
  return (
    <div {...stylex.props(layout.cell)}>
      <Message align={align} status={status}>
        <MessageContent>
          {status === "error" && <MessageError />}
          {status !== "error" && align === "end" && (
            <Bubble variant="muted" align="end">
              <BubbleContent>Is it done?</BubbleContent>
            </Bubble>
          )}
          {status !== "error" && align === "start" && (
            <MessageResponse>Done by Friday.</MessageResponse>
          )}
        </MessageContent>
      </Message>
    </div>
  );
}
