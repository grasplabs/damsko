import { Bubble, BubbleContent } from "@grasp-os/ui/components/bubble";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@grasp-os/ui/components/chain-of-thought";
import {
  Message,
  MessageContent,
  MessageFooter,
} from "@grasp-os/ui/components/message";
import * as stylex from "@stylexjs/stylex";

import { Not, Pair, Write } from "./pair";
import { writing } from "./writing-fixtures";

/** A finished search, its one line in the words given. */
const Search = ({ line }: { line: string }) => (
  <ChainOfThought>
    <ChainOfThoughtHeader>{line}</ChainOfThoughtHeader>
    <ChainOfThoughtContent>
      <ChainOfThoughtStep label="Searched the drive" />
    </ChainOfThoughtContent>
  </ChainOfThought>
);

// None, one and many, each in its own words, and a time as a person reads it: the line says "No
// sources", "1 source" and "12 sources". Wrong: a plural glued on in code.
export default function WritingCounts() {
  return (
    <Pair>
      <Write why="none, one and many, read as said">
        <div {...stylex.props(writing.column)}>
          <Search line="Searched the drive: no sources · 0.9s" />
          <Search line="Searched the drive: 1 source · 0.9s" />
          <Search line="Searched the drive: 12 sources · 0.9s" />
          <Message align="end">
            <MessageContent>
              <Bubble variant="muted" align="end">
                <BubbleContent>
                  Which suppliers changed their terms?
                </BubbleContent>
              </Bubble>
              <MessageFooter>
                <time dateTime="2026-11-10T14:02">Tuesday 14:02</time>
              </MessageFooter>
            </MessageContent>
          </Message>
        </div>
      </Write>
      <Not why="a plural glued on, a machine's date">
        <div {...stylex.props(writing.column)}>
          <Search line="Found 0 source(s) · 0.9s" />
          <Search line="Found 1 sources · 0.9s" />
          <Message align="end">
            <MessageContent>
              <Bubble variant="muted" align="end">
                <BubbleContent>
                  Which suppliers changed their terms?
                </BubbleContent>
              </Bubble>
              <MessageFooter>
                <time dateTime="2026-11-10T14:02">2026-11-10T14:02:00Z</time>
              </MessageFooter>
            </MessageContent>
          </Message>
        </div>
      </Not>
    </Pair>
  );
}
