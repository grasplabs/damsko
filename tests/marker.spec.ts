import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

test("a status is a status, its icon hidden and its words read", async ({
  page,
}) => {
  await openExample(page, "marker", "status");
  await expect(
    page.getByRole("status").filter({ hasText: "Reconnecting" })
  ).toHaveCount(1);
  const status = page.getByRole("status").filter({ hasText: "Reconnecting" });
  expect(await status.ariaSnapshot()).toBe("- status: Reconnecting");
});

test("a separator's words are read, its rules drawn either side of them", async ({
  page,
}) => {
  await openExample(page, "marker", "separator");
  const today = page.getByText("Today", { exact: true });
  await expect(today).toBeVisible();
  // The rules stand on each side: the words in the middle of the line.
  const line = await today.evaluate((element) => {
    const marker = element.parentElement?.getBoundingClientRect();
    const words = element.getBoundingClientRect();
    return {
      before: words.left - (marker?.left ?? 0),
      after: (marker?.right ?? 0) - words.right,
    };
  });
  expect(line.before).toBeGreaterThan(40);
  expect(Math.abs(line.before - line.after)).toBeLessThanOrEqual(1);
});

test("not decorative, a separator is one separator, named by its words", async ({
  page,
}) => {
  await openExample(page, "marker", "separator");
  const separator = page.getByRole("separator");
  await expect(separator).toHaveCount(1);
  await expect(separator).toHaveAccessibleName("New messages");
  await expect(page.getByText("New messages", { exact: true })).toBeVisible();
});

// The colour each line's words and both rules are drawn in, and the token it should be.
const inks = async (page: Page, words: string, token: string) => {
  const content = page.getByText(words, { exact: true });
  return await content.evaluate((element, name) => {
    const marker = element.parentElement ?? element;
    const probe = document.createElement("span");
    probe.style.color = `var(--damsko-${name})`;
    marker.append(probe);
    const want = getComputedStyle(probe).color;
    probe.remove();
    return {
      want,
      words: getComputedStyle(element).color,
      before: getComputedStyle(marker, "::before").backgroundColor,
      after: getComputedStyle(marker, "::after").backgroundColor,
    };
  }, token);
};

for (const theme of ["light", "dark"] as const) {
  test(`a separator's words and rules take its colour's token, ${theme}`, async ({
    page,
  }) => {
    await openExample(page, "marker", "colors", { theme });
    for (const [words, token] of [
      ["Primary", "primary"],
      ["Mint", "mint-deep"],
      ["Lavender", "lavender"],
      ["Destructive", "destructive"],
    ] as const) {
      // oxlint-disable-next-line no-await-in-loop -- one line after the other
      const { want, ...drawn } = await inks(page, words, token);
      expect(drawn, words).toStrictEqual({
        words: want,
        before: want,
        after: want,
      });
    }
    // The default keeps its quiet look: muted words, hairline rules.
    const { want: muted, words } = await inks(
      page,
      "Default",
      "muted-foreground"
    );
    const { want: border, before } = await inks(page, "Default", "border");
    expect({ words, before }).toStrictEqual({ words: muted, before: border });
  });
}

test("drawn as a link or a button it is named by its words and reached by Tab", async ({
  page,
}) => {
  await openExample(page, "marker", "link");
  const link = page.getByRole("link", { name: "Opened the meeting notes" });
  const button = page.getByRole("button", { name: "Undo this change" });
  await expect(link).toHaveAttribute("href", "https://example.com/notes");
  await link.focus();
  await page.keyboard.press("Tab");
  await expect(button).toBeFocused();
  expect(await hasFocusRing(button)).toBe(true);
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Change undone" })
  ).toBeVisible();
});
