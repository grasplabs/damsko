// The streaming fixture: replays a stream (streams/*.json, seeded traces shaped like a model's) at its
// real speed, each chunk at the time it arrived, into a renderer. `old` is what a product did:
// every chunk straight onto the page as it arrived, a half-written line held back and then let out
// in a lump. `new` is the components as they are: paced, word by word, half-written Markdown shown
// whole.
"use client";

import { Bubble, BubbleContent } from "@grasp-os/ui/components/bubble";
import { Button } from "@grasp-os/ui/components/button";
import { CopyButton } from "@grasp-os/ui/components/copy-button";
import {
  Message,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@grasp-os/ui/components/message";
import { focusRingInset, scrollbarHidden } from "@grasp-os/ui/lib/styles";
import {
  colors,
  font,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { steadyPart } from "./old-steady";
import bursty from "./streams/bursty.json";
import calm from "./streams/calm.json";
import long from "./streams/long.json";
import stalls from "./streams/stalls.json";

export interface Chunk {
  /** When it arrives, in ms from the first byte. */
  t: number;
  text: string;
}

export const streams = { calm, bursty, stalls, long } as Record<
  StreamName,
  Chunk[]
>;
export type StreamName = "calm" | "bursty" | "stalls" | "long";

/** The text so far of a stream played at its real speed, from `run` (change it to start again). */
export function useReplay(chunks: Chunk[], run: number) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setText("");
    setDone(false);
    const timers = chunks.map((chunk, index) =>
      window.setTimeout(() => {
        setText((now) => now + chunk.text);
        if (index === chunks.length - 1) {
          setDone(true);
        }
      }, chunk.t)
    );
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [chunks, run]);
  return { text, done };
}

const styles = stylex.create({
  column: {
    display: "grid",
    alignContent: "start",
    gap: space["6"],
    width: "100%",
    maxWidth: size.promptInputWidth,
    minWidth: 0,
  },
});

interface RendererProps {
  text: string;
  done: boolean;
}

/** The old way: each chunk straight onto the page, the Markdown never told it is streaming. */
export function OldRenderer({ text, done }: RendererProps) {
  return (
    <Message status={done ? "done" : "streaming"}>
      <MessageContent>
        <MessageResponse streaming={false}>
          {done ? text : steadyPart(text)}
        </MessageResponse>
        <MessageActions>
          <CopyButton value={text} />
        </MessageActions>
      </MessageContent>
    </Message>
  );
}

/** The new way: the components as they are. */
export function NewRenderer({ text, done }: RendererProps) {
  return (
    <Message status={done ? "done" : "streaming"}>
      <MessageContent>
        <MessageResponse streaming={!done}>{text}</MessageResponse>
        <MessageActions>
          <CopyButton value={text} />
        </MessageActions>
      </MessageContent>
    </Message>
  );
}

export const renderers = { old: OldRenderer, new: NewRenderer } as const;
export type RendererName = keyof typeof renderers;

/** One stream into one renderer, starting as soon as it is on the page. */
export function Replay({
  stream,
  renderer,
  question,
}: {
  stream: StreamName;
  renderer: RendererName;
  question?: ReactNode;
}) {
  const { text, done } = useReplay(streams[stream], 0);
  const Renderer = renderers[renderer];
  return (
    <div {...stylex.props(styles.column)}>
      <Message align="end">
        <MessageContent>
          <Bubble variant="muted" align="end">
            <BubbleContent>
              {question ?? "What changed this week?"}
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Renderer text={text} done={done} />
    </div>
  );
}

const compare = stylex.create({
  page: { display: "grid", gap: space["6"], width: "100%", minWidth: 0 },
  controls: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space["2"],
  },
  sides: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 18rem), 1fr))",
    gap: space["8"],
    alignItems: "start",
    minWidth: 0,
  },
  side: { display: "grid", gap: space["3"], minWidth: 0 },
  label: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
  // Each side keeps one height, whatever the stream's length, and its answer scrolls inside it.
  // A column that runs upward keeps its scroll at the end as the answer grows, with no script.
  box: {
    display: "flex",
    flexDirection: "column-reverse",
    height: "min(26rem, 60vh)",
    minWidth: 0,
    overflowY: "auto",
    overscrollBehavior: "auto",
    borderRadius: radius.base,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
  },
  inner: {
    flexShrink: 0,
    marginBlockEnd: "auto",
    padding: space["4"],
    minWidth: 0,
  },
});

const names: StreamName[] = ["calm", "bursty", "stalls", "long"];

const nameOf = (name: StreamName) =>
  `${name.slice(0, 1).toUpperCase()}${name.slice(1)}`;

/** Old and new side by side, on the same stream at the same moment: pick a stream, and both start again together. */
export default function StreamingCompare() {
  const [stream, setStream] = useState<StreamName>("calm");
  const [run, setRun] = useState(0);
  return (
    <div {...stylex.props(compare.page)}>
      <div role="group" aria-label="Stream" {...stylex.props(compare.controls)}>
        {names.map((name) => (
          <Button
            key={name}
            size="sm"
            variant={name === stream ? "default" : "secondary"}
            aria-pressed={name === stream}
            onClick={() => {
              setStream(name);
              setRun((now) => now + 1);
            }}
          >
            {nameOf(name)}
          </Button>
        ))}
      </div>
      <div {...stylex.props(compare.sides)}>
        <div {...stylex.props(compare.side)}>
          <p {...stylex.props(compare.label)}>Old: each chunk as it arrives</p>
          <div
            tabIndex={0}
            role="region"
            aria-label="The old way's answer"
            {...stylex.props(compare.box, scrollbarHidden, focusRingInset)}
          >
            <div {...stylex.props(compare.inner)}>
              <Replay
                key={`old-${stream}-${run}`}
                stream={stream}
                renderer="old"
              />
            </div>
          </div>
        </div>
        <div {...stylex.props(compare.side)}>
          <p {...stylex.props(compare.label)}>New: paced, word by word</p>
          <div
            tabIndex={0}
            role="region"
            aria-label="The new way's answer"
            {...stylex.props(compare.box, scrollbarHidden, focusRingInset)}
          >
            <div {...stylex.props(compare.inner)}>
              <Replay
                key={`new-${stream}-${run}`}
                stream={stream}
                renderer="new"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
