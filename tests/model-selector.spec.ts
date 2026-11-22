import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("the trigger is named by the model it shows, and opens on the search", async ({
  page,
}) => {
  await openExample(page, "model-selector", "basic");
  const trigger = page.getByRole("button", {
    name: "Model: Claude Sonnet 5.5",
  });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("combobox", { name: "Search models" })
  ).toBeFocused();
  await expect(
    page.getByRole("option", { name: /Claude Sonnet 5\.5/u })
  ).toHaveAttribute("aria-current", "true");
});

test("typing filters the models, and says so when none matches", async ({
  page,
}) => {
  await openExample(page, "model-selector", "basic");
  await page.getByRole("button", { name: /^Model:/u }).click();
  const search = page.getByRole("combobox", { name: "Search models" });
  await search.fill("gemini");
  await expect(page.getByRole("option")).toHaveCount(2);
  await expect(
    page.getByRole("option", { name: /Gemini 3 Pro/u })
  ).toBeVisible();
  await expect(page.getByRole("option", { name: /Claude Opus/u })).toBeHidden();
  await search.fill("nothing like it");
  await expect(page.getByText("No models")).toBeVisible();
});

test("the keys pick a model; the list closes and focus goes back to the trigger, which names it", async ({
  page,
}) => {
  await openExample(page, "model-selector", "basic");
  const trigger = page.getByRole("button", { name: /^Model:/u });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const search = page.getByRole("combobox", { name: "Search models" });
  await expect(search).toBeFocused();
  await search.pressSequentially("flash");
  await page.keyboard.press("Enter");
  await expect(search).toBeHidden();
  const picked = page.getByRole("button", {
    name: "Model: Gemini 3 Flash",
  });
  await expect(picked).toBeFocused();
  await expect(picked).toHaveAttribute("aria-expanded", "false");
});

test("a model that cannot be picked is passed by the keys and says why", async ({
  page,
}) => {
  await openExample(page, "model-selector", "basic");
  await page.getByRole("button", { name: /^Model:/u }).click();
  const mini = page.getByRole("option", { name: /GPT-5\.2 mini/u });
  await expect(mini).toHaveAttribute("aria-disabled", "true");
  await expect(mini).toContainText("Not on this plan");
});

test("Escape closes it, focus goes back to the trigger, and the page does not hear it", async ({
  page,
}) => {
  await openExample(page, "model-selector", "basic");
  const heard = await page.evaluateHandle(() => {
    const keys: string[] = [];
    document.addEventListener("keydown", (event) => {
      keys.push(event.key);
    });
    return keys;
  });
  const trigger = page.getByRole("button", { name: /^Model:/u });
  await trigger.click();
  await page.getByRole("combobox", { name: "Search models" }).fill("gpt");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("combobox", { name: "Search models" })
  ).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(await heard.evaluate((keys) => keys.includes("Escape"))).toBe(false);
});

test("the footer holds the product's own controls, under the list", async ({
  page,
}) => {
  await openExample(page, "model-selector", "footer");
  await page.getByRole("button", { name: /^Model: Claude Opus 5\.5/u }).click();
  const effort = page.getByRole("group", { name: "Effort" });
  await expect(effort).toBeVisible();
  await effort.getByRole("button", { name: "High" }).click();
  await expect(
    page.getByRole("button", { name: "Model: Claude Opus 5.5, High" })
  ).toBeVisible();
});

test("beside the model, a second menu picks how hard it thinks; each trigger names its choice", async ({
  page,
}) => {
  await openExample(page, "model-selector", "effort");
  const model = page.getByRole("button", { name: "Model: Claude Sonnet 5.5" });
  await model.click();
  await page.getByRole("option", { name: /^GPT-5\.2/u }).click();
  await expect(
    page.getByRole("button", { name: "Model: GPT-5.2" })
  ).toBeFocused();

  const effort = page.getByRole("button", { name: "Effort: Medium" });
  await effort.click();
  await page.getByRole("menuitemradio", { name: "High" }).click();
  await expect(
    page.getByRole("button", { name: "Effort: High" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Model: GPT-5.2" })
  ).toBeVisible();
});
