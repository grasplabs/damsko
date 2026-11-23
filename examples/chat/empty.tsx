import {
  Chat,
  ChatEmptyState,
  ChatMessages,
} from "@grasp-os/ui/components/chat";
import { MessageCircleIcon } from "@grasp-os/ui/lib/icons";
import { radius, size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  frame: {
    width: "100%",
    maxWidth: `calc(${size.popupWidth} * 1.8)`,
    height: `calc(${size.popupHeight} * 0.9)`,
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
    overflow: "hidden",
  },
});

// Before the first turn: a mark, a title and a sentence, centred in the thread.
export default function ChatEmpty() {
  return (
    <div {...stylex.props(layout.frame)}>
      <Chat>
        <ChatMessages aria-label="Conversation with the assistant">
          <ChatEmptyState
            icon={MessageCircleIcon}
            title="No messages yet"
            description="Ask anything to start the conversation."
          />
        </ChatMessages>
      </Chat>
    </div>
  );
}
