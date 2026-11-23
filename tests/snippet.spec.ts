import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { fixedTime, hasFocusRing, openExample } from "./example.ts";

test.use({ permissions: ["clipboard-read", "clipboard-write"] });

const clipboard = async (page: Page) =>
  await page.evaluate(async () => await navigator.clipboard.readText());

const command = "shadcn@4.23.0 add @damsko/button";

test("a press on the button copies the value and says so once", async ({
  page,
}) => {
  await openExample(page, "snippet", "basic");
  await page.getByRole("button", { name: "Copy the install command" }).click();
  await expect.poll(async () => await clipboard(page)).toContain(command);
  await expect(
    page.getByRole("status").filter({ hasText: /^Copied$/u })
  ).toHaveCount(1);
});

test("a press on the value copies it too", async ({ page }) => {
  await openExample(page, "snippet", "basic");
  await page.getByText(command, { exact: false }).click();
  await expect.poll(async () => await clipboard(page)).toContain(command);
});

for (const key of ["Enter", "Space"]) {
  test(`${key} on its one tab stop copies`, async ({ page }) => {
    await openExample(page, "snippet", "basic");
    await page.keyboard.press("Tab");
    const button = page.getByRole("button", {
      name: "Copy the install command",
    });
    await expect(button).toBeFocused();
    await page.keyboard.press(key);
    await expect.poll(async () => await clipboard(page)).toContain(command);
  });
}

test("the button's tooltip says what it copies", async ({ page }) => {
  await openExample(page, "snippet", "basic", {
    time: fixedTime,
  });
  await page.getByRole("button", { name: "Copy the install command" }).hover();
  await page.clock.runFor(600);
  await expect(page.getByRole("tooltip")).toHaveText(
    "Copy the install command"
  );
});

test("each of a list copies its own value", async ({ page }) => {
  await openExample(page, "snippet", "sizes");
  const buttons = page.getByRole("button", { name: "Copy the user ID" });
  await expect(buttons).toHaveCount(2);
  await buttons.first().click();
  await expect.poll(async () => await clipboard(page)).toBe("usr_4f81c2");
});

test("a long value stays on one line inside its field, and copies whole", async ({
  page,
}) => {
  await openExample(page, "snippet", "long");
  const value = "workspace_8f3a2c91-d4e7-4b6a-905f-1c2d3e4b5a69";
  const shown = page.getByText(value);
  const button = page.getByRole("button", { name: "Copy the workspace ID" });
  const [text, press] = await Promise.all([
    shown.boundingBox(),
    button.boundingBox(),
  ]);
  // One line: no taller than the button beside it, and the button on the same line.
  expect(text?.height ?? 0).toBeLessThanOrEqual(press?.height ?? 0);
  expect(Math.abs((text?.y ?? 0) - (press?.y ?? 0))).toBeLessThan(
    press?.height ?? 0
  );
  expect(text?.width ?? 0).toBeLessThanOrEqual(260);
  await button.click();
  await expect.poll(async () => await clipboard(page)).toBe(value);
});

test("a long value that scrolls is still one tab stop", async ({ page }) => {
  await openExample(page, "snippet", "long");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Copy the workspace ID" })
  ).toBeFocused();
});

test("the field has one fill: under the pointer and pressed, the button draws none of its own, and its icon goes from quiet to ink", async ({
  page,
}) => {
  await openExample(page, "snippet", "basic");
  const button = page.getByRole("button", {
    name: "Copy the install command",
  });
  const eased = async () => {
    await button.evaluate(async (node) => {
      await Promise.all(
        node.getAnimations().map(async (ease) => await ease.finished)
      );
    });
  };
  const ink = async (token: string) =>
    await button.evaluate((node, name) => {
      const probe = document.createElement("span");
      probe.style.color = `var(${name})`;
      node.append(probe);
      const { color } = getComputedStyle(probe);
      probe.remove();
      return color;
    }, token);
  await expect(button).toHaveCSS(
    "color",
    await ink("--damsko-muted-foreground")
  );
  await button.hover();
  await eased();
  await expect(button).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(button).toHaveCSS("color", await ink("--damsko-foreground"));
  await expect(button).toHaveCSS("text-decoration-line", "none");
  await page.mouse.down();
  await eased();
  await expect(button).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await page.mouse.up();
});

