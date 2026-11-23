import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

import { openExample } from "./example.ts";

/** What a field's box looks like: the properties Input, Select and Native select share. */
const look = async (control: Locator) =>
  await control.evaluate((element) => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return {
      height: box.height,
      radius: style.borderTopLeftRadius,
      fill: style.backgroundColor,
      edge: style.boxShadow,
      font: style.fontSize,
      line: style.lineHeight,
      family: style.fontFamily,
      start: style.paddingInlineStart,
    };
  });

/** A control's edge and halo, once its transition to them has ended. */
const edge = async (control: Locator) =>
  await control.evaluate(async (element) => {
    await Promise.all(
      element.getAnimations().map(async (animation) => await animation.finished)
    );
    return getComputedStyle(element).boxShadow;
  });

test("closed, it is Input's and Select's box: the same height, corner, fill, edge, words and start", async ({
  page,
}) => {
  await openExample(page, "native-select", "fields");
  const input = await look(page.getByRole("textbox", { name: "Workspace" }));
  const select = await look(
    page.getByRole("combobox", { name: "Region", exact: true })
  );
  const native = await look(
    page.getByRole("combobox", { name: "Data region" })
  );
  expect(native).toEqual(input);
  expect(native).toEqual(select);
});

test("focus from the keys is Input's edge and halo, and a pointer's hover deepens the hairline as Input's does", async ({
  page,
}) => {
  await openExample(page, "native-select", "fields");
  const input = page.getByRole("textbox", { name: "Workspace" });
  const native = page.getByRole("combobox", { name: "Data region" });

  await native.hover();
  const nativeHover = await edge(native);
  await input.hover();
  expect(await edge(input)).toBe(nativeHover);

  await page.mouse.move(0, 0);
  const inputRest = await edge(input);
  await page.keyboard.press("Tab");
  await expect(input).toBeFocused();
  const inputFocus = await edge(input);
  expect(inputFocus).not.toBe(inputRest);
  // Tab past the Select's trigger to the native select.
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(native).toBeFocused();
  expect(await edge(native)).toBe(inputFocus);
});

test("the three sizes are Input's heights: 32, 36 and 44px", async ({
  page,
}) => {
  await openExample(page, "native-select", "sizes");
  const heights = await Promise.all(
    ["Sort rows by", "Sort projects by", "Sort people by"].map(async (name) => {
      const box = await page.getByRole("combobox", { name }).boundingBox();
      return box?.height;
    })
  );
  expect(heights).toEqual([32, 36, 44]);
});

test("on a phone its words are 16px at every size, so the page does not zoom in", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openExample(page, "native-select", "sizes");
  for (const name of ["Sort rows by", "Sort projects by", "Sort people by"]) {
    // oxlint-disable-next-line no-await-in-loop -- one control after the other
    await expect(page.getByRole("combobox", { name })).toHaveCSS(
      "font-size",
      "16px"
    );
  }
});

test("its Field names and describes it; the placeholder is muted while chosen, and a choice is in the ink", async ({
  page,
}) => {
  await openExample(page, "native-select", "basic");
  const control = page.getByRole("combobox", { name: "Release channel" });
  await expect(control).toHaveAccessibleDescription(
    "Which releases this workspace takes."
  );
  await expect(control).toHaveValue("");
  const muted = await control.evaluate(
    (element) => getComputedStyle(element).color
  );
  await control.selectOption("beta");
  await expect(control).toHaveValue("beta");
  const ink = await control.evaluate(
    (element) => getComputedStyle(element).color
  );
  expect(ink).not.toBe(muted);
});

test("in a form it is held back while empty, says why, and is sent under its Field's name and reset", async ({
  page,
}) => {
  await openExample(page, "native-select", "form");
  const control = page.getByRole("combobox", { name: "Release channel" });
  const status = page.getByRole("status");
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(control).toHaveAttribute("aria-invalid", "true");
  await expect(control).toHaveAccessibleDescription(
    "Choose the channel this release goes to."
  );
  await expect(control).toBeFocused();
  await expect(status).toHaveText("");

  await control.selectOption("beta");
  await expect(control).not.toHaveAttribute("aria-invalid", "true");
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(status).toHaveText("Sent: beta");

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(control).toHaveValue("");
  await expect(status).toHaveText("");
});

test("wrong from its Field it says so; out of use with its Field it cannot be reached or changed", async ({
  page,
}) => {
  await openExample(page, "native-select", "invalid");
  const wrong = page.getByRole("combobox", { name: "Team", exact: true });
  await expect(wrong).toHaveAttribute("aria-invalid", "true");
  await expect(wrong).toHaveAccessibleDescription(
    "Choose the team this project belongs to."
  );
  const off = page.getByRole("combobox", { name: "Billing team" });
  await expect(off).toBeDisabled();
  await expect(off).toHaveAccessibleDescription(
    "Only an owner can change who pays."
  );
});

test("an option in a group is chosen as any other, and an option out of use cannot be chosen", async ({
  page,
}) => {
  await openExample(page, "native-select", "groups");
  const control = page.getByRole("combobox", { name: "Time zone" });
  await expect(control).toHaveValue("Amsterdam");
  await expect(page.getByRole("option", { name: "Lisbon" })).toBeDisabled();
  await control.selectOption("Tokyo");
  await expect(control).toHaveValue("Tokyo");
});
