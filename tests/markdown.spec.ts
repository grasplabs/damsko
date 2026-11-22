import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { openExample } from "./example.ts";

/** What the page shows now that it should never show while an answer streams. */
const strayMarks = async (page: Page) =>
  await page.evaluate(() => ({
    wrong: [...document.querySelectorAll("p, li")]
      .map((block) => block.textContent)
      .filter(
        (text) =>
          text.trimStart().startsWith("|") ||
          text.includes("```") ||
          /\]\(|\[[^\]]*$/u.test(text)
      ),
    tables: document.querySelectorAll("table").length,
  }));

/**
 * Watches the page for `ms` while an answer streams, and gives back every text it should never
 * have shown (a paragraph of pipes: a table not yet whole; fence marks; a link's brackets) and
 * whether a table was ever drawn.
 */
const watchStream = async (page: Page, ms: number) => {
  const wrong = new Set<string>();
  let tables = 0;
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // One look at a time, in order: each waits for the one before.
    // oxlint-disable-next-line no-await-in-loop
    const seen = await strayMarks(page);
    for (const text of seen.wrong) {
      wrong.add(text.slice(0, 60));
    }
    tables = Math.max(tables, seen.tables);
  }
  return { wrong: [...wrong], tables };
};

test("an answer: its heading, list, table, code with copy, quote and a link that opens safely", async ({
  page,
}) => {
  await openExample(page, "markdown", "answer");
  await expect(
    page.getByRole("heading", { level: 2, name: "Summary of the comments" })
  ).toBeVisible();
  await expect(page.getByRole("list").first().getByRole("listitem")).toHaveText(
    [
      "The support numbers for March look low.",
      "The move to the new office needs a date.",
    ]
  );
  await expect(page.getByText("await report.share(")).toBeVisible();
  await expect(page.getByRole("button", { name: /^Copy/u })).toBeVisible();
  await expect(
    page.getByText('Lena: "Can we add the survey results before Friday?"')
  ).toBeVisible();
  const link = page.getByRole("link", {
    name: "sharing guide (opens in a new tab)",
  });
  await expect(link).toHaveAttribute(
    "href",
    "https://example.com/guides/sharing"
  );
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");
});

test("a table is a table, named by the heading above it, its columns headed", async ({
  page,
}) => {
  await openExample(page, "markdown", "answer");
  const table = page.getByRole("table", { name: "Summary of the comments" });
  await expect(table.getByRole("columnheader")).toHaveText([
    "Section",
    "Comments",
    "Open",
  ]);
  await expect(table.getByRole("row")).toHaveCount(4);
  await expect(
    table.getByRole("row", { name: "Risks 4 2" }).getByRole("cell")
  ).toHaveText(["Risks", "4", "2"]);
});

test("lists hold lists, and an item of two paragraphs keeps both", async ({
  page,
}) => {
  await openExample(page, "markdown", "lists");
  const steps = page.getByRole("list").first();
  await expect(steps.getByRole("listitem")).toHaveCount(5);
  const tell = steps.getByRole("listitem").filter({ hasText: "Tell the team" });
  await expect(tell.getByRole("list").getByRole("listitem")).toHaveText([
    "Support, by Friday",
    "Sales, on Monday",
  ]);
  await expect(page.getByText("Ask for a card at the gate.")).toBeVisible();
});

test("headings start at the caller's level", async ({ page }) => {
  await openExample(page, "markdown", "headings");
  await expect(
    page.getByRole("heading", { level: 2, name: "Expenses review" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 3, name: "Where the money went" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 4, name: "Travel" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 5, name: "Hotels" })
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(0);
});

test("untrusted text: raw HTML is text, and only http, https and mailto lead anywhere", async ({
  page,
}) => {
  await openExample(page, "markdown", "safe");
  await expect(
    page.getByText('<b onmouseover="alert(1)">', { exact: false })
  ).toBeVisible();
  await expect(page.locator("b")).toHaveCount(0);
  await expect(
    page.getByText(/script link.* relative link are words, not links\.$/u)
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "script link" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "relative link" })).toHaveCount(
    0
  );
  await expect(
    page.getByRole("link", { name: "safe link (opens in a new tab)" })
  ).toHaveAttribute("href", "https://example.com/");
  const mail = page.getByRole("link", { name: "an email" });
  await expect(mail).toHaveAttribute("href", "mailto:team@example.com");
  await expect(mail).not.toHaveAttribute("target");
});

