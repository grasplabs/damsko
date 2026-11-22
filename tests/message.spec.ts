import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { listenToLiveRegions, openExample } from "./example.ts";

test.use({ permissions: ["clipboard-read", "clipboard-write"] });

const clipboard = async (page: Page) =>
  await page.evaluate(async () => await navigator.clipboard.readText());

/**
 * Writes down, in order, every change of words in the page's live regions (the page's one region,
 * or a status inside a message), so a test can read what a screen reader heard.
 */
const listen = async (page: Page) => {
  await page.addInitScript(() => {
    const heard: string[] = [];
    Object.assign(window, { heard });
    const last = new Map<Element, string>();
    const read = () => {
      for (const region of document.querySelectorAll(
        "[aria-live], [role=status], output"
      )) {
        const words = (region.textContent ?? "").trim();
        if (words !== "" && last.get(region) !== words) {
          heard.push(words);
        }
        last.set(region, words);
      }
    };
    const start = () => {
      new MutationObserver(read).observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    };
    if (document.body === null) {
      document.addEventListener("DOMContentLoaded", start);
    } else {
      start();
    }
  });
};

const heardOf = async (page: Page): Promise<string[]> =>
  await page.evaluate(() =>
    "heard" in window && Array.isArray(window.heard)
      ? window.heard.map(String)
      : []
  );

/** How many times these words were heard. */
const timesHeard = async (page: Page, words: string): Promise<number> => {
  const heard = await heardOf(page);
  return heard.filter((said) => said === words).length;
};

test("given no name, the user's and the assistant's messages are told apart by name, the bubble at the end", async ({
  page,
}) => {
  await openExample(page, "message", "conversation");
  const user = page.getByRole("article", { name: "You" });
  const assistant = page.getByRole("article", { name: "Assistant" });
  await expect(user).toBeVisible();
  await expect(assistant).toBeVisible();
  const bubble = await user
    .getByText("Which invoices are still unpaid this quarter?")
    .boundingBox();
  const column = await user.boundingBox();
  expect(bubble).not.toBeNull();
  expect(column).not.toBeNull();
  expect(
    Math.abs(
      (bubble?.x ?? 0) +
        (bubble?.width ?? 0) -
        (column?.x ?? 0) -
        (column?.width ?? 0)
    )
  ).toBeLessThanOrEqual(1);
});

test("Copy copies the answer's Markdown source and says Copied", async ({
  page,
}) => {
  await openExample(page, "message", "chat-text");
  await page
    .getByRole("article", { name: "Assistant" })
    .getByRole("group", { name: "Message actions" })
    .getByRole("button", { name: "Copy" })
    .click();
  await expect
    .poll(async () => await clipboard(page))
    .toContain("**Only Tailspin Logistics raised its prices**");
  expect(await clipboard(page)).toContain("| Supplier | Change | From |");
  await expect(
    page.getByRole("status").filter({ hasText: /^Copied$/u })
  ).toHaveCount(1);
});

test("the answer reads at the message's words, 14px on a 22px line, its table too", async ({
  page,
}) => {
  await openExample(page, "message", "chat-text");
  const assistant = page.getByRole("article", { name: "Assistant" });
  const type = async (text: string) =>
    await assistant.getByText(text, { exact: true }).evaluate((element) => {
      const { fontSize, lineHeight } = getComputedStyle(element);
      return `${fontSize}/${lineHeight}`;
    });
  expect(
    await type("Ask Kestrel before 1 December whether 30 days can stay.")
  ).toBe("14px/22px");
  expect(await type("Northline Paper")).toBe("14px/22px");
});

test("the actions are named buttons in a named row, reached by Tab and shown when focused", async ({
  page,
}) => {
  await openExample(page, "message", "actions");
  const row = page
    .getByRole("article", { name: "Assistant" })
    .getByRole("group", { name: "Message actions" });
  const button = (name: string) => row.getByRole("button", { name });
  const names = ["Copy", "Good answer", "Poor answer", "Write it again"];
  await Promise.all(
    names.map(async (name) => {
      await expect(button(name)).toBeVisible();
    })
  );
  // From the user's Edit, Tab goes through the assistant's actions in order, each shown as it is.
  const tabTo = async (name: string) => {
    await page.keyboard.press("Tab");
    await expect(button(name)).toBeFocused();
    await expect(button(name)).toBeVisible();
  };
  await page
    .getByRole("article", { name: "You" })
    .getByRole("button", { name: "Edit" })
    .focus();
  await tabTo("Copy");
  await tabTo("Good answer");
  await tabTo("Poor answer");
  await tabTo("Write it again");
  // A rating stays pressed until it is pressed again.
  const good = row.getByRole("button", { name: "Good answer" });
  await good.click();
  await expect(good).toHaveAttribute("aria-pressed", "true");
  await good.click();
  await expect(good).toHaveAttribute("aria-pressed", "false");
});

