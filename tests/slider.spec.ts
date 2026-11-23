import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("an agent finds the slider by its label and sets its value", async ({
  page,
}) => {
  await openExample(page, "slider", "agent");
  const volume = page.getByRole("slider", { name: "Volume" });
  const found = await page.evaluate(
    () =>
      window.damskoAgent
        ?.snapshot()
        .some((entry) => entry.label === "Volume") === true
  );
  expect(found).toBe(true);
  const ok = await page.evaluate(async () => {
    const result = await window.damskoAgent?.act({
      steps: [{ ref: "Volume", action: "setValue", args: [70] }],
    });
    return result?.ok === true;
  });
  expect(ok).toBe(true);
  await expect(volume).toHaveValue("70");
  await volume.focus();
  await page.keyboard.press("ArrowRight");
  await expect(volume).toHaveValue("71");
});

test("the keys move it a step, ten steps and to its ends, and the value beside the label follows", async ({
  page,
}) => {
  await openExample(page, "slider", "basic");
  const volume = page.getByRole("slider", { name: "Volume" });
  await page.keyboard.press("Tab");
  await expect(volume).toBeFocused();
  await expect(volume).toHaveValue("40");
  await page.keyboard.press("ArrowRight");
  await expect(volume).toHaveValue("41");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowDown");
  await expect(volume).toHaveValue("39");
  await page.keyboard.press("PageUp");
  await expect(volume).toHaveValue("49");
  await page.keyboard.press("End");
  await expect(volume).toHaveValue("100");
  await expect(page.getByRole("status")).toHaveText("100");
  await page.keyboard.press("Home");
  await expect(volume).toHaveValue("0");
});

test("the keyboard's ring stands on the thumb", async ({ page }) => {
  await openExample(page, "slider", "basic");
  const volume = page.getByRole("slider", { name: "Volume" });
  const ring = async () =>
    await volume
      .locator("..")
      .evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(await ring()).toBe("none");
  await page.keyboard.press("Tab");
  await expect(volume).toBeFocused();
  expect(await ring()).toBe("solid");
});

test("right to left, the scale runs from the right: ArrowRight lowers it", async ({
  page,
}) => {
  await openExample(page, "slider", "basic");
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  const volume = page.getByRole("slider", { name: "Volume" });
  await volume.focus();
  await page.keyboard.press("ArrowRight");
  await expect(volume).toHaveValue("39");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(volume).toHaveValue("41");
});

test("a range has two named thumbs, reached by Tab, that never pass each other", async ({
  page,
}) => {
  await openExample(page, "slider", "range");
  await expect(page.getByRole("group", { name: "Team size" })).toBeVisible();
  const smallest = page.getByRole("slider", { name: "Smallest team" });
  const largest = page.getByRole("slider", { name: "Largest team" });
  await expect(smallest).toHaveValue("10");
  await expect(largest).toHaveValue("50");
  await smallest.focus();
  await page.keyboard.press("Tab");
  await expect(largest).toBeFocused();
  await page.keyboard.press("Home");
  await expect(largest).toHaveValue("10");
  await expect(smallest).toHaveValue("10");
  await smallest.focus();
  await page.keyboard.press("End");
  await expect(smallest).toHaveValue("10");
  await expect(page.getByRole("status")).toHaveText(/^10\s?–\s?10$/u);
});

test("its sentence describes it, and the value reads as its format writes it", async ({
  page,
}) => {
  await openExample(page, "slider", "description");
  const share = page.getByRole("slider", { name: "Share of the budget" });
  await expect(share).toHaveAccessibleDescription(
    "The part of this month's budget the campaign may spend."
  );
  await expect(share).toHaveAttribute("aria-valuetext", "30%");
  await share.focus();
  await page.keyboard.press("ArrowRight");
  await expect(share).toHaveAttribute("aria-valuetext", "31%");
});

test("disabled, it keeps its value and takes no focus", async ({ page }) => {
  await openExample(page, "slider", "disabled");
  const days = page.getByRole("slider", { name: "Retention in days" });
  await expect(days).toBeDisabled();
  await expect(days).toHaveValue("90");
  await expect(days).toHaveAccessibleDescription(
    "Set by an owner for the whole workspace."
  );
});

test("on a touch screen a press beside the 16px thumb still takes it", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await openExample(page, "slider", "basic");
  const thumb = page.getByRole("slider", { name: "Volume" }).locator("..");
  const missed = await thumb.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    return [
      [0, -18],
      [0, 18],
      [-18, 0],
      [18, 0],
    ].filter(([dx = 0, dy = 0]) => {
      const hit = document.elementFromPoint(x + dx, y + dy);
      return !(hit !== null && element.contains(hit));
    }).length;
  });
  expect(missed).toBe(0);
  await context.close();
});

test("in a Field, its FieldLabel names it and its FieldDescription describes it", async ({
  page,
}) => {
  await openExample(page, "slider", "field");
  const brightness = page.getByRole("slider", { name: "Brightness" });
  await expect(brightness).toHaveValue("70");
  await expect(brightness).toHaveAccessibleDescription(
    "How bright the screen is at night."
  );
});

