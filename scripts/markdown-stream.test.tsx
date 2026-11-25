// @vitest-environment happy-dom
// Markdown while it streams, in a DOM: an answer streamed into one Markdown a chunk at a time, then
// ended, draws what the whole answer draws (classes aside: what was written here keeps its look),
// and once it is gone mid-stream nothing is left running.
//
//   pnpm exec vp test scripts/markdown-stream.test.tsx
import { setTimeout as sleep } from "node:timers/promises";

import { act } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, test, vi } from "vitest";

import { Markdown } from "../src/components/markdown/index.ts";
import { Message, MessageResponse } from "../src/components/message.tsx";
import { isRecord, readJson } from "./json.ts";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const fixture = readJson(
  `${import.meta.dirname}/fixtures/markdown-answers.json`
);
const list =
  isRecord(fixture) && Array.isArray(fixture.answers) ? fixture.answers : [];
const answers = list.flatMap((item: unknown) =>
  isRecord(item) && Array.isArray(item.lines)
    ? [{ name: String(item.name), text: item.lines.join("\n") }]
    : []
);

/** An element as a string, its attributes in name order (React's ids as `ID`), its classes left out. */
const shapeOf = (node: Node): string => {
  if (!(node instanceof Element)) {
    return node.textContent ?? "";
  }
  const attributes = [...node.attributes]
    .filter((attribute) => attribute.name !== "class")
    .map(
      ({ name, value }) => `${name}="${value.replaceAll(/_r_\w+_/gu, "ID")}"`
    )
    .toSorted();
  const children = [...node.childNodes].map(shapeOf).join("");
  return `<${[node.localName, ...attributes].join(" ")}>${children}</${node.localName}>`;
};

/** The last words shown, code left out. */
const wordsEnd = (box: Element) => {
  const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
  let words = "";
  for (let text = walker.nextNode(); text; text = walker.nextNode()) {
    words += text.parentElement?.closest("code")
      ? " "
      : (text.textContent ?? "");
  }
  return words.trimEnd().slice(-20);
};

// The start of a block's mark shown as words, the next characters still to decide it: a line of a
// paragraph or a heading, or a later line of an item or a cell; an empty heading.
const RAW = /(?:^|\n)[ \t]*(?:[-*+#=_<]+|\d{1,9}[.)]?|<\/?[a-z]*)$/u;
const RAW_LATER = /\n[ \t]*(?:[-*+#=_<]+|\d{1,9}[.)]?|<\/?[a-z]*)$/u;
/** Whether the last block of words drawn ends in the start of a block's mark, code left out. */
const rawStart = (box: Element) => {
  const blocks = [
    ...box.querySelectorAll("p, li, h1, h2, h3, h4, h5, h6, td, th"),
  ].filter((block) => block.closest("[data-slot=code-block]") === null);
  const last = blocks.at(-1);
  // Words in a mark of their own (`**1.**`) are words.
  const walker = document.createTreeWalker(last ?? box, NodeFilter.SHOW_TEXT);
  let end: Node | null = null;
  for (let text = walker.nextNode(); text; text = walker.nextNode()) {
    end = text;
  }
  if (end?.parentElement?.closest("strong, em, del, a, code, sup")) {
    return false;
  }
  const text = last?.textContent ?? "x";
  return (
    (last?.matches("li, td, th") === true ? RAW_LATER : RAW).test(text) ||
    (last?.matches("h1, h2, h3, h4, h5, h6") === true && text === "")
  );
};

/** Draws into a root of its own, and gives back the root's shape after each `step`. */
const live = () => {
  const box = document.createElement("div");
  const root = createRoot(box);
  return {
    box,
    root,
    render: (element: ReactNode) => {
      act(() => {
        root.render(element);
      });
      return shapeOf(box);
    },
  };
};

describe("a stream that ends draws what the whole answer draws, and no raw mark shows on the way", () => {
  test.each([1, 7, 64])(
    "every sample answer, in chunks of %i characters",
    (chunk) => {
      // A clock that stands still: every chunk is read as it comes (no read takes any time), so
      // what is drawn is what that chunk draws.
      vi.useFakeTimers({ toFake: ["performance"] });
      const marks: string[] = [];
      const differing = answers.filter(({ text }) => {
        const whole = live();
        const streamed = live();
        for (let at = chunk; at < text.length; at += chunk) {
          streamed.render(<Markdown streaming>{text.slice(0, at)}</Markdown>);
          const end = wordsEnd(streamed.box);
          // A bracket the source ends in, still to be a link, drawn as it is.
          const pair = /\[[^\]\n]*\]$/u.exec(text.slice(0, at))?.[0];
          const bracket = pair !== undefined && end.endsWith(pair);
          if (/[*_~`]$/u.test(end) || bracket || rawStart(streamed.box)) {
            marks.push(`${at}: …${end}`);
          }
        }
        const same =
          streamed.render(<Markdown>{text}</Markdown>) ===
          whole.render(<Markdown>{text}</Markdown>);
        act(() => {
          whole.root.unmount();
          streamed.root.unmount();
        });
        return !same;
      });
      expect(differing.map(({ name }) => name)).toStrictEqual([]);
      vi.useRealTimers();
      // While written, no mark of emphasis or code, and no start of a block's mark, shows at the end.
      expect(marks).toStrictEqual([]);
      expect(answers.length).toBeGreaterThan(50);
    },
    600_000
  );
});

describe("a block that takes long to read is read again as often as a fifth of the time allows", () => {
  test(
    "a small one at every chunk; a big one once four times its last read has passed, chunk or not",
    { timeout: 60_000 },
    async () => {
      const text = `${"words in a long line ".repeat(10)}\n`.repeat(1000);
      const { box, root, render } = live();
      const shown = (at: number) => {
        render(<Markdown streaming>{text.slice(0, at)}</Markdown>);
        return box.textContent.length;
      };
      expect(shown(100)).toBeLessThan(shown(140));
      shown(150_000);
      await act(async () => {
        await sleep(100);
      });
      const read = shown(150_040);
      expect(read).toBeGreaterThan(149_000);
      expect(shown(150_080)).toBe(read);
      // Without another chunk: once four times its read has passed, however long that read took.
      await vi.waitFor(
        async () => {
          await act(async () => {
            await sleep(50);
          });
          expect(box.textContent.length).toBeGreaterThan(read);
        },
        { timeout: 20_000, interval: 0 }
      );
      act(() => {
        root.unmount();
      });
    }
  );
});

describe("nothing runs on once it is gone", () => {
  test("unmounted mid-stream, no frame or timer is left", () => {
    vi.useFakeTimers();
    const text = answers.map((answer) => answer.text).join("\n\n");
    const { root, render } = live();
    for (let at = 50; at < 4000; at += 50) {
      render(
        <>
          <Markdown streaming>{text.slice(0, at)}</Markdown>
          <Message aria-label="Assistant" status="streaming">
            <MessageResponse>{text.slice(0, at)}</MessageResponse>
          </Message>
        </>
      );
      act(() => {
        vi.advanceTimersByTime(16);
      });
    }
    act(() => {
      root.unmount();
    });
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });
});