test("while the answer is written it is busy and has no actions; then the whole answer, Copy, and Answer ready once", async ({
  page,
}) => {
  await listen(page);
  await openExample(page, "message", "streaming");
  const assistant = page.getByRole("article", { name: "Assistant" });
  const copy = assistant.getByRole("button", { name: "Copy" });
  // Written: busy, and no button to reach.
  await expect(assistant.locator("[aria-busy=true]")).toHaveCount(1, {
    timeout: 10_000,
  });
  await expect(copy).toHaveCount(0);
  // Done: the whole answer at once, unpaced under reduced motion, and Copy.
  await expect(copy).toBeVisible({ timeout: 15_000 });
  await expect(assistant).toContainText(
    "and to ask the supplier for a new delivery date by Friday."
  );
  await expect(assistant.locator("[aria-busy=true]")).toHaveCount(0);
  // Said: Writing, and Answer ready once, last, until the example starts over.
  await expect
    .poll(async () => await timesHeard(page, "Writing"), { timeout: 20_000 })
    .toBeGreaterThanOrEqual(2);
  const heard = await heardOf(page);
  const first = heard.indexOf("Writing");
  const answer = heard.slice(first, heard.indexOf("Writing", first + 1));
  expect(answer.filter((said) => said === "Answer ready")).toHaveLength(1);
  expect(answer.at(-1)).toBe("Answer ready");
});

/** Each text the assistant's message showed, in order, while the example streams once. */
const shownWhileStreaming = async (page: Page): Promise<string[]> => {
  await page.evaluate(() => {
    const seen: string[] = [];
    Object.assign(window, { seen });
    const message = document.querySelector('[aria-label="Assistant"]');
    if (message !== null) {
      // The answer's words: its paragraph, without the actions' names.
      new MutationObserver(() => {
        seen.push((message.querySelector("p")?.textContent ?? "").trim());
      }).observe(message, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
  });
  const copy = page
    .getByRole("article", { name: "Assistant" })
    .getByRole("button", { name: "Copy" });
  await expect(copy).toHaveCount(0, { timeout: 10_000 });
  await expect(copy).toBeVisible({ timeout: 15_000 });
  return await page.evaluate(() =>
    "seen" in window && Array.isArray(window.seen)
      ? window.seen.map(String)
      : []
  );
};

/** Whether a text is a whole number of the example's chunks: three words at a time. */
const wholeChunks = (text: string) =>
  text === "" || text.split(" ").length % 3 === 0;

const answer =
  "The team agreed to move the launch to the second week of June, to keep the budget as it is, and to ask the supplier for a new delivery date by Friday.";

test("with reduced motion the words show as they arrive, and the end is never held back", async ({
  page,
}) => {
  await openExample(page, "message", "streaming");
  const shown = await shownWhileStreaming(page);
  expect(shown.length).toBeGreaterThan(0);
  expect(shown.filter((text) => text !== answer).every(wholeChunks)).toBe(true);
  expect(shown.at(-1)).toBe(answer);
});

test("with motion the words come in smoothly between chunks, and the end comes whole", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openExample(page, "message", "streaming");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const shown = await shownWhileStreaming(page);
  expect(shown.some((text) => !wholeChunks(text))).toBe(true);
  expect(shown.at(-1)).toBe(answer);
});

test("a failure is an alert; Try again keeps the focus in the message, and Answer ready is said once", async ({
  page,
}) => {
  await listen(page);
  await openExample(page, "message", "failed");
  const assistant = page.getByRole("article", { name: "Assistant" });
  await expect(page.getByRole("alert")).toContainText("Could not answer");
  await assistant.getByRole("button", { name: "Try again" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(assistant.getByRole("button", { name: "Copy" })).toBeVisible({
    timeout: 5000,
  });
  await expect(assistant).toContainText("Your next one-to-one is on Thursday");
  await expect(assistant).toBeFocused();
  await expect.poll(async () => await timesHeard(page, "Answer ready")).toBe(1);
});

test("stopped, the words stay as written with Stopped under them and the actions offered", async ({
  page,
}) => {
  await openExample(page, "message", "stopped");
  const assistant = page.getByRole("article", { name: "Assistant" });
  await expect(assistant).toContainText("Support for a");
  await expect(assistant.getByText("Stopped", { exact: true })).toBeVisible();
  await expect(assistant.getByRole("button", { name: "Copy" })).toBeVisible();
  await assistant.getByRole("button", { name: "Write it again" }).click();
  await expect(assistant).toContainText("a trade fair in March.", {
    timeout: 5000,
  });
  await expect(assistant.getByText("Stopped", { exact: true })).toHaveCount(0);
});

test("the skeleton is busy and hidden from screen readers", async ({
  page,
}) => {
  await openExample(page, "message", "loading");
  await expect(page.locator("[aria-busy=true]")).toHaveCount(4);
  expect(await page.locator("body").ariaSnapshot()).toBe("");
});

test("a whole turn is said in order, each thing once: nothing lost, nothing twice", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "message", "turn");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("Its renewals rose by a tenth")).toBeVisible();
  await expect
    .poll(said)
    .toStrictEqual([
      "Thinking",
      "1 new message",
      "Writing",
      "The north changed its first week.",
      "Its renewals rose by a tenth after it did.",
      "Answer ready",
    ]);
});

