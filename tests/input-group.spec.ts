import { expect, test } from "@playwright/test";

import { drawsWordsOnce, openExample } from "./example.ts";

test("a press on an addon's words puts the caret in the input", async ({
  page,
}) => {
  await openExample(page, "input-group", "text");
  const website = page.getByRole("textbox", { name: "Website" });
  // Where a person presses: the words, or whatever of the group stands over them.
  const press = async (words: string) => {
    const box = await page.getByText(words, { exact: true }).boundingBox();
    await page.mouse.click(
      (box?.x ?? 0) + (box?.width ?? 0) / 2,
      (box?.y ?? 0) + (box?.height ?? 0) / 2
    );
  };
  await press("https://");
  await expect(website).toBeFocused();
  await page.keyboard.type("example.com");
  await expect(website).toHaveValue("example.com");

  const storage = page.getByRole("textbox", { name: "Storage limit" });
  await press("GB");
  await expect(storage).toBeFocused();
});

test("the Field round the group names and describes its input", async ({
  page,
}) => {
  await openExample(page, "input-group", "text");
  await expect(
    page.getByRole("textbox", { name: "Website" })
  ).toHaveAccessibleDescription("Shown on your public profile.");
});

test("Clear empties the input, puts the caret back and goes until there is text", async ({
  page,
}) => {
  await openExample(page, "input-group", "search");
  const search = page.getByRole("searchbox", { name: "Search projects" });
  const clear = page.getByRole("button", { name: "Clear search" });
  await expect(search).toHaveValue("Spring launch");
  await clear.click();
  await expect(search).toHaveValue("");
  await expect(search).toBeFocused();
  await expect(clear).toBeHidden();
  await page.keyboard.type("Q");
  await expect(clear).toBeVisible();
});

test("Tab reaches the input, then the button inside the edge", async ({
  page,
}) => {
  await openExample(page, "input-group", "button");
  const link = page.getByRole("textbox", { name: "Invite link" });
  await link.focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Copy link" })).toBeFocused();
  await expect(link).toHaveAttribute("readonly", "");
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
});

test("a small group stands level with a small Input: 32px, the same words", async ({
  page,
}) => {
  await openExample(page, "input-group", "small");
  const plain = page.getByRole("textbox", { name: "Workspace name" });
  const grouped = page.getByRole("textbox", { name: "Workspace address" });
  const plainBox = await plain.boundingBox();
  const groupBox = await grouped.evaluate((input) => {
    const box = input.parentElement?.getBoundingClientRect();
    return box === undefined ? null : { y: box.y, height: box.height };
  });
  expect(plainBox?.height).toBe(32);
  expect(groupBox?.height).toBe(32);
  expect(groupBox?.y).toBe(plainBox?.y);
  const sizes = await Promise.all(
    [plain, grouped].map(
      async (input) =>
        await input.evaluate((element) => getComputedStyle(element).fontSize)
    )
  );
  expect(sizes[0]).toBe(sizes[1]);
});

test("the default and the large group are Input's heights", async ({
  page,
}) => {
  await openExample(page, "input-group", "sizes");
  const heights = await Promise.all(
    [/^Username, (?:default|medium)$/u, /^Username, large$/u].map(
      async (name) =>
        await page
          .getByRole("textbox", { name })
          .evaluate(
            (input) => input.parentElement?.getBoundingClientRect().height
          )
    )
  );
  expect(heights).toEqual([36, 44]);
});

test("a textarea in a group takes the caret from the words under it", async ({
  page,
}) => {
  await openExample(page, "input-group", "textarea");
  const reply = page.getByRole("textbox", { name: "Reply" });
  await page.getByText("Everyone in Finance sees it").click();

  await expect(reply).toBeFocused();
  await page.keyboard.type("First\nsecond");
  await expect(reply).toHaveValue("First\nsecond");
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
});

test("a long search scrolled to the caret is drawn once while it has focus", async ({
  page,
}) => {
  await openExample(page, "input-group", "search");
  const field = page.getByRole("searchbox", { name: "Search projects" });
  await field.fill(
    "Every team, every project and every policy that applies to each of them this year"
  );
  // Scrolled to its end, as the caret puts it there (the keys do not in every engine).
  await field.evaluate((input: HTMLInputElement) => {
    input.scrollLeft = input.scrollWidth;
  });
  expect(
    await field.evaluate((input: HTMLInputElement) => input.scrollLeft)
  ).toBeGreaterThan(0);
  expect(await drawsWordsOnce(field)).toBe(true);
});
