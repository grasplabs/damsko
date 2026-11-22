import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@grasp-os/ui/components/chain-of-thought";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@grasp-os/ui/components/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@grasp-os/ui/components/reasoning";
import { Shimmer } from "@grasp-os/ui/components/shimmer";
import * as stylex from "@stylexjs/stylex";

import { Not, Pair, Write } from "./pair";
import { writing } from "./writing-fixtures";

const thoughts =
  "Three contracts were renewed this quarter, so those are the ones to read.";

/** Three finished searches, under a line in the words given. */
const Searches = ({ line }: { line: string }) => (
  <ChainOfThought>
    <ChainOfThoughtHeader>{line}</ChainOfThoughtHeader>
    <ChainOfThoughtContent>
      <ChainOfThoughtStep label="Searched the drive" />
      <ChainOfThoughtStep label="Searched Slack" />
      <ChainOfThoughtStep label="Searched the web" />
    </ChainOfThoughtContent>
  </ChainOfThought>
);

// What is happening, said in words: Thinking while it works, then how long it thought and what it
// did. Wrong: Loading and an ellipsis, which say only that something is slow.
export default function WritingLoading() {
  return (
    <Pair>
      <Write why="says what is happening">
        <div {...stylex.props(writing.column)}>
          <Reasoning isStreaming>
            <ReasoningTrigger />
            <ReasoningContent>{thoughts}</ReasoningContent>
          </Reasoning>
          <Reasoning duration={4}>
            <ReasoningTrigger />
            <ReasoningContent>{thoughts}</ReasoningContent>
          </Reasoning>
          <Message>
            <MessageContent>
              <MessageResponse>
                Tailspin Logistics raised its prices by four percent.
              </MessageResponse>
            </MessageContent>
          </Message>
          <Searches line="Searched 3 times · 4.3s" />
        </div>
      </Write>
      <Not why="says only that it is slow">
        <div {...stylex.props(writing.column)}>
          <Reasoning isStreaming>
            <ReasoningTrigger>
              <Shimmer>Loading…</Shimmer>
            </ReasoningTrigger>
            <ReasoningContent>{thoughts}</ReasoningContent>
          </Reasoning>
          <Searches line="Processing…" />
        </div>
      </Not>
    </Pair>
  );
}
