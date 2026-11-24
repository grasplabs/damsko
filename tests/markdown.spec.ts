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

test("a table is a table, its columns headed", async ({ page }) => {
  await openExample(page, "markdown", "answer");
  const table = page.getByRole("table", { name: "Table" });
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

test("untrusted text: raw HTML is text, and only http, https, mailto and paths here lead anywhere", async ({
  page,
}) => {
  await openExample(page, "markdown", "safe");
  await expect(
    page.getByText('<b onmouseover="alert(1)">', { exact: false })
  ).toBeVisible();
  await expect(page.locator("b")).toHaveCount(0);
  await expect(
    page.getByText(/script link.* data link are words, not links\.$/u)
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "script link" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "a page here" })).toHaveAttribute(
    "href",
    "/components/markdown"
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
    page.getByText("A script link and a data link are words, not links.")
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "data link" })).toHaveCount(0);
  await expect(page.getByRole("img")).toHaveCount(0);
  await expect(page.getByText("a tracking pixel")).toBeVisible();
  expect(requests).toStrictEqual([]);
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

/**
 * Watches the streaming example for `ms`, a frame at a time: every row, cell and code block once
 * shown keeps its place until the answer starts again, and every word added fades in or, with
 * reduced motion, is there at once. Gives back what moved and how the words came.
 */
const watchFrames = async (page: Page, ms: number) =>
  await page.evaluate(
    async (time) =>
      // oxlint-disable-next-line promise/avoid-new -- frames until the time is up, which have no promise of their own
      await new Promise<{ moved: string[]; faded: number; popped: number }>(
        (resolve) => {
          const placed = new WeakMap<Element, string>();
          const moved: string[] = [];
          const counts = { faded: 0, popped: 0 };
          const root = document.querySelector("[data-slot=markdown]");
          let length = 0;
          new MutationObserver((changes) => {
            for (const added of changes.flatMap((change) => [
              ...change.addedNodes,
            ])) {
              const spans =
                added instanceof Element
                  ? [added, ...added.querySelectorAll("span")]
                  : [];
              // A word: a span of words alone in a block's text, not one hidden for a screen reader.
              for (const span of spans) {
                const word =
                  span instanceof HTMLSpanElement &&
                  span.closest("p, li, td, th") !== null &&
                  span.children.length === 0 &&
                  span.textContent.trim() !== "" &&
                  getComputedStyle(span).position !== "absolute";
                if (word) {
                  counts[
                    span.getAnimations().length > 0 ? "faded" : "popped"
                  ] += 1;
                }
              }
            }
          }).observe(root ?? document.body, { childList: true, subtree: true });
          const frame = () => {
            const now = root?.textContent?.length ?? 0;
            const restarted = now < length;
            length = now;
            for (const part of root?.querySelectorAll(
              "tr, th, td, [data-slot=code-block]"
            ) ?? []) {
              const box = part.getBoundingClientRect();
              const at = `${Math.round(box.top)},${Math.round(box.left)},${Math.round(box.width)}`;
              const was = placed.get(part);
              if (was !== undefined && was !== at && !restarted) {
                moved.push(`${part.localName}: ${was} to ${at}`);
              }
              placed.set(part, at);
            }
            if (performance.now() < time) {
              requestAnimationFrame(frame);
            } else {
              resolve({ moved, ...counts });
            }
          };
          requestAnimationFrame(frame);
        }
      ),
    await page.evaluate((wait) => performance.now() + wait, ms)
  );

test("while it is written, a table and a code block keep their place and each new word fades in", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openExample(page, "markdown", "streaming");
  const seen = await watchFrames(page, 9000);
  expect(seen.moved).toStrictEqual([]);
  expect(seen.faded).toBeGreaterThan(50);
  expect(seen.popped).toBe(0);
});

test("with reduced motion, each new word is there at once", async ({
  page,
}) => {
  await openExample(page, "markdown", "streaming");
  const seen = await watchFrames(page, 9000);
  expect(seen.popped).toBeGreaterThan(50);
  expect(seen.faded).toBe(0);
});
