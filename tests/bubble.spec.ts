import { expect, test } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

test("the person's bubble stands at the end of the line, the other side's at the start", async ({
  page,
}) => {
  await openExample(page, "bubble", "alignment");
  const start = await page
    .getByText("This one stands at the start of the line")
    .boundingBox();
  const end = await page.getByText("This one stands at the end").boundingBox();
  const column = await page
    .getByText("This one stands at the end")
    .evaluate((element) => {
      const box = element.parentElement?.parentElement?.getBoundingClientRect();
      return { x: box?.x ?? 0, width: box?.width ?? 0 };
    });
  expect(start).not.toBeNull();
  expect(end).not.toBeNull();
  expect(Math.abs((start?.x ?? 0) - column.x)).toBeLessThanOrEqual(1);
  expect(
    Math.abs((end?.x ?? 0) + (end?.width ?? 0) - column.x - column.width)
  ).toBeLessThanOrEqual(1);
});

test("a framed bubble keeps to most of the line; a ghost one spans it", async ({
  page,
}) => {
  await openExample(page, "bubble", "variants");
  const width = async (text: string) =>
    await page.getByText(text).evaluate((element) => {
      const column = element.closest("[data-slot=bubble]")?.parentElement;
      return (
        element.getBoundingClientRect().width /
        (column?.getBoundingClientRect().width ?? 1)
      );
    });
  expect(await width("The ghost bubble has no frame")).toBeGreaterThan(0.95);
  expect(
    await width("The muted bubble: a person's message in a chat.")
  ).toBeLessThanOrEqual(0.8);
});

test("replies drawn as buttons are reached by Tab, named by their words, and pressed", async ({
  page,
}) => {
  await openExample(page, "bubble", "buttons");
  const first = page.getByRole("button", { name: "I forgot my password" });
  const second = page.getByRole("button", {
    name: "I need help with an invoice",
  });
  await first.focus();
  await page.keyboard.press("Tab");
  await expect(second).toBeFocused();
  expect(await hasFocusRing(second)).toBe(true);
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("You chose: I need help with an invoice.")
  ).toBeVisible();
});

test("a row of reactions is one picture with a name, laid over the bubble's edge", async ({
  page,
}) => {
  await openExample(page, "bubble", "reactions");
  const reactions = page.getByRole("img", {
    name: "Reactions: thumbs up, eyes",
  });
  await expect(reactions).toBeVisible();
  const pill = await reactions.boundingBox();
  const bubble = await page
    .getByText("The draft is ready for review.")
    .boundingBox();
  // Over the foot: it starts above the bubble's edge and ends below it.
  const foot = (bubble?.y ?? 0) + (bubble?.height ?? 0);
  expect(pill?.y ?? 0).toBeLessThan(foot);
  expect((pill?.y ?? 0) + (pill?.height ?? 0)).toBeGreaterThan(foot);
});
