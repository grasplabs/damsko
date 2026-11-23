import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { listenToLiveRegions, openExample } from "./example.ts";

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

test("a closed section's words are found by find in page, which opens it", async ({
  page,
}) => {
  await openExample(page, "markdown", "sections");
  const toggle = page.getByRole("button", { name: "The policy's limits" });
  const words = page.getByText("Meals: €40 a day.");
  await expect(words).toBeHidden();
  expect(
    await words.evaluate((node) =>
      node.closest("[hidden]")?.getAttribute("hidden")
    )
  ).toBe("until-found");
  // What the browser's find does when it lands on hidden words.
  await words.evaluate((node) => {
    node
      .closest("[hidden]")
      ?.dispatchEvent(new Event("beforematch", { bubbles: true }));
  });
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(words).toBeVisible();
});

test("a section written open stands open from the first paint, without opening", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  // Every height the open section's words are seen at, from the first frame they are drawn in.
  await page.addInitScript(() => {
    const seen = new Set<number>();
    let frames = 0;
    const watch = () => {
      for (const node of document.querySelectorAll("p")) {
        if (node.textContent.includes("The claim's approver decides")) {
          const panel = node.parentElement?.parentElement;
          if (panel) {
            seen.add(Math.round(panel.getBoundingClientRect().height));
            frames += 1;
            document.documentElement.dataset.seenHeights = [...seen].join(" ");
            document.documentElement.dataset.seenFrames = String(frames);
          }
        }
      }
      requestAnimationFrame(watch);
    };
    requestAnimationFrame(watch);
  });
  await openExample(page, "markdown", "sections");
  const toggle = page.getByRole("button", { name: "Who decides" });
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByText("The claim's approver decides, never the agent.")
  ).toBeVisible();
  // Past the time an opening takes: thirty frames of it drawn.
  await expect
    .poll(async () =>
      Number(await page.locator("html").getAttribute("data-seen-frames"))
    )
    .toBeGreaterThan(30);
  // One height, never a climb from nothing.
  await expect(page.locator("html")).toHaveAttribute(
    "data-seen-heights",
    /^[1-9]\d*$/u
  );
});

// ---- Words fading in as they are shown (examples/markdown/pace) -------------------------------

/** What a stream drew, watched each frame in the page until the answer is whole and settled. */
interface Watched {
  /** The frame each span was first seen in, by where its words start in the source. */
  firstSeen: Record<string, number>;
  /** The spans (by where they start) that went faint again after they had reached full ink. */
  faded: string[];
  /** The most word spans on the page at once, and how many are left once it is done. */
  most: number;
  left: number;
  /** How far the heading and the first paragraph's first and last words ever moved, in px. */
  moved: number;
  /** How many times the first paragraph was drawn again by React once it was finished. */
  redrawn: number;
  /** The text shown, in order, each time it changed. */
  shown: string[];
}

const watchFades = async (page: Page): Promise<Watched> =>
  await page.evaluate(
    async () =>
      // oxlint-disable-next-line promise/avoid-new -- frames until a condition, which have no promise of their own
      await new Promise<Watched>((resolve) => {
        const answer = document.querySelector("[data-slot=markdown]");
        const seen: Watched = {
          firstSeen: {},
          faded: [],
          most: 0,
          left: 0,
          moved: 0,
          redrawn: -1,
          shown: [],
        };
        let props: unknown = null;
        let anchors: { node: Element; top: number; left: number }[] = [];
        // Where a part stands in the answer (the page round it may centre it as it grows).
        const placeOf = (node: Element) => {
          const box = node.getBoundingClientRect();
          const root = answer?.getBoundingClientRect();
          return {
            top: box.top - (root?.top ?? 0),
            left: box.left - (root?.left ?? 0),
          };
        };
        let quiet = 0;
        let frames = 0;
        // The most ink each span's words have had, drawn again or made afresh: a fade that starts
        // over shows as words going faint again.
        const ink = new Map<string, number>();
        const fades = (spans: HTMLElement[]) => {
          frames += 1;
          for (const span of spans) {
            const at = span.dataset.at ?? "";
            seen.firstSeen[at] ??= frames;
            const now = Number(getComputedStyle(span).opacity);
            const most = ink.get(at) ?? 0;
            if (most >= 0.9 && now < most - 0.3 && !seen.faded.includes(at)) {
              seen.faded.push(at);
            }
            ink.set(at, Math.max(most, now));
          }
        };
        // Once the first paragraph is finished (a list follows it), it never moves or redraws.
        const finished = (paragraph: Element) => {
          const key = Object.keys(paragraph).find((name) =>
            name.startsWith("__reactProps")
          );
          const now: unknown =
            key === undefined ? null : Reflect.get(paragraph, key);
          if (now !== props) {
            seen.redrawn += 1;
            props = now;
          }
          if (anchors.length === 0) {
            anchors = [answer?.querySelector("h2"), paragraph].flatMap(
              (node) => {
                if (node === null || node === undefined) {
                  return [];
                }
                return [{ node, ...placeOf(node) }];
              }
            );
          }
        };
        const frame = () => {
          const spans = [
            ...(answer?.querySelectorAll<HTMLElement>("span[data-at]") ?? []),
          ];
          seen.most = Math.max(seen.most, spans.length);
          fades(spans);
          const text = answer?.textContent ?? "";
          if (text !== seen.shown.at(-1)) {
            seen.shown.push(text);
          }
          const paragraph = answer?.querySelector("p");
          if (paragraph && answer?.querySelector("ul")) {
            finished(paragraph);
          }
          for (const { node, top, left } of anchors) {
            const now = placeOf(node);
            seen.moved = Math.max(
              seen.moved,
              Math.abs(now.top - top),
              Math.abs(now.left - left)
            );
          }
          const busy = answer?.getAttribute("aria-busy") === "true";
          quiet = !busy && spans.length === 0 ? quiet + 1 : 0;
          if (quiet > 10) {
            resolve({ ...seen, left: spans.length });
          } else {
            requestAnimationFrame(frame);
          }
        };
        requestAnimationFrame(frame);
      })
  );

