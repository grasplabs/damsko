import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { openExample } from "./example.ts";

// The examples hold the mode and the theme and write them on their own subtree, as a product does.

/** The colour scheme the element is drawn in: what the chosen mode turned it to. */
const schemeOf = async (element: Locator): Promise<string> =>
  await element.evaluate((node) => getComputedStyle(node).colorScheme);

/** The theme the caller wrote round the element. */
const themeOf = async (element: Locator): Promise<string> =>
  await element.evaluate((node) => {
    const holder = node.closest<HTMLElement>("[data-theme]:not(html)");
    return holder?.dataset.theme ?? "";
  });

const open = async (page: Page, example: string) => {
  await openExample(page, "theme-toggle", example);
};

test("choosing a mode hands it to the caller, which applies it", async ({
  page,
}) => {
  await open(page, "basic");
  const group = page.getByRole("radiogroup", { name: "Theme" });
  await expect(group.getByRole("radio", { name: "Light" })).toBeChecked();
  await expect.poll(async () => await schemeOf(group)).toBe("light");

  await group.getByText("Dark", { exact: true }).click();
  await expect(group.getByRole("radio", { name: "Dark" })).toBeChecked();
  await expect.poll(async () => await schemeOf(group)).toBe("dark");

  await group.getByText("System", { exact: true }).click();
  await expect(group.getByRole("radio", { name: "System" })).toBeChecked();
  await expect.poll(async () => await schemeOf(group)).toBe("light dark");
});

test("its name is said once, by the radio group", async ({ page }) => {
  await open(page, "basic");
  // Only the group carries it: a name on the root as well would be said twice, on no role.
  const named = page.getByLabel("Theme", { exact: true });
  await expect(named).toHaveCount(1);
  await expect(named).toHaveRole("radiogroup");
});

test("arrows move and choose, Home and End go to the ends", async ({
  page,
}) => {
  await open(page, "basic");
  const group = page.getByRole("radiogroup", { name: "Theme" });
  const radio = (name: string) => group.getByRole("radio", { name });
  await radio("Light").focus();
  await page.keyboard.press("ArrowRight");
  await expect(radio("Dark")).toBeChecked();
  await expect(radio("Dark")).toBeFocused();
  await page.keyboard.press("End");
  await expect(radio("System")).toBeChecked();
  await expect(radio("System")).toBeFocused();
  await page.keyboard.press("Home");
  await expect(radio("Light")).toBeChecked();
  await expect(radio("Light")).toBeFocused();
});

test("the icon button goes to the next mode, and its name says where it is and where it goes", async ({
  page,
}) => {
  await open(page, "icon");
  const button = page.getByRole("button", { name: /^Theme, /u }).first();
  await expect(button).toHaveAccessibleName("Theme, Dark. Switch to System");
  await expect.poll(async () => await schemeOf(button)).toBe("dark");
  await button.click();
  await expect(button).toHaveAccessibleName("Theme, System. Switch to Light");
  await expect.poll(async () => await schemeOf(button)).toBe("light dark");
  await button.click();
  await expect(button).toHaveAccessibleName("Theme, Light. Switch to Dark");
  await expect.poll(async () => await schemeOf(button)).toBe("light");
  await page.keyboard.press("Enter");
  await expect(button).toHaveAccessibleName("Theme, Dark. Switch to System");
});

test("resting on a theme's tile, or tabbing to it, shows that theme; leaving puts the chosen one back", async ({
  page,
}) => {
  await open(page, "picker");
  const themes = page.getByRole("radiogroup", { name: "Colours" });
  const evergreen = themes.getByRole("radio", { name: /^Evergreen/u });
  await expect.poll(async () => await themeOf(themes)).toBe("evergreen");
  await themes.getByRole("radio", { name: /^Pine/u }).hover();
  await expect.poll(async () => await themeOf(themes)).toBe("pine");
  // Shown, not chosen.
  await expect(evergreen).toBeChecked();
  await page.mouse.move(2, 2);
  await expect.poll(async () => await themeOf(themes)).toBe("evergreen");
  // The keyboard: an arrow chooses, as a radio group does, so the theme under focus is the chosen one.
  await evergreen.focus();
  await page.keyboard.press("ArrowRight");
  await expect(themes.getByRole("radio", { name: /^Pine/u })).toBeChecked();
  await expect.poll(async () => await themeOf(themes)).toBe("pine");
});