/** Where an avatar stands beside its message's bubble: before it or after, and level with it. */
const place = async (message: Locator, text: string, initials: string) => {
  const bubble = await message.getByText(text).boundingBox();
  const avatar = await message
    .getByText(initials, { exact: true })
    .boundingBox();
  return {
    before: (avatar?.x ?? 0) < (bubble?.x ?? 0),
    // The avatar's middle within the bubble's height: level with it, not with the row's foot.
    level:
      (avatar?.y ?? 0) + (avatar?.height ?? 0) / 2 > (bubble?.y ?? 0) &&
      (avatar?.y ?? 0) + (avatar?.height ?? 0) / 2 <
        (bubble?.y ?? 0) + (bubble?.height ?? 0),
  };
};

test("an avatar stands beside its message, on the message's own side, level with its bubble", async ({
  page,
}) => {
  await openExample(page, "message", "avatar");
  const theirs = page.getByRole("article", { name: "Lars" });
  const mine = page.getByRole("article", { name: "You" });
  const left = await place(theirs, "The build failed while installing.", "LW");
  const right = await place(mine, "Can you share the exact error?", "BM");
  expect(left.before).toBe(true);
  expect(right.before).toBe(false);
  expect(left.level).toBe(true);
  expect(right.level).toBe(true);
});

test("the header names the writer above the bubble, the footer says it was read under it", async ({
  page,
}) => {
  await openExample(page, "message", "header-footer");
  const theirs = page.getByRole("article", { name: "Lars" });
  const header = await theirs.getByText("Lars", { exact: true }).boundingBox();
  const bubble = await theirs
    .getByText("I already checked the logs.")
    .boundingBox();
  expect((header?.y ?? 0) + (header?.height ?? 0)).toBeLessThanOrEqual(
    bubble?.y ?? 0
  );
  await expect(
    page.getByRole("article", { name: "You" }).getByText("Read yesterday")
  ).toBeAttached();
});

for (const theme of ["light", "dark"] as const) {
  test(`Try again is the quiet outline button, ${theme}`, async ({ page }) => {
    await openExample(page, "message", "failed", { theme });
    const retry = page.getByRole("button", { name: "Try again" });
    await expect(retry).toBeVisible();
    const same = await retry.evaluate((button) => {
      const probe = document.createElement("span");
      probe.style.backgroundColor = "var(--damsko-secondary)";
      probe.style.boxShadow = "var(--damsko-bevel-muted)";
      button.after(probe);
      const want = getComputedStyle(probe);
      const got = getComputedStyle(button);
      const matches =
        got.backgroundColor === want.backgroundColor &&
        got.boxShadow === want.boxShadow;
      probe.remove();
      return matches;
    });
    expect(same).toBe(true);
  });
}