test("with motion, the words come a few at a time, each fades in once, in order, and the answer ends as text", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openExample(page, "markdown", "pace");
  // The run that plays as the page opens ends first, so every span watched is of the next one.
  const answer = page.locator("[data-slot=markdown]");
  await expect(answer).not.toHaveAttribute("aria-busy", { timeout: 30_000 });
  await expect(answer.locator("span[data-at]")).toHaveCount(0);
  await page.getByRole("button", { name: "Play again" }).click();
  await expect(answer).toHaveAttribute("aria-busy", "true");
  const watched = await watchFades(page);
  // A word at a time: many small steps, never a whole paragraph at once.
  expect(watched.shown.length).toBeGreaterThan(60);
  for (const [index, text] of watched.shown.entries()) {
    expect(text.length - (watched.shown[index - 1]?.length ?? 0)).toBeLessThan(
      120
    );
  }
  // Each step of words fades in once: drawn again, made afresh or not, it carries on where it was
  // and never goes faint again.
  const steps = Object.entries(watched.firstSeen);
  expect(steps.length).toBeGreaterThan(30);
  expect(watched.faded).toStrictEqual([]);
  // In order: words further on are never put on the page before the words before them.
  const order = steps
    .map(([at, frame]) => [Number(at), frame] as const)
    .toSorted(([one], [other]) => one - other);
  for (const [index, [, frame]] of order.entries()) {
    expect(frame).toBeGreaterThanOrEqual(order[index - 1]?.[1] ?? 0);
  }
  // Spans only while a block is written: few at once, none once it is done.
  expect(watched.most).toBeLessThan(120);
  expect(watched.left).toBe(0);
  await expect(
    page.getByRole("blockquote").getByText("expect the finance desk's queue")
  ).toBeVisible();
});

test("with motion, nothing already shown moves, and a finished block is not drawn again", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openExample(page, "markdown", "pace");
  await page.getByRole("button", { name: "250 tokens/s" }).click();
  const watched = await watchFades(page);
  expect(watched.moved).toBeLessThan(0.5);
  // Once more as plain text when its last words have faded, once for each definition further down
  // (a link's target, a note: two here) and once as the answer is read whole at its end: never
  // per word or per frame.
  expect(watched.redrawn).toBeLessThanOrEqual(5);
});

test("with reduced motion, the words show as they arrive: no fade and no spans", async ({
  page,
}) => {
  await openExample(page, "markdown", "pace");
  await page.getByRole("button", { name: "Bursts" }).click();
  const watched = await watchFades(page);
  expect(watched.most).toBe(0);
  // Whole bursts: fewer steps than a burst has words.
  expect(watched.shown.length).toBeLessThan(40);
});

test("a hidden tab shows all that has arrived at once, and turned off the words come as given", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.clock.install();
  await openExample(page, "markdown", "pace");
  await page.getByRole("button", { name: "Bursts" }).click();
  // Up to a burst that ends half way through a word: "sends" waits for the word after it.
  await page.clock.runFor(1050);
  const answer = page.locator("[data-slot=markdown]");
  await expect(answer).not.toContainText("which sends");
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(answer).toContainText("which sends");
  await page.getByRole("button", { name: "Off" }).click();
  await page.clock.runFor(30);
  await expect(answer.locator("span[data-at]")).toHaveCount(0);
});

