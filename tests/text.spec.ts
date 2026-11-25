import { expect, test } from "@playwright/test";

import { fixedTime, openExample } from "./example.ts";

const address = "anna.de.vries@contosofinance.example";

test("each size has its own type", async ({ page }) => {
  await openExample(page, "text", "sizes");
  const sizes = [
    ["Everything the workspace is working on", "17px"],
    ["Reports appear here once a review is closed", "15px"],
    ["Shared with the design team", "14px"],
    ["Edited 12 November", "13px"],
  ] as const;
  for (const [words, size] of sizes) {
    // oxlint-disable-next-line no-await-in-loop -- one line after the other
    await expect(page.getByText(words)).toHaveCSS("font-size", size);
  }
});

test("each colour is its own ink, from the strongest", async ({ page }) => {
  await openExample(page, "text", "tones");
  const inks = [
    ["Quarterly summary", "--damsko-foreground"],
    ["The numbers for the third quarter", "--damsko-body-foreground"],
    ["Shared with the whole workspace.", "--damsko-muted-foreground"],
    ["14 pages", "--damsko-subtle-foreground"],
  ] as const;
  const seen = new Set<string>();
  for (const [words, token] of inks) {
    // oxlint-disable-next-line no-await-in-loop -- one line after the other
    const [ink, expected] = await page
      .getByText(words)
      .evaluate((element, name) => {
        // The token's colour as the browser computes it, on a probe beside the words.
        const probe = document.createElement("span");
        probe.style.color = `var(${name})`;
        element.after(probe);
        const value = getComputedStyle(probe).color;
        probe.remove();
        return [getComputedStyle(element).color, value];
      }, token);
    expect(ink, words).toBe(expected);
    seen.add(ink);
  }
  expect(seen.size).toBe(4);
});

test("a long line breaks as its wrap says, and never runs past its row", async ({
  page,
}) => {
  await openExample(page, "text", "wrap");
  // A cut line's tooltip holds the words too, unseen until it opens.
  const lines = page.getByText(address).filter({ visible: true });
  await expect(lines).toHaveCount(3);
  const measured = await lines.evaluateAll((elements) =>
    elements.map((element) => {
      // Its min-content width: how narrow a box that sizes to what it holds lets it be.
      const copy = element.cloneNode(true);
      const box = document.createElement("div");
      box.style.width = "min-content";
      box.append(copy);
      document.body.append(box);
      const least =
        copy instanceof Element ? copy.getBoundingClientRect().width : 0;
      box.remove();
      const style = getComputedStyle(element);
      const row = element.parentElement?.getBoundingClientRect();
      const end =
        element.parentElement?.lastElementChild?.getBoundingClientRect();
      return {
        least,
        lines: Math.round(
          element.getBoundingClientRect().height /
            Number(style.lineHeight.replace("px", ""))
        ),
        ellipsis: style.textOverflow,
        cut: element.scrollWidth > element.clientWidth,
        past: (end?.right ?? 0) - (row?.right ?? 0),
      };
    })
  );
  const [wrapped, anywhere, truncated] = measured;
  // `wrap` keeps the address whole where a box sizes to it; `anywhere` lets it break at a letter.
  expect(wrapped?.least).toBeGreaterThan(150);
  expect(anywhere?.least).toBeLessThan(24);
  // `truncate`: one line, cut, with an ellipsis.
  expect(truncated).toMatchObject({
    lines: 1,
    ellipsis: "ellipsis",
    cut: true,
  });
  for (const line of measured) {
    expect(line.past).toBeLessThanOrEqual(0);
  }
});

test("a cut line is read whole once, and shows its words whole in a tooltip", async ({
  page,
}) => {
  await openExample(page, "text", "wrap", { time: fixedTime });
  const cut = page.getByText(address).filter({ visible: true }).nth(2);
  // The tooltip repeats the words, so it does not describe them: a screen reader hears them once.
  await expect(cut).toHaveAccessibleDescription("");
  await cut.hover();
  await page.clock.runFor(600);
  await expect(page.getByRole("tooltip")).toHaveText(address);
});

test("words that grow in a box that does not are cut, and get their tooltip", async ({
  page,
}) => {
  await openExample(page, "text", "rename", { time: fixedTime });
  // A truncated line's tooltip holds its words too, unseen until it opens.
  const fits = page
    .getByText("Q3 plan", { exact: true })
    .filter({ visible: true });
  await fits.hover();
  await page.clock.runFor(600);
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await page.getByRole("button", { name: "Use the full name" }).click();
  const full = "Quarterly planning for the third quarter";
  await page.getByText(full).filter({ visible: true }).hover();
  await page.clock.runFor(600);
  await expect(page.getByRole("tooltip")).toHaveText(full);
});

test("a cut line shows its whole words in a tooltip, a line that fits has none", async ({
  page,
}) => {
  await openExample(page, "text", "truncate", {
    time: fixedTime,
  });
  const names = page
    .getByText("Quarterly planning", { exact: true })
    .filter({ visible: true });
  await expect(names).toHaveCount(2);
  await names.nth(0).hover();
  await page.clock.runFor(600);
  await expect(page.getByRole("tooltip")).toHaveText("Quarterly planning");
  await page.mouse.move(0, 0);
  await page.clock.runFor(600);
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await names.nth(1).hover();
  // Held past the tooltip's delay: it never opens over words that fit.
  await page.clock.runFor(600);
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test("the sans token loads whole: its fallback face finds Arial or one of its metric twins on the machine", async ({
  page,
}) => {
  await openExample(page, "text", "sizes");
  const loaded = await page.evaluate(async () => {
    const family = getComputedStyle(document.body).getPropertyValue(
      "--damsko-font-sans"
    );
    const faces = await document.fonts.load(`16px ${family}`);
    const fallback = await document.fonts.load('16px "Geist Fallback"');
    return {
      faces: faces.length,
      fallback: fallback.map((face) => face.status),
    };
  });
  expect(loaded.faces).toBeGreaterThan(0);
  expect(loaded.fallback).toStrictEqual(["loaded"]);
});
