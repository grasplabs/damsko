// Context's card, drawn on the server: a cost in a currency Intl does not know shows as a plain
// number rather than breaking the page.
//
//   pnpm exec vp test scripts/context.test.tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import {
  Context,
  ContextContent,
  ContextContentFooter,
  ContextInputUsage,
  ContextTrigger,
} from "../src/components/context";

const draw = (currency: string) =>
  renderToStaticMarkup(
    <Context
      usedTokens={1000}
      maxTokens={10_000}
      usage={{ inputTokens: 1000 }}
      cost={{ currency, input: 0.25, total: 0.5 }}
      defaultOpen
    >
      <ContextTrigger />
      <ContextContent>
        <ContextInputUsage />
        <ContextContentFooter />
      </ContextContent>
    </Context>
  );

describe("context's cost", () => {
  test("a known currency is written as money", () => {
    expect(draw("USD")).toContain("$0.50");
  });

  test("a currency Intl does not know is written as the plain number", () => {
    const html = draw("not a currency");
    expect(html).toContain("0.5");
    expect(html).toContain("0.25");
  });
});
