import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@grasp-os/ui/components/chain-of-thought";
import {
  Message,
  MessageContent,
  MessageError,
} from "@grasp-os/ui/components/message";
import * as stylex from "@stylexjs/stylex";

import { Not, Pair, Write } from "./pair";
import { writing } from "./writing-fixtures";

// What it did, in the past tense with names and counts; what it does, as it happens; and when it
// fails, what failed and what to do. Wrong: I, sorry, and a guess said as hope.
export default function WritingAgent() {
  return (
    <Pair>
      <Write why="what it did and does, by name">
        <div {...stylex.props(writing.column)}>
          <ChainOfThought defaultOpen>
            <ChainOfThoughtHeader>
              Read 1 file and changed 2 files
            </ChainOfThoughtHeader>
            <ChainOfThoughtContent>
              <ChainOfThoughtStep label="Read brief.md" />
              <ChainOfThoughtStep label="Changed 2 files" />
              <ChainOfThoughtStep label="Reading pricing.md" status="active" />
            </ChainOfThoughtContent>
          </ChainOfThought>
          <Message status="error">
            <MessageContent>
              <MessageError onRetry={() => {}}>
                Could not answer. The calendar did not respond.
              </MessageError>
            </MessageContent>
          </Message>
        </div>
      </Write>
      <Not why="I, sorry, and hope">
        <div {...stylex.props(writing.column)}>
          <ChainOfThought defaultOpen>
            <ChainOfThoughtHeader>I looked at your file</ChainOfThoughtHeader>
            <ChainOfThoughtContent>
              <ChainOfThoughtStep label="I looked at your file" />
              <ChainOfThoughtStep
                label="Hopefully fixing it…"
                status="active"
              />
            </ChainOfThoughtContent>
          </ChainOfThought>
          <Message status="error">
            <MessageContent>
              <MessageError onRetry={() => {}}>
                Sorry, I think something went wrong.
              </MessageError>
            </MessageContent>
          </Message>
        </div>
      </Not>
    </Pair>
  );
}