test("with motion, a screen reader hears each finished block once, never a word at a time", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openExample(page, "markdown", "pace");
  await page.getByRole("button", { name: "250 tokens/s" }).click();
  const answer = page.locator("[data-slot=markdown]");
  // While it is written, its words read as one run of text, whatever spans they fade in.
  await expect(answer).toHaveAttribute("aria-busy", "true");
  await expect(answer.getByRole("paragraph").first()).toContainText(
    "Support closed 58 requests and Sales"
  );
  // The spans add nothing to the tree: words run on as text, apart only where a mark is.
  expect(await answer.getByRole("paragraph").first().ariaSnapshot()).toMatch(
    /^- paragraph:\n {2}- text: Support closed\n {2}- strong: 58 requests\n {2}- text: and Sales closed 33,/u
  );
  await expect(answer).not.toHaveAttribute("aria-busy");
  // Each block once, whole: a heading, a paragraph, a list, a table's name, a quote.
  await expect
    .poll(async () => {
      const heardSoFar = await said();
      return heardSoFar.join(" | ");
    })
    .toContain("Next week the rule covers refunds too");
  // Whole blocks, never a word or two: the run that played as the page opened may have begun to
  // speak too, so both are counted.
  const heard = await said();
  expect(heard.length).toBeLessThan(24);
  for (const words of heard) {
    expect(words.split(" ").length).toBeGreaterThanOrEqual(3);
  }
  expect(heard.join(" ")).toContain(
    "Support closed 58 requests and Sales closed 33, so the queue is the shortest it has been since March."
  );
});

test("with motion, a link to a definition and a note defined further down end as links, as written", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openExample(page, "markdown", "pace");
  await page.getByRole("button", { name: "250 tokens/s" }).click();
  const answer = page.locator("[data-slot=markdown]");
  await expect(answer).toHaveAttribute("aria-busy", "true");
  await expect(answer).not.toHaveAttribute("aria-busy", { timeout: 30_000 });
  await expect(
    answer.getByRole("link", { name: /^triage guide/u })
  ).toHaveAttribute("href", "https://example.com/triage");
  await expect(answer).not.toContainText("[guide]");
  await expect(answer).not.toContainText("[^1]");
  // The note's mark leads to the note, and the note back to the mark.
  const mark = answer.locator("sup").getByRole("link");
  const note = (await mark.getAttribute("href")) ?? "";
  await expect(answer.locator(`[id="${note.slice(1)}"]`)).toContainText(
    "Counted from the help desk's export."
  );
  const back = answer.getByRole("link", { name: "Back to reference 1" });
  const reference = (await back.getAttribute("href")) ?? "";
  await expect(answer.locator(`[id="${reference.slice(1)}"]`)).toContainText(
    "1"
  );
});

test("with motion, a selection made while the answer is written is kept as it is finished", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openExample(page, "markdown", "pace");
  await page.getByRole("button", { name: "80 tokens/s" }).click();
  const answer = page.locator("[data-slot=markdown]");
  const paragraph = answer.getByRole("paragraph").first();
  await expect(paragraph).toContainText("Sales closed");
  // The words shown so far, while the newest of them are still fading in.
  const selected = await paragraph.evaluate((node) => {
    const range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, node.childNodes.length);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);
    return document.getSelection()?.toString() ?? "";
  });
  expect(selected).toContain("Support closed");
  await expect(answer).not.toHaveAttribute("aria-busy", { timeout: 30_000 });
  await page.waitForTimeout(600);
  // The same words (a space after the last of them may since have come).
  expect(
    await page.evaluate(
      () => document.getSelection()?.toString().trimEnd() ?? ""
    )
  ).toBe(selected.trimEnd());
  // Let go, the answer ends as text.
  await page.evaluate(() => document.getSelection()?.removeAllRanges());
  await expect(answer.locator("span[data-at]")).toHaveCount(0);
});

/** The main thread's long tasks while the long-answer example plays `answer` with `fade`, in ms. */
const longTasksWhile = async (page: Page, answer: string, fade: string) => {
  await page.getByRole("button", { name: answer }).click();
  await page.getByRole("button", { name: fade }).click();
  const answerBox = page.locator("[data-slot=markdown]");
  await expect(answerBox).not.toHaveAttribute("aria-busy", { timeout: 30_000 });
  await page.evaluate(() => {
    const tasks: number[] = [];
    Reflect.set(window, "longTasks", tasks);
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        tasks.push(entry.duration);
      }
    }).observe({ type: "longtask" });
  });
  await page.getByRole("button", { name: "Play" }).click();
  await expect(answerBox).toHaveAttribute("aria-busy", "true");
  await expect(answerBox).not.toHaveAttribute("aria-busy", { timeout: 60_000 });
  return await page.evaluate(() => {
    const tasks: unknown = Reflect.get(window, "longTasks");
    let sum = 0;
    for (const task of Array.isArray(tasks) ? tasks : []) {
      sum += typeof task === "number" ? task : 0;
    }
    return sum;
  });
};

for (const answer of ["A long list", "Unclosed marks"]) {
  test(`with motion, ${answer.toLowerCase()} streamed fast costs about what it does without the fade`, async ({
    page,
  }) => {
    test.slow();
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await openExample(page, "markdown", "long");
    // Without the fade first: what the page costs as it is, on this machine, now.
    const off = await longTasksWhile(page, answer, "Off");
    const faded = await longTasksWhile(page, answer, "By word");
    // Every word of the block a span, cut into words again each frame, cost seconds here.
    expect(faded).toBeLessThan(off * 1.5 + 300);
    await expect(page.locator("span[data-at]")).toHaveCount(0);
  });
}