test("upright, Arrow Up raises it, and it stands taller than wide", async ({
  page,
}) => {
  await openExample(page, "slider", "vertical");
  const level = page.getByRole("slider", { name: "Level" });
  await expect(level).toHaveAttribute("aria-orientation", "vertical");
  await level.focus();
  await page.keyboard.press("ArrowUp");
  await expect(level).toHaveValue("61");
  const thumb = await level.locator("..").boundingBox();
  const track = await level.locator("../..").boundingBox();
  expect(track?.height ?? 0).toBeGreaterThan(track?.width ?? 0);
  // A higher value stands higher on the track.
  await page.keyboard.press("End");
  await expect(level).toHaveValue("100");
  const top = await level.locator("..").boundingBox();
  expect(top?.y ?? 0).toBeLessThan(thumb?.y ?? 0);
});

// ---- Levels ----------------------------------------------------------------------------------------

test("levels: the arrows step, Home and End jump, and the level is said in words", async ({
  page,
}) => {
  await openExample(page, "slider", "levels");
  const effort = page.getByRole("slider", { name: "Effort" });
  await expect(effort).toHaveAttribute("aria-valuetext", "High");
  await effort.focus();
  await page.keyboard.press("ArrowRight");
  await expect(effort).toHaveAttribute("aria-valuetext", "Extra high");
  await page.keyboard.press("ArrowRight");
  await expect(effort).toHaveAttribute("aria-valuetext", "Max");
  await page.keyboard.press("ArrowRight");
  await expect(effort).toHaveAttribute("aria-valuetext", "Max");
  await page.keyboard.press("Home");
  await expect(effort).toHaveAttribute("aria-valuetext", "Low");
  await page.keyboard.press("ArrowLeft");
  await expect(effort).toHaveAttribute("aria-valuetext", "Low");
  await page.keyboard.press("End");
  await expect(effort).toHaveAttribute("aria-valuetext", "Max");
  // The scale's two ends are named under it, and only those.
  await expect(page.getByText("Low", { exact: true })).toBeVisible();
  await expect(page.getByText("Max", { exact: true })).toBeVisible();
  await expect(page.getByText("Medium", { exact: true })).toHaveCount(0);
});

test("levels: a press anywhere on the row goes to the nearest level, and the row is 44px tall", async ({
  page,
}) => {
  await openExample(page, "slider", "levels");
  const effort = page.getByRole("slider", { name: "Effort" });
  const row = await effort.locator("../../..").boundingBox();
  expect(row?.height).toBe(44);
  await page.mouse.click(
    (row?.x ?? 0) + 2,
    (row?.y ?? 0) + (row?.height ?? 0) / 2
  );
  await expect(effort).toHaveAttribute("aria-valuetext", "Low");
  await expect(effort).toBeFocused();
  await page.mouse.click(
    (row?.x ?? 0) + (row?.width ?? 0) - 2,
    (row?.y ?? 0) + (row?.height ?? 0) / 2
  );
  await expect(effort).toHaveAttribute("aria-valuetext", "Max");
});

test("levels: right to left, the thumb stands at its level measured from the right", async ({
  page,
}) => {
  await openExample(page, "slider", "levels");
  const effort = page.getByRole("slider", { name: "Effort" });
  const place = async () => {
    const thumb = await effort.locator("..").boundingBox();
    const track = await effort.locator("../..").boundingBox();
    return (
      ((thumb?.x ?? 0) + (thumb?.width ?? 0) / 2 - (track?.x ?? 0)) /
      (track?.width ?? 1)
    );
  };
  await effort.focus();
  await page.keyboard.press("Home");
  const left = await place();
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  await expect.poll(place).toBeGreaterThan(1 - left - 0.02);
});

test("levels: out of use, it takes no focus and keeps its level", async ({
  page,
}) => {
  await openExample(page, "slider", "levels-disabled");
  const effort = page.getByRole("slider", { name: "Effort" });
  await expect(effort).toBeDisabled();
  await expect(effort).toHaveAttribute("aria-valuetext", "Medium");
});

test("levels: in a popup, the small size names its level in the trigger", async ({
  page,
}) => {
  await openExample(page, "slider", "levels-popup");
  await page.getByRole("button", { name: "Effort: High" }).click();
  const effort = page.getByRole("slider", { name: "Effort" });
  await expect(effort).toBeVisible();
  await effort.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(effort).toHaveAttribute("aria-valuetext", "Medium");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Effort: Medium" })
  ).toBeVisible();
});

test("levels: the top level is its own state; below it the dots stand still", async ({
  page,
}) => {
  await openExample(page, "slider", "levels-sheet");
  await expect(page.getByRole("slider")).toHaveCount(5);
  await expect(
    page.getByRole("slider", { name: "Effort at Max" })
  ).toHaveAttribute("aria-valuetext", "Max");
  const glow = async (name: string) =>
    await page
      .getByRole("slider", { name })
      .locator("..")
      .evaluate((thumb) => getComputedStyle(thumb).boxShadow);
  expect(await glow("Effort at Max")).not.toBe(await glow("Effort at High"));
});

test("levels: its SliderLabel names it over the track, and with no words over the track its aria-label does", async ({
  page,
}) => {
  await openExample(page, "slider", "levels");
  const named = page.getByRole("slider", { name: "Effort" });
  await expect(named).toHaveCount(1);
  await page.getByText("Effort", { exact: true }).click();
  await expect(named).toBeFocused();
  await openExample(page, "slider", "levels-sheet");
  await expect(page.getByRole("slider", { name: /^Effort at /u })).toHaveCount(
    5
  );
});
