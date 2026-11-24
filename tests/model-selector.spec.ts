import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("the chip is named by the model it shows, and opens on the search, the column on the model's maker", async ({
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
  const makers = page.getByRole("listbox", { name: "Makers" });
  await expect(
    makers.getByRole("option", { name: "Anthropic" })
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("option", { name: /^Claude/u })).toHaveCount(3);
  await expect(
    page.getByRole("option", { name: "Claude Sonnet 5.5" })
  ).toHaveAttribute("aria-current", "true");
  await expect(
    page.getByRole("option", { name: "Claude Sonnet 5.5" })
  ).toHaveAccessibleDescription("Everyday writing and analysis");
});

test("a maker in the column shows its models; the arrows and a first letter move along the column", async ({
  page,
}) => {
  await openExample(page, "model-selector", "basic");
  await page.getByRole("button", { name: /^Model:/u }).click();
  const makers = page.getByRole("listbox", { name: "Makers" });
  await makers.getByRole("option", { name: "OpenAI" }).click();
  await expect(
    page.getByRole("option", { name: "GPT-5.2", exact: true })
  ).toBeVisible();
  await expect(page.getByRole("option", { name: /^Claude/u })).toHaveCount(0);

  await page.keyboard.press("ArrowDown");
  await expect(makers.getByRole("option", { name: "Google" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await expect(
    page.getByRole("option", { name: "Gemini 3 Pro" })
  ).toBeVisible();
  await page.keyboard.press("a");
  await expect(makers.getByRole("option", { name: "Anthropic" })).toBeFocused();
  await expect(
    page.getByRole("option", { name: "Claude Opus 5.5" })
  ).toBeVisible();
});

test("typing searches every maker, and says so when none matches", async ({
  page,
}) => {
  await openExample(page, "model-selector", "basic");
  await page.getByRole("button", { name: /^Model:/u }).click();
  const search = page.getByRole("combobox", { name: "Search models" });
  await search.fill("gemini");
  await expect(page.getByRole("option", { name: /^Gemini/u })).toHaveCount(2);
  await expect(
    page
      .getByRole("listbox", { name: "Makers" })
      .getByRole("option", { selected: true })
  ).toHaveCount(0);
  await search.fill("nothing like it");
  await expect(page.getByText("No models found")).toBeVisible();
});

test("the keys pick a model; the panel closes and focus goes back to the chip, which names it", async ({
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
  const picked = page.getByRole("button", { name: "Model: Gemini 3 Flash" });
  await expect(picked).toBeFocused();
  await expect(picked).toHaveAttribute("aria-expanded", "false");
});

test("a model that cannot be picked is passed by the keys and says why", async ({
  page,
}) => {
  await openExample(page, "model-selector", "basic");
  await page.getByRole("button", { name: /^Model:/u }).click();
  await page
    .getByRole("listbox", { name: "Makers" })
    .getByRole("option", { name: "OpenAI" })
    .click();
  const mini = page.getByRole("option", { name: "GPT-5.2 mini" });
  await expect(mini).toHaveAttribute("aria-disabled", "true");
  await expect(mini).toContainText("Not on this plan");
});

test("Escape closes it, focus goes back to the chip, and the page does not hear it", async ({
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

test("the star lists the favourites; a row's star adds or takes out its model without picking it", async ({
  page,
}) => {
  await openExample(page, "model-selector", "favorites");
  await page.getByRole("button", { name: "Model: Claude Opus 5.5" }).click();
  const makers = page.getByRole("listbox", { name: "Makers" });
  await makers.getByRole("option", { name: "Favourites" }).click();
  await expect(
    page.getByRole("option", { name: /^Claude|^Gemini|^GPT/u })
  ).toHaveCount(2);
  await expect(
    page.getByRole("option", { name: "Gemini 3 Pro" })
  ).toBeVisible();

  await makers.getByRole("option", { name: "Anthropic" }).click();
  await page.getByRole("option", { name: "Claude Sonnet 5.5" }).hover();
  await page
    .getByRole("button", { name: "Add Claude Sonnet 5.5 to favourites" })
    .click();
  await expect(
    page.getByText("Claude Sonnet 5.5 added to favourites")
  ).toBeAttached();
  await expect(
    page.getByRole("button", {
      name: "Remove Claude Sonnet 5.5 from favourites",
    })
  ).toBeVisible();
  // Not picked: the chip still names Opus, and the panel is open.
  await expect(
    page.getByRole("option", { name: "Claude Opus 5.5" })
  ).toHaveAttribute("aria-current", "true");
  await expect(
    page.getByRole("button", { name: "Model: Claude Opus 5.5" })
  ).toHaveAttribute("aria-expanded", "true");

  await makers.getByRole("option", { name: "Favourites" }).click();
  await expect(
    page.getByRole("option", { name: "Claude Sonnet 5.5" })
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Remove Claude Sonnet 5.5 from favourites" })
    .click();
  await expect(
    page.getByRole("option", { name: "Claude Sonnet 5.5" })
  ).toHaveCount(0);
});

test("from the search, the arrow toward the line's end stars the highlighted model", async ({
  page,
}) => {
  await openExample(page, "model-selector", "favorites");
  await page.getByRole("button", { name: "Model: Claude Opus 5.5" }).click();
  const search = page.getByRole("combobox", { name: "Search models" });
  await expect(search).toHaveAccessibleDescription(/stars or unstars/u);
  await search.pressSequentially("haiku");
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByText("Claude Haiku 5.5 added to favourites")
  ).toBeAttached();
  await expect(search).toBeFocused();
  await search.fill("");
  await page
    .getByRole("listbox", { name: "Makers" })
    .getByRole("option", { name: "Favourites" })
    .click();
  await expect(
    page.getByRole("option", { name: "Claude Haiku 5.5" })
  ).toBeVisible();
});

test("with effort, picking a model keeps the panel open, and the effort is set in the same opening", async ({
  page,
}) => {
  await openExample(page, "model-selector", "effort");
  const chip = page.getByRole("button", {
    name: "Model: Claude Opus 5.5, Medium",
  });
  await expect(chip).toContainText("Medium");
  await chip.click();
  const effort = page.getByRole("group", { name: "Thinking" });
  await expect(effort.getByRole("button")).toHaveCount(5);
  await expect(effort.getByRole("button", { name: "Medium" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );

  await page.getByRole("option", { name: "Claude Sonnet 5.5" }).click();
  await expect(page.getByText("Claude Sonnet 5.5 chosen")).toBeAttached();
  await expect(
    page.getByRole("button", { name: "Model: Claude Sonnet 5.5, Medium" })
  ).toHaveAttribute("aria-expanded", "true");
  await expect(effort.getByRole("button")).toHaveCount(3);
  await effort.getByRole("button", { name: "High", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Model: Claude Sonnet 5.5, High" })
  ).toBeVisible();

  await page.getByRole("option", { name: "Claude Haiku 5.5" }).click();
  await expect(effort).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Model: Claude Haiku 5.5" })
  ).toBeVisible();
});

test("Tab goes from the search to the column to the effort, and the arrows move the effort", async ({
  page,
}) => {
  await openExample(page, "model-selector", "effort");
  await page.getByRole("button", { name: /^Model:/u }).click();
  await expect(
    page.getByRole("combobox", { name: "Search models" })
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page
      .getByRole("listbox", { name: "Makers" })
      .getByRole("option", { name: "Anthropic" })
  ).toBeFocused();
  await page.keyboard.press("Tab");
  const effort = page.getByRole("group", { name: "Thinking" });
  await expect(effort.getByRole("button", { name: "Medium" })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("button", { name: "Model: Claude Opus 5.5, High" })
  ).toBeVisible();
});

test("Tab past the last stop closes the panel; with nothing after the chip, focus goes back to it", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "model");
  const chip = page.getByRole("button", {
    name: "Model: Claude Opus 5.5, Medium",
  });
  await chip.click();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(
    page
      .getByRole("group", { name: "Thinking" })
      .getByRole("button", { name: "Medium" })
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("combobox", { name: "Search models" })
  ).toBeHidden();
  await expect(chip).toBeFocused();
});

test("the chip that shows the level alone says the model in a tooltip", async ({
  page,
}) => {
  await openExample(page, "model-selector", "effort");
  await page
    .getByRole("button", { name: "Model: Claude Opus 5.5, Medium" })
    .hover();
  await expect(page.getByRole("tooltip")).toHaveText("Claude Opus 5.5, Medium");
});

test("in a prompt input, the model and its effort chosen in one opening go with the message", async ({
  page,
}) => {
  await openExample(page, "prompt-input", "model");
  await page
    .getByRole("button", { name: "Model: Claude Opus 5.5, Medium" })
    .click();
  await page
    .getByRole("listbox", { name: "Makers" })
    .getByRole("option", { name: "Google" })
    .click();
  await page.getByRole("option", { name: "Gemini 3 Pro" }).click();
  await page
    .getByRole("group", { name: "Thinking" })
    .getByRole("button", { name: "High", exact: true })
    .click();
  await page.keyboard.press("Escape");
  const chip = page.getByRole("button", {
    name: "Model: Gemini 3 Pro, High",
  });
  await expect(chip).toBeFocused();
  await page.getByRole("textbox", { name: "Message" }).click();
  await page.keyboard.type("Rename the helper");
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("Sent with Gemini 3 Pro, High: Rename the helper")
  ).toBeVisible();
});

test("right to left, the column stands at the start, on the right", async ({
  page,
}) => {
  await openExample(page, "model-selector", "basic");
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  await page.getByRole("button", { name: /^Model:/u }).click();
  const column = await page
    .getByRole("listbox", { name: "Makers" })
    .boundingBox();
  const models = await page
    .getByRole("listbox", { name: "Model" })
    .boundingBox();
  expect(column?.x ?? 0).toBeGreaterThan(models?.x ?? 0);
});

test("the chip stays the same control while the panel is open: picking a model without levels leaves it open and one press closes it", async ({
  page,
}) => {
  await openExample(page, "model-selector", "effort");
  await page
    .getByRole("button", { name: "Model: Claude Opus 5.5, Medium" })
    .click();
  await page.getByRole("option", { name: "Claude Haiku 5.5" }).click();
  const chip = page.getByRole("button", { name: "Model: Claude Haiku 5.5" });
  await expect(chip).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("option", { name: "Claude Opus 5.5" }).click();
  const back = page.getByRole("button", {
    name: "Model: Claude Opus 5.5, Max",
  });
  await expect(back).toHaveAttribute("aria-expanded", "true");
  await back.click();
  await expect(
    page.getByRole("combobox", { name: "Search models" })
  ).toBeHidden();
});

test.describe("on a narrow touch phone", () => {
  test.use({
    viewport: { width: 320, height: 640 },
    hasTouch: true,
    isMobile: true,
  });

  test("every effort level stands inside the track, and can be pressed", async ({
    page,
  }) => {
    await openExample(page, "prompt-input", "model");
    await page
      .getByRole("button", { name: "Model: Claude Opus 5.5, Medium" })
      .click();
    const effort = page.getByRole("group", { name: "Thinking" });
    const max = effort.getByRole("button", { name: "Max" });
    const panel = await effort.boundingBox();
    const end = await max.boundingBox();
    expect((end?.x ?? 0) + (end?.width ?? 0)).toBeLessThanOrEqual(
      (panel?.x ?? 0) + (panel?.width ?? 0)
    );
    await max.click();
    await expect(
      page.getByRole("button", { name: "Model: Claude Opus 5.5, Max" })
    ).toBeVisible();
  });

  test("the search takes a finger", async ({ page }) => {
    await openExample(page, "model-selector", "basic");
    await page.getByRole("button", { name: /^Model:/u }).click();
    const box = await page
      .getByRole("combobox", { name: "Search models" })
      .boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });
});

test("a chip that says the model's name says it in ink, its chevron quieter, as the original's", async ({
  page,
}) => {
  await openExample(page, "model-selector", "basic");
  const chip = page.getByRole("button", { name: /^Model/u });
  const look = await chip.evaluate((element) => {
    const probe = document.createElement("span");
    probe.style.color = "var(--damsko-foreground)";
    element.append(probe);
    const ink = getComputedStyle(probe).color;
    probe.remove();
    const name = element.querySelector("[data-slot=model-selector-name]");
    // The chip's last part, after its name: the chevron.
    const chevron = name?.parentElement?.lastElementChild ?? null;
    return {
      ink,
      name: name === null ? "" : getComputedStyle(name).color,
      chevron: chevron === null ? "" : getComputedStyle(chevron).color,
    };
  });
  expect(look.name).toBe(look.ink);
  expect(look.chevron).not.toBe(look.ink);
});
