// A source's address comes from a model or a tool, drawn on the server: only one that leads
// somewhere safe is a link; any other is its title's words.
//
//   pnpm exec vp test scripts/sources.test.tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { Source } from "../src/components/sources";

// A script link's scheme, written so no lint takes the test's own strings for one.
const JS = ["java", "script"].join("");

const draw = (href: string) =>
  renderToStaticMarkup(
    <ul>
      <Source title="The report" href={href} />
    </ul>
  );

describe("a source's address", () => {
  test.each([
    `${JS}:alert(1)`,
    "data:text/html,<b>x</b>",
    "vbscript:msgbox",
    "//elsewhere.example/report",
  ])("a source at %s is its title's words, not a link", (href) => {
    const html = draw(href);
    expect(html).not.toMatch(/<a\b|<button\b/u);
    expect(html).toContain("The report");
  });

  test.each(["https://example.com/pricing", "/files/churn-q3"])(
    "a source at %s is a link there",
    (href) => {
      expect(draw(href)).toContain(`href="${href}"`);
    }
  );
});
