"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@grasp-os/ui/components/message";
import { media, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useRef, useState, useSyncExternalStore } from "react";

import { heard } from "./accessibility-fixtures";

const answer =
  "The launch moves to the second week of June. The budget stays as it is, and the supplier is asked for a new date by Friday.";
const words = answer.split(" ");

const styles = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [media.md]: "minmax(0, 3fr) minmax(0, 2fr)",
    },
    gap: space["6"],
    alignItems: "start",
    width: "100%",
    maxWidth: 840,
    minWidth: 0,
  },
  talk: {
    display: "grid",
    gap: space["4"],
    justifyItems: "start",
    minWidth: 0,
  },
});

// What the page's one live region says, in the order it said it (lib announce, `data-slot=
// "live-region"`), where every part speaks: the message's Writing and Answer ready, and the answer's
// sentences. Kept here, outside React, as its words change; cleared when the answer starts again.
const said: string[] = [];
let last = "";
let snapshot = "";

const listen = (changed: () => void) => {
  const hear = () => {
    const region =
      document
        .querySelector('[data-slot="live-region"]')
        ?.textContent?.trim() ?? "";
    if (region !== last && region !== "") {
      said.push(region);
    }
    last = region;
    const next = said.join("\n");
    if (next !== snapshot) {
      snapshot = next;
      changed();
    }
  };
  const observer = new MutationObserver(hear);
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
  });
  return () => {
    observer.disconnect();
  };
};

// Press Write the answer. While it arrives the box beside it fills with exactly what a screen
// reader is told: Writing once, each sentence once it is finished, and Answer ready when the stream
// ends (the last sentence, still being paced, may come after it). Never a word at a time.
export default function AccessibilityAnnouncements() {
  const [count, setCount] = useState(words.length);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const log = useSyncExternalStore(
    listen,
    () => snapshot,
    () => ""
  );
  const start = () => {
    clearInterval(timer.current);
    said.length = 0;
    snapshot = "";
    let shown = 0;
    setCount(0);
    timer.current = setInterval(() => {
      shown += 1;
      setCount(shown);
      if (shown >= words.length) {
        clearInterval(timer.current);
      }
    }, 140);
  };
  const done = count >= words.length;
  return (
    <div {...stylex.props(styles.grid)}>
      <div {...stylex.props(styles.talk)}>
        <Button variant="outline" onClick={start}>
          Write the answer
        </Button>
        <Message status={done ? "done" : "streaming"}>
          <MessageContent>
            <MessageResponse>{words.slice(0, count).join(" ")}</MessageResponse>
          </MessageContent>
        </Message>
      </div>
      <figure {...stylex.props(heard.box)}>
        <figcaption {...stylex.props(heard.title)}>
          Said to a screen reader, read from the live regions
        </figcaption>
        {log === "" ? (
          <p {...stylex.props(heard.line)}>
            Nothing yet. Press Write the answer.
          </p>
        ) : (
          <ol {...stylex.props(heard.list)}>
            {log.split("\n").map((line, index) => (
              <li key={`${String(index)}-${line}`}>{line}</li>
            ))}
          </ol>
        )}
      </figure>
    </div>
  );
}
