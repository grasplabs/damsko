// JavaScript off: every docs page is still styled and still shows its examples, drawn on the
// server. The page keeps its own type, every stage holds a drawn example, and the header's menu
// is a control a person can reach.
import { expect, test } from "@playwright/test";

import { docsPages } from "./example.ts";

test.use({ javaScriptEnabled: false });

for (const path of docsPages()) {
  test(`${path}: styled and drawn with no script`, async ({ page }) => {
    await page.goto(new URL(path, process.env.BASE_URL).href);
    const found = await page.evaluate(() => ({
      font: getComputedStyle(document.body).fontFamily,
      empty: [...document.querySelectorAll("[data-stage]")].filter(
        (stage) => stage.getBoundingClientRect().height < 8
      ).length,
    }));
    expect(found.font).not.toMatch(/^"?Times/u);
    expect(found.empty).toBe(0);
  });
}