test("untrusted text: a script stays text, a data link is words, a picture never loads", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("pixel.gif")) {
      requests.push(request.url());
    }
  });
  await openExample(page, "markdown", "safe");
  await expect(page.getByText("<script>alert(1)</script>")).toBeVisible();
  await expect(
    page.getByText(
      "A script link, a data link and a relative link are words, not links."
    )
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "data link" })).toHaveCount(0);
  await expect(page.getByRole("img")).toHaveCount(0);
  await expect(page.getByText("a tracking pixel")).toBeVisible();
  expect(requests).toStrictEqual([]);
});

test("tasks are said as done or not, and a rule separates", async ({
  page,
}) => {
  await openExample(page, "markdown", "tasks");
  await expect(page.getByRole("listitem")).toHaveText([
    "DoneGather the comments",
    "DoneCount the open requests",
    "Not doneAdd the survey results",
    "Not doneShare with the team",
  ]);
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  await expect(page.getByRole("separator")).toHaveCount(1);
});

test("while it is written: no pipes, no fence marks, no brackets, and the table arrives whole", async ({
  page,
}) => {
  await openExample(page, "markdown", "streaming");
  const seen = await watchStream(page, 9000);
  expect(seen.wrong).toStrictEqual([]);
  expect(seen.tables).toBeGreaterThan(0);
});

test("caught part way: an open fence is code being written, a half link its words, a half table a table", async ({
  page,
}) => {
  await openExample(page, "markdown", "half-written");
  const fence = page.getByRole("region", { name: "A fence not yet closed" });
  await expect(fence.getByText("def closed(requests):")).toBeVisible();
  await expect(fence.getByText("Writing")).toBeVisible();
  await expect(fence.getByText("```")).toHaveCount(0);
  const link = page.getByRole("region", {
    name: "A link still being written",
  });
  await expect(
    link.getByText("The numbers are in the weekly report")
  ).toBeVisible();
  await expect(link.getByRole("link")).toHaveCount(0);
  const table = page.getByRole("region", {
    name: "A table still being written",
  });
  await expect(table.getByRole("row", { name: "Support 58 4" })).toBeVisible();
  await expect(table.getByRole("row")).toHaveCount(2);
  await expect(table.getByText("|")).toHaveCount(0);
});

test("cut off: stopped part way and drawn from history, no raw mark and no link to nowhere", async ({
  page,
}) => {
  await openExample(page, "markdown", "cut");
  // Written, then stopped: busy while it is written, and not once it has stopped.
  await expect(page.locator("[aria-busy=true]")).toHaveCount(1);
  await expect(page.locator("[aria-busy=true]")).toHaveCount(0);
  await expect(
    page
      .getByRole("paragraph")
      .filter({ hasText: /while churn stays under 3%$/u })
  ).toHaveCount(2);
  await expect(page.getByText(/[[\]*]/u)).toHaveCount(0);
  await expect(page.getByRole("link")).toHaveCount(0);
});

test("single line breaks: space runs on, line breaks every one, auto only the short lines", async ({
  page,
}) => {
  await openExample(page, "markdown", "line-breaks");
  // The three ways in order: space, line, auto; each paragraph's line breaks.
  const breaks = async (start: RegExp) =>
    await Promise.all(
      [0, 1, 2].map(
        async (way) =>
          await page.getByText(start).nth(way).locator("br").count()
      )
    );
  expect(await breaks(/^When: 14 and 15 August/u)).toStrictEqual([0, 3, 3]);
  expect(await breaks(/^I checked three venues/u)).toStrictEqual([0, 2, 0]);
  expect(await breaks(/^Next steps/u)).toStrictEqual([0, 3, 3]);
});

