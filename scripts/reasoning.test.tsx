// Reasoning's steps, drawn on the server: a line that is only bold is a step's title, except inside
// fenced code, where it is code.
//
//   pnpm exec vp test scripts/reasoning.test.tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "../src/components/reasoning";

const draw = (thoughts: string) =>
  renderToStaticMarkup(
    <Reasoning defaultOpen>
      <ReasoningTrigger />
      <ReasoningContent>{thoughts}</ReasoningContent>
    </Reasoning>
  );

describe("reasoning's steps", () => {
  test("a line that is only bold is a step's title, but not inside fenced code", () => {
    const html = draw(
      "**Reading the file**\n\nIt says:\n\n```md\n**Not a title**\n```\n\n~~~\n**Nor this**\n~~~\n\n**Answering**\n\nDone."
    );
    // In the code, as written, marks and all; the titles round it stay titles.
    expect(html).toContain("**Not a title**");
    expect(html).toContain("**Nor this**");
    expect(html).toMatch(/>Reading the file<\/p>/u);
    expect(html).toMatch(/>Answering<\/p>/u);
  });
});
