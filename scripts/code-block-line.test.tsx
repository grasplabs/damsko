// A blank line of code is drawn as its line break, so a selection copied across it keeps the line;
// a line with code is drawn as given.
//
//   pnpm exec vp test scripts/code-block-line.test.tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { CodeBlockLine } from "../src/components/code-block";

/** What the line's text holds: the last span in it. */
const textOf = (line: React.ReactNode) =>
  /<span[^>]*>(?<text>[^<]*)<\/span><\/span>$/u.exec(
    renderToStaticMarkup(<CodeBlockLine>{line}</CodeBlockLine>)
  )?.groups?.text;

describe("a line of code", () => {
  test.each([
    ["nothing", undefined],
    ["null", null],
    ["no text", ""],
    ["no runs", []],
  ])("given %s, it holds a line break", (_name, line) => {
    expect(textOf(line)).toBe("\n");
  });

  test.each(["const total = 1;", " ", "0"])(
    "given %j, it holds that and no more",
    (line) => {
      expect(textOf(line)).toBe(line);
    }
  );

  test("runs of code are drawn as given", () => {
    const html = renderToStaticMarkup(
      <CodeBlockLine>{[<b key="0">const</b>, " total"]}</CodeBlockLine>
    );
    expect(html).toContain("<b>const</b> total</span></span>");
  });
});