test("single line breaks while written: the paragraph wrapped by hand never breaks", async ({
  page,
}) => {
  await openExample(page, "markdown", "line-breaks-stream");
  const wrapped = page.getByText(/^I checked three venues/u).locator("br");
  let most = 0;
  const end = Date.now() + 6000;
  while (Date.now() < end) {
    // One look at a time, in order: each waits for the one before.
    // oxlint-disable-next-line no-await-in-loop
    most = Math.max(most, await wrapped.count());
  }
  expect(most).toBe(0);
});

test("a section folds: its summary names its button, Enter and a press open and close it", async ({
  page,
}) => {
  await openExample(page, "markdown", "sections");
  await expect(page.getByText("<details>")).toHaveCount(0);
  const toggle = page.getByRole("button", { name: "The policy's limits" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByText("Meals: €40 a day.")).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("Meals: €40 a day.")).toBeVisible();
  await toggle.press("Enter");
  await expect(page.getByText("Meals: €40 a day.")).toBeHidden();
});

test("sections: nested ones fold, and any other HTML or an unclosed one stays text", async ({
  page,
}) => {
  await openExample(page, "markdown", "sections-cases");
  const outer = page.getByRole("button", { name: "Outer" }).first();
  await outer.click();
  const inner = page.getByRole("button", { name: "Inner" }).first();
  await expect(inner).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByText("<div>Other HTML stays text.</div>")
  ).toBeVisible();
  await expect(page.getByText("<summary>Never closed</summary>")).toBeVisible();
  await expect(page.getByRole("button", { name: "Never closed" })).toHaveCount(
    0
  );
  await expect(page.getByRole("button", { name: "Arrives whole" })).toBeVisible(
    {
      timeout: 10_000,
    }
  );
});

test("the host draws links: out asks first, a path goes through its router, a citation is its chip, a script link is words", async ({
  page,
}) => {
  await openExample(page, "markdown", "host-links");
  await expect(page.getByRole("button", { name: "Source 1" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Source 2" })).toBeVisible();
  const router = page.getByRole("link", { name: "the contracts page" });
  await expect(router).toHaveAttribute("href", "#/contracts/q4");
  await expect(router).toHaveAttribute("data-router-link", "");
  await expect(page.getByRole("link", { name: "like this one" })).toHaveCount(
    0
  );
  await expect(page.getByRole("link", { name: /on their site/u })).toHaveCount(
    0
  );
  await page.getByRole("button", { name: "on their site" }).click();
  const dialog = page.getByRole("dialog", { name: "Open external link?" });
  await expect(
    dialog.getByText("https://tailspin.example.com/notices/2026-rates")
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
});

test("a task's box is round at the corner, its tick the icon's own size", async ({
  page,
}) => {
  await openExample(page, "markdown", "tasks");
  const done = page.getByRole("listitem").filter({ hasText: "Done" }).first();
  const box = await done.evaluate((item) => {
    const mark = item.querySelector("svg");
    const face = mark?.parentElement;
    if (mark === null || face === null || face === undefined) {
      return null;
    }
    const look = getComputedStyle(face);
    return {
      // Where the browser draws corner shapes, the plain round one (computed as superellipse(1)),
      // not the system's squircle.
      round:
        !CSS.supports("corner-shape", "round") ||
        ["round", "superellipse(1)"].includes(
          look.getPropertyValue("corner-shape")
        ),
      radius: look.borderTopLeftRadius,
      tick: mark.getBoundingClientRect().width,
    };
  });
  expect(box).toEqual({ round: true, radius: "6px", tick: 16 });
});
