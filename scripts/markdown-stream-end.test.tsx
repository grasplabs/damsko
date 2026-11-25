// @vitest-environment happy-dom
// Markdown once a stream ends: an answer streamed into one Markdown, a chunk at a time, then drawn
// with `streaming` off, is the same DOM as the whole answer drawn at once, as a page opened again
// draws it. Every example of the CommonMark and GFM specs and the 72 answers as a model writes them,
// streamed in chunks of 1, 7 and 64 characters. Only `truncated` tidies an end; a stream that ended
// is not taken for one cut off.
//
//   pnpm exec vp test scripts/markdown-stream-end.test.tsx
import { fileURLToPath } from "node:url";

import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, test } from "vitest";

import { Markdown } from "../src/components/markdown/index.ts";
import { isRecord, readJson } from "./json.ts";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

/** Each item of a fixture's list `key`: its name, and its Markdown, joined when given as lines. */
const sourcesIn = (
  file: string,
  key: string,
  name: (item: Record<string, unknown>) => string,
  field: string
) => {
  const value = readJson(fileURLToPath(new URL(file, import.meta.url)));
  const list = isRecord(value) ? value[key] : undefined;
  return (Array.isArray(list) ? list : []).flatMap((item: unknown) => {
    const text = isRecord(item) ? item[field] : undefined;
    const joined = Array.isArray(text) ? text.join("\n") : text;
    return isRecord(item) && typeof joined === "string"
      ? [{ name: name(item), text: joined }]
      : [];
  });
};

const example = (set: string) => (item: Record<string, unknown>) =>
  `${set} ${String(item.example)}`;
const corpus = [
  ...sourcesIn(
    "fixtures/commonmark-spec.json",
    "examples",
    example("CommonMark"),
    "markdown"
  ),
  ...sourcesIn(
    "fixtures/gfm-spec.json",
    "examples",
    example("GFM"),
    "markdown"
  ),
  ...sourcesIn(
    "fixtures/markdown-answers.json",
    "answers",
    (item) => `answer ${String(item.name)}`,
    "lines"
  ),
];

/**
 * An element as a string, its attributes in name order, its ids (useId's, one per Markdown) as
 * `ID`. Its classes are left out: an answer written here keeps the look it had as it came (its
 * lines break where they fill, a table keeps its even columns), and only that differs by design.
 */
const shapeOf = (node: Node): string => {
  if (!(node instanceof Element)) {
    return node.textContent ?? "";
  }
  const attributes = [...node.attributes]
    .filter((attribute) => attribute.name !== "class")
    .map(
      (attribute) =>
        `${attribute.name}="${attribute.value.replaceAll(/_r_[\da-z]+_/gu, "ID")}"`
    )
    .toSorted();
  const children = [...node.childNodes].map(shapeOf).join("");
  return `<${[node.localName, ...attributes].join(" ")}>${children}</${node.localName}>`;
};

/** What Markdown draws of `text`, whole; and streamed in chunks of `chunk`, then ended. */
const drawn = (text: string, chunk: number) => {
  const whole = document.createElement("div");
  const streamed = document.createElement("div");
  const wholeRoot = createRoot(whole);
  const streamedRoot = createRoot(streamed);
  act(() => {
    wholeRoot.render(<Markdown>{text}</Markdown>);
  });
  for (let at = Math.min(chunk, text.length); at < text.length; at += chunk) {
    act(() => {
      streamedRoot.render(<Markdown streaming>{text.slice(0, at)}</Markdown>);
    });
  }
  act(() => {
    streamedRoot.render(<Markdown>{text}</Markdown>);
  });
  const shapes = { whole: shapeOf(whole), streamed: shapeOf(streamed) };
  act(() => {
    wholeRoot.unmount();
    streamedRoot.unmount();
  });
  return shapes;
};

describe("a stream that ends draws what the whole answer draws", () => {
  test.each([1, 7, 64])(
    "in chunks of %i characters",
    (chunk) => {
      const differing: string[] = [];
      for (const { name, text } of corpus) {
        const { whole, streamed } = drawn(text, chunk);
        if (streamed !== whole) {
          differing.push(
            `${name}\n  whole    ${whole}\n  streamed ${streamed}`
          );
        }
      }
      expect(differing).toStrictEqual([]);
    },
    600_000
  );
});