test("the keyboard's ring goes round the whole field, not the button inside it", async ({
  page,
}) => {
  await openExample(page, "snippet", "basic");
  await page.keyboard.press("Tab");
  const button = page.getByRole("button", {
    name: "Copy the install command",
  });
  await expect(button).toBeFocused();
  const [onButton, onField] = await button.evaluate((node) =>
    [node, node.closest("label")].map((element) => {
      if (element === null) {
        return false;
      }
      const style = getComputedStyle(element);
      return (
        style.outlineStyle !== "none" &&
        style.outlineWidth !== "0px" &&
        style.outlineColor !== "rgba(0, 0, 0, 0)"
      );
    })
  );
  expect({ button: onButton, field: onField }).toEqual({
    button: false,
    field: true,
  });
  expect(await hasFocusRing(button)).toBe(true);
});

test("once copied, the tick is in the result's own colour", async ({
  page,
}) => {
  await openExample(page, "snippet", "basic");
  const button = page.getByRole("button", {
    name: "Copy the install command",
  });
  await button.click();
  const mint = await button.evaluate((node) => {
    const probe = document.createElement("span");
    probe.style.color = "var(--damsko-mint-deep)";
    node.append(probe);
    const { color } = getComputedStyle(probe);
    probe.remove();
    return color;
  });
  await expect(button).toHaveCSS("color", mint);
});

test("in each size the words start 12px in, the icon ends 12px in, and the icon stands clear of the words by the room round it", async ({
  page,
}) => {
  await openExample(page, "snippet", "sizes");
  const buttons = page.getByRole("button", { name: "Copy the user ID" });
  await expect(buttons).toHaveCount(2);
  const measured = await buttons.evaluateAll((nodes) =>
    nodes.map((node) => {
      const field = node.closest("label");
      const icon = node.querySelector("svg");
      const words = document.createRange();
      const value = field?.querySelector("[dir=ltr]");
      if (field === null || icon === null || !value) {
        return null;
      }
      words.selectNodeContents(value);
      const box = field.getBoundingClientRect();
      const text = words.getBoundingClientRect();
      const mark = icon.getBoundingClientRect();
      return {
        height: box.height,
        start: text.left - box.left,
        gap: mark.left - text.right,
        end: box.right - mark.right,
        button: node.getBoundingClientRect().width,
      };
    })
  );
  expect(measured).toEqual([
    { height: 28, start: 12, gap: 6, end: 12, button: 28 },
    { height: 32, start: 12, gap: 8, end: 12, button: 32 },
  ]);
});

test("a colour stands 12px in, a round of 12px, 8px before the words", async ({
  page,
}) => {
  await openExample(page, "snippet", "colours");
  const measured = await page
    .getByRole("button")
    .first()
    .evaluate((node) => {
      const field = node.closest("label");
      const swatch = field?.firstElementChild;
      const value = field?.querySelector("[dir=ltr]");
      if (!(field && swatch && value)) {
        return null;
      }
      const round = swatch.getBoundingClientRect();
      return {
        start: round.left - field.getBoundingClientRect().left,
        width: round.width,
        height: round.height,
        gap: value.getBoundingClientRect().left - round.right,
      };
    });
  expect(measured).toEqual({ start: 12, width: 12, height: 12, gap: 8 });
});

test("the field's ring is drawn inside the field, so it covers nothing beside it", async ({
  page,
}) => {
  await openExample(page, "snippet", "basic");
  await page.keyboard.press("Tab");
  const button = page.getByRole("button", {
    name: "Copy the install command",
  });
  await expect(button).toBeFocused();
  // How far the ring reaches past the field's own edge: its width and its offset.
  const reach = await button.evaluate((node) => {
    const style = getComputedStyle(node.closest("label") ?? node);
    return (
      Number(style.outlineWidth.replace(/px$/u, "")) +
      Number(style.outlineOffset.replace(/px$/u, ""))
    );
  });
  expect(reach).toBeLessThanOrEqual(0);
});
