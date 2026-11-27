// What a meter and a bar list's links draw on the server, through their own props: the meter's
// role and range, and a row's name a link only where its address is safe.
//
//   pnpm exec vp test scripts/data-display.test.tsx
import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { ChartBarList } from "../src/components/chart";
import type { ChartBarListProps } from "../src/components/chart";
import { Meter, MeterLabel } from "../src/components/progress";

// A script link's scheme, written so no lint takes the test's own strings for one.
const JS = ["java", "script"].join("");

/** The bar list of one team, its row led where `rowLink` says. */
const drawLinked = (rowLink: ChartBarListProps["rowLink"]) =>
  renderToStaticMarkup(
    <ChartBarList
      aria-label="Spend by team"
      summary="Finance spent the most."
      data={[{ team: "Finance", spend: 1240 }]}
      nameKey="team"
      config={{ spend: { label: "Spend" } }}
      rowLink={rowLink}
    />
  );

const drawTo = (href: string) => drawLinked(() => ({ href }));

/** A router's link, as a product's would be: an `a` with props of its own. */
const RouterLink = ({ children, ...props }: ComponentProps<"a">) => (
  <a {...props} data-router="">
    {children}
  </a>
);

describe("a meter", () => {
  test("is a meter in its range, with words of its own for a screen reader", () => {
    const html = renderToStaticMarkup(
      <Meter
        value={18}
        min={0}
        max={25}
        getAriaValueText={(value) => `${String(value)} of 25 seats`}
      >
        <MeterLabel>Seats</MeterLabel>
      </Meter>
    );
    expect(html).toContain('role="meter"');
    expect(html).toContain('aria-valuenow="18"');
    expect(html).toContain('aria-valuemin="0"');
    expect(html).toContain('aria-valuemax="25"');
    expect(html).toContain('aria-valuetext="18 of 25 seats"');
  });
});

describe("a bar list's rowLink", () => {
  test.each([
    "https://example.com/teams/finance",
    "/teams/finance",
    "#finance",
  ])("a row led to %s names it as a link there", (href) => {
    expect(drawTo(href)).toMatch(
      new RegExp(
        `<a[^>]*href="${href}"[^>]*>(?:<span[^>]*></span>)?Finance</a>`,
        "u"
      )
    );
  });

  test.each([
    `${JS}:alert(1)`,
    "data:text/html,<b>x</b>",
    "//elsewhere.example/teams",
  ])("a row led to %s is its name alone", (href) => {
    const html = drawTo(href);
    expect(html).not.toContain("<a");
    expect(html).toContain("Finance");
  });

  test("a router's link takes the name as its words and keeps its own props", () => {
    const html = drawLinked(() => ({
      render: <RouterLink href="/teams/finance" />,
    }));
    expect(html).toMatch(
      /<a[^>]*href="\/teams\/finance"[^>]*>(?:<span[^>]*><\/span>)?Finance<\/a>/u
    );
    expect(html).toContain('data-router=""');
  });
});