test("the picker offers the modes and the caller's themes as two named groups", async ({
  page,
}) => {
  await open(page, "picker");
  const modes = page.getByRole("radiogroup", { name: "Appearance" });
  const themes = page.getByRole("radiogroup", { name: "Colours" });
  await expect(modes.getByRole("radio")).toHaveCount(3);
  await expect(modes.getByRole("radio", { name: /^System/u })).toBeChecked();
  await expect(themes.getByRole("radio")).toHaveCount(3);
  await expect(
    themes.getByRole("radio", { name: /^Evergreen/u })
  ).toBeChecked();

  await themes.getByRole("radio", { name: /^Paper/u }).click();
  await expect(themes.getByRole("radio", { name: /^Paper/u })).toBeChecked();
  await expect.poll(async () => await themeOf(themes)).toBe("paper");

  await modes.getByRole("radio", { name: /^Dark/u }).click();
  await expect(modes.getByRole("radio", { name: /^Dark/u })).toBeChecked();
  await expect.poll(async () => await schemeOf(modes)).toBe("dark");
});

test("on the agent bridge it is one part named Theme, whose value is the mode", async ({
  page,
}) => {
  await open(page, "agent");
  await page.waitForFunction(() => "damskoAgent" in window);
  const run = await page.evaluate(async () => {
    const agent = window.damskoAgent;
    if (agent === undefined) {
      throw new Error("no agent bridge on the page");
    }
    const act = async (action: string, value: string) => {
      const { ok, error } = await agent.act({
        steps: [{ ref: "Theme", action, args: [value] }],
      });
      return { ok, message: error?.message ?? "" };
    };
    const entries = agent
      .snapshot()
      .filter((entry) => /^theme-(?:toggle|switch)$/u.test(entry.component))
      .map(({ label, value, items }) => ({
        label,
        value,
        items: (items ?? []).map((item) => item.label),
      }));
    return {
      entries,
      mode: await act("setValue", "Dark"),
      theme: await act("setTheme", "Pine"),
      wrongMode: await act("setValue", "Sepia"),
      wrongTheme: await act("setTheme", "Neon"),
    };
  });
  expect(run.entries).toEqual([
    { label: "Theme", value: "light", items: ["Light", "Dark", "System"] },
  ]);
  expect(run.mode.ok).toBe(true);
  expect(run.theme.ok).toBe(true);
  expect(run.wrongMode.ok).toBe(false);
  expect(run.wrongMode.message).toContain("Light, Dark, System");
  expect(run.wrongTheme.ok).toBe(false);
  expect(run.wrongTheme.message).toContain("Evergreen, Pine, Paper");

  const group = page.getByRole("radiogroup", { name: "Theme" });
  await expect(group.getByRole("radio", { name: "Dark" })).toBeChecked();
  await expect.poll(async () => await schemeOf(group)).toBe("dark");
  await expect.poll(async () => await themeOf(group)).toBe("pine");
});

test.describe("on a phone", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });

  test("every segment and the icon button take a finger's 44px", async ({
    page,
  }) => {
    await open(page, "basic");
    const heights = await page
      .getByRole("radiogroup", { name: "Theme" })
      .getByRole("radio")
      .evaluateAll((radios) =>
        radios.map(
          (radio) => radio.closest("label")?.getBoundingClientRect().height ?? 0
        )
      );
    expect(heights).toHaveLength(3);
    for (const height of heights) {
      expect(height).toBeGreaterThanOrEqual(44);
    }
    await open(page, "icon");
    // The button stays small to the eye; an unseen target inside it reaches 44px.
    const target = await page
      .getByRole("button", { name: /^Theme, /u })
      .first()
      .evaluate((button) => {
        const sizes = [button, ...button.querySelectorAll("span")].map((each) =>
          each.getBoundingClientRect()
        );
        return {
          height: Math.max(...sizes.map((each) => each.height)),
          width: Math.max(...sizes.map((each) => each.width)),
        };
      });
    expect(target.height).toBeGreaterThanOrEqual(44);
    expect(target.width).toBeGreaterThanOrEqual(44);
  });

  test("the picker shows two tiles a row", async ({ page }) => {
    await open(page, "picker");
    const tops = await page
      .getByRole("radiogroup", { name: "Appearance" })
      .getByRole("radio")
      .evaluateAll((radios) =>
        radios.map((radio) => Math.round(radio.getBoundingClientRect().top))
      );
    expect(tops[0]).toBe(tops[1]);
    expect(tops[2]).toBeGreaterThan(tops[0] ?? 0);
  });
});

test("the keyboard's ring is drawn inside the chosen segment, clear of its neighbours", async ({
  page,
}) => {
  await open(page, "basic");
  const group = page.getByRole("radiogroup", { name: "Theme" });
  await page.keyboard.press("Tab");
  await expect(group.getByRole("radio", { name: "Light" })).toBeFocused();
  const segment = group.locator("label").filter({
    has: page.getByRole("radio", { name: "Light" }),
  });
  await expect(segment).toHaveCSS("outline-style", "solid");
  await expect(segment).toHaveCSS("outline-width", "2px");
  await expect(segment).toHaveCSS("outline-offset", "-2px");
});
