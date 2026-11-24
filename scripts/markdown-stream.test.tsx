// @vitest-environment happy-dom
// Markdown while it streams, in a DOM: an answer streamed into one Markdown a chunk at a time, then
// ended, draws what the whole answer draws (classes aside: what was written here keeps its look),
// and once it is gone mid-stream nothing is left running.
//
//   pnpm exec vp test scripts/markdown-stream.test.tsx
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

describe("a stream that ends draws what the whole answer draws", () => {
  test.each([1, 7, 64])(
    "every sample answer, in chunks of %i characters",
    (chunk) => {
      const differing = answers.filter(({ text }) => {
        const whole = live();
        const streamed = live();
        for (let at = chunk; at < text.length; at += chunk) {
          streamed.render(<Markdown streaming>{text.slice(0, at)}</Markdown>);
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
      expect(answers.length).toBeGreaterThan(50);
    },
    600_000
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
