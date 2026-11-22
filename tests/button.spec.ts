import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { hasFocusRing, listenToLiveRegions, openExample } from "./example.ts";

for (const theme of ["light", "dark"] as const) {
  test(`every variant draws a button named by its words, ${theme}`, async ({
    page,
  }) => {
    await openExample(page, "button", "variants", { theme });
    await Promise.all(
      [
        "Save changes",
        "Invite people",
        "Duplicate",
        "Edit",
        "Delete workspace",
        "Read the guide",
      ].map(async (name) => {
        await expect(page.getByRole("button", { name })).toBeVisible();
      })
    );
  });
}

for (const theme of ["light", "dark"] as const) {
  test(`no two variants look the same, at rest and under a pointer, ${theme}`, async ({
    page,
  }) => {
    await openExample(page, "button", "variants", { theme });
    const looks: string[] = [];
    // One button of each variant, read by its words: its fill, edge, lift, underline and box, at
    // rest and under the pointer. Ghost and link part under the pointer: a fill, or an underline.
    for (const name of [
      "Save changes",
      "Invite people",
      "Duplicate",
      "Edit",
      "Delete workspace",
      "Read the guide",
    ]) {
      const button = page.getByRole("button", { name });
      const read = async (): Promise<string> =>
        await button.evaluate((node) => {
          const style = getComputedStyle(node);
          return [
            style.backgroundColor,
            style.boxShadow,
            style.textDecorationLine,
            style.padding,
            style.height,
          ].join(" | ");
        });
      // oxlint-disable-next-line no-await-in-loop -- one pointer, one button at a time
      const rest = await read();
      // oxlint-disable-next-line no-await-in-loop -- one pointer, one button at a time
      await button.hover();
      // oxlint-disable-next-line no-await-in-loop -- one pointer, one button at a time
      await expect.poll(read).not.toBe(rest);
      // oxlint-disable-next-line no-await-in-loop -- one pointer, one button at a time
      looks.push(`${rest} / ${await read()}`);
    }
    expect(new Set(looks).size).toBe(looks.length);
  });
}

test("an icon-only button is named by its label", async ({ page }) => {
  await openExample(page, "button", "sizes");
  await expect(
    page.getByRole("button", { name: "Download the report" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Settings" })).toBeVisible();
});

test("an icon-only button shows its name under a pointer and on keyboard focus, and is not described by it", async ({
  page,
}) => {
  await openExample(page, "button", "sizes");
  const settings = page.getByRole("button", { name: "Settings" });
  await settings.hover();
  await expect(page.getByRole("tooltip", { name: "Settings" })).toBeVisible();
  await expect(settings).not.toHaveAttribute("aria-describedby");
  await page.mouse.move(0, 0);
  await expect(page.getByRole("tooltip", { name: "Settings" })).toBeHidden();
  await page.getByRole("button", { name: "Download the report" }).focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("tooltip", { name: "Download the report" })
  ).toBeVisible();
});

test("a Tooltip of the caller's stands in place of the button's own", async ({
  page,
}) => {
  await openExample(page, "tooltip", "icon");
  await page.getByRole("button", { name: "Download" }).hover();
  await expect(page.getByRole("tooltip")).toHaveText(
    "Saves a PDF of this report"
  );
});

test("while it works the spinner stands in its icon's place, at the width of its widest state and full strength", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openExample(page, "page-header", "actions-kinds");
  const working = page.getByRole("button", { name: "Export" });
  await expect(working).toHaveAttribute("aria-busy", "true");
  await expect(working).toHaveCSS("opacity", "1");
  await expect(working.getByText("Export", { exact: true })).toBeVisible();
  const [width, widest] = await working.evaluate((element) => {
    const failed = [...element.querySelectorAll("span")].find(
      (span) => span.textContent === "Could not export"
    );
    return [
      element.getBoundingClientRect().width,
      failed?.getBoundingClientRect().width ?? 0,
    ];
  });
  // 12px of padding either side of the widest words and their mark.
  expect(width).toBe(widest + 24);
});

for (const theme of ["light", "dark"] as const) {
  test(`a failed button draws the quiet fill with destructive words and edge, ${theme}`, async ({
    page,
  }) => {
    await openExample(page, "empty-and-error", "action-failed-still", {
      theme,
    });
    const failed = page.getByRole("button", { name: "Not archived" });
    await expect(failed).toBeVisible();
    const look = await failed.evaluate((element) => {
      const probe = document.createElement("span");
      probe.style.color = "var(--damsko-destructive)";
      probe.style.backgroundColor = "var(--damsko-secondary)";
      probe.style.boxShadow = "var(--damsko-error-border)";
      element.after(probe);
      const want = getComputedStyle(probe);
      const got = getComputedStyle(element);
      const same =
        got.color === want.color &&
        got.backgroundColor === want.backgroundColor &&
        got.boxShadow === want.boxShadow;
      probe.remove();
      return same;
    });
    expect(look).toBe(true);
  });
}

test("a click runs it", async ({ page }) => {
  await openExample(page, "button", "variants");
  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page.getByText("The editor would open here")).toBeVisible();
});

for (const key of ["Enter", "Space"]) {
  test(`${key} runs it from the keyboard`, async ({ page }) => {
    await openExample(page, "button", "variants");
    const edit = page.getByRole("button", { name: "Edit" });
    await edit.focus();
    await page.keyboard.press(key);
    await expect(page.getByText("The editor would open here")).toBeVisible();
  });
}

test("a disabled button says why and keeps its focus", async ({ page }) => {
  await openExample(page, "button", "disabled-why");
  const share = page.getByRole("button", { name: "Share" });
  await expect(share).toBeDisabled();
  await expect(share).toHaveAccessibleDescription(
    "Only the report's owner can share it. Ask Amara for access."
  );
  await page.keyboard.press("Tab");
  await expect(share).toBeFocused();
});

test("a disabled button drawn by a trigger opens nothing", async ({ page }) => {
  await openExample(page, "button", "disabled-why");
  const share = page.getByRole("button", { name: "Share" });
  await expect(share).toHaveAttribute("aria-expanded", "false");
  // A click and the keyboard's press both reach the trigger's own handler: neither opens it.
  // Forced: Playwright waits for an aria-disabled button to come into use, a person's click does not.
  await share.click({ force: true });
  await expect(share).toHaveAttribute("aria-expanded", "false");
  await share.focus();
  await page.keyboard.press("Enter");
  await expect(share).toHaveAttribute("aria-expanded", "false");
});

test("the keyboard's focus shows a ring, a click's does not", async ({
  page,
}) => {
  await openExample(page, "button", "variants");
  const save = page.getByRole("button", { name: "Save changes" });
  await page.keyboard.press("Tab");
  await expect(save).toBeFocused();
  expect(await hasFocusRing(save)).toBe(true);

  const edit = page.getByRole("button", { name: "Edit" });
  await edit.click();
  expect(await hasFocusRing(edit)).toBe(false);
});

test("a link with a button's look stays a link", async ({ page }) => {
  await openExample(page, "button", "link");
  const link = page.getByRole("link", { name: "See every state" });
  await expect(link).toHaveAttribute("href", "/components/button#every-state");
  await expect(
    page.getByRole("button", { name: "See every state" })
  ).toHaveCount(0);
});

test("while it works it keeps focus and says it is busy", async ({ page }) => {
  await openExample(page, "button", "variants");
  const save = page.getByRole("button", { name: "Save changes" });
  await save.focus();
  await page.keyboard.press("Enter");
  await expect(save).toHaveAttribute("aria-busy", "true");
  await expect(save).toBeFocused();
  await expect(page.getByRole("button", { name: "Saved" })).toBeVisible();
});

test("an icon-only button is a square", async ({ page }) => {
  await openExample(page, "button", "sizes");
  for (const name of ["Download the report", "Settings"]) {
    // oxlint-disable-next-line no-await-in-loop -- one button after the other
    const box = await page.getByRole("button", { name }).boundingBox();
    expect(box?.width).toBe(box?.height);
  }
});

test("one size is one height, whatever the variant", async ({ page }) => {
  await openExample(page, "button", "heights");
  const heights = [28, 32, 36, 44];
  for (const name of ["Cancel", "Connect", "Delete", "Approve"]) {
    const buttons = page.getByRole("button", { name, exact: true });
    for (const [row, height] of heights.entries()) {
      // oxlint-disable-next-line no-await-in-loop -- one button after the other
      const box = await buttons.nth(row).boundingBox();
      expect(box?.height).toBe(height);
    }
  }
});

test("in forced colours every variant draws a border", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await openExample(page, "button", "variants");
  for (const name of ["Save changes", "Invite people", "Delete workspace"]) {
    // oxlint-disable-next-line no-await-in-loop -- one button after the other
    await expect(page.getByRole("button", { name })).toHaveCSS(
      "border-top-width",
      "1px"
    );
  }
});

// The agent fixture: the page's one bridge (window.damskoAgent, site/behaviour/agent.ts) lists
// every button by its name and presses it; window.damskoAgentYes answers for the person.
const press = async (page: Page, ref: string) =>
  await page.evaluate(async (name) => {
    const result = await window.damskoAgent?.act({
      steps: [{ ref: name, action: "press" }],
    });
    return { ok: result?.ok === true, message: result?.error?.message ?? "" };
  }, ref);

const confirmOf = async (page: Page, label: string) =>
  await page.evaluate(
    (name) =>
      window.damskoAgent?.snapshot().find((entry) => entry.label === name)
        ?.confirm,
    label
  );

const ran = async (page: Page) =>
  await page.evaluate(() => window.buttonLog ?? []);

const answer = async (page: Page, yes: boolean) => {
  await page.evaluate((value) => {
    window.damskoAgentYes = value;
  }, yes);
};

test("an agent presses a button by its name and waits for its work", async ({
  page,
}) => {
  await openExample(page, "button", "agent");
  const saved = await press(page, "Save changes");
  expect(saved.ok).toBe(true);
  expect(await ran(page)).toContain("saved");
  const sent = await press(page, "Send invite");
  expect(sent.ok).toBe(false);
  expect(sent.message).toContain("Not sent");
});

test("a destructive press by an agent waits for the person's yes", async ({
  page,
}) => {
  await openExample(page, "button", "agent");
  expect(await confirmOf(page, "Delete draft")).toBe(
    "Deletes the draft report"
  );
  expect(await confirmOf(page, "Save changes")).toBeUndefined();
  await answer(page, false);
  const refused = await press(page, "Delete draft");
  expect(refused.ok).toBe(false);
  expect(await ran(page)).not.toContain("deleted");
  await answer(page, true);
  const allowed = await press(page, "Delete draft");
  expect(allowed.ok).toBe(true);
  expect(await ran(page)).toContain("deleted");
});

test("a destructive button asks in its own words", async ({ page }) => {
  await openExample(page, "button", "agent");
  expect(await confirmOf(page, "Archive the plan")).toBe(
    'Presses "Archive the plan"'
  );
});

test("a press whose work fails says so on the button, and nothing is thrown to the page", async ({
  page,
}) => {
  const thrown: string[] = [];
  page.on("pageerror", (error) => {
    thrown.push(error.message);
  });
  await openExample(page, "button", "action");
  await page.evaluate(() => {
    window.addEventListener("unhandledrejection", (event) => {
      document.body.dataset.rejected = String(event.reason);
    });
  });
  await page.getByRole("button", { name: "Send invite" }).click();
  await expect(page.getByRole("button", { name: "Not sent" })).toBeVisible();
  expect(thrown).toStrictEqual([]);
  await expect(page.locator("body")).not.toHaveAttribute("data-rejected");
});

/** The button's width, in pixels, as drawn now. */
const widthOf = async (page: Page, name: string): Promise<number> => {
  const box = await page.getByRole("button", { name }).boundingBox();
  return box?.width ?? -1;
};

test("a press whose work returns a Promise shows it works, then that it worked, at one width throughout", async ({
  page,
}) => {
  await openExample(page, "button", "action");
  const save = page.getByRole("button", { name: "Save changes" });
  const before = await widthOf(page, "Save changes");
  await save.click();
  await expect(save).toHaveAttribute("aria-busy", "true");
  expect(await widthOf(page, "Save changes")).toBe(before);
  await expect(save).toHaveAttribute("data-status", "success");
  expect(await widthOf(page, "Save changes")).toBe(before);
  await expect(save).not.toHaveAttribute("data-status");
  expect(await widthOf(page, "Save changes")).toBe(before);
});

test("a press whose work fails shows and says it failed once, at one width, and throws nothing to the page", async ({
  page,
}) => {
  const thrown: string[] = [];
  page.on("pageerror", (error) => {
    thrown.push(error.message);
  });
  const said = await listenToLiveRegions(page);
  await openExample(page, "button", "action");
  await page.evaluate(() => {
    window.addEventListener("unhandledrejection", (event) => {
      document.body.dataset.rejected = String(event.reason);
    });
  });
  const before = await widthOf(page, "Send invite");
  await page.getByRole("button", { name: "Send invite" }).click();
  await expect(page.getByRole("button", { name: "Sending" })).toBeVisible();
  expect(await widthOf(page, "Sending")).toBe(before);
  const failed = page.getByRole("button", { name: "Not sent" });
  await expect(failed).toBeVisible();
  expect(await widthOf(page, "Not sent")).toBe(before);
  await expect(page.getByRole("button", { name: "Send invite" })).toBeVisible();
  await expect
    .poll(async () => {
      const heard = await said();
      return heard.filter((each) => each === "Not sent");
    })
    .toStrictEqual(["Not sent"]);
  expect(thrown).toStrictEqual([]);
  await expect(page.locator("body")).not.toHaveAttribute("data-rejected");
});

test("with words for its states, the widest of them sets the width at rest", async ({
  page,
}) => {
  await openExample(page, "button", "action");
  const button = page.getByRole("button", { name: "Send invite" });
  // The widest words are the rest's or a state's; none is cut, whichever shows.
  const widest = await button.evaluate((node) =>
    Math.max(
      ...[...node.querySelectorAll("[data-slot=button-content] > *")].map(
        (layer) => layer.getBoundingClientRect().width
      )
    )
  );
  const inner = await button.evaluate(
    (node) =>
      node.querySelector("[data-slot=button-content]")?.getBoundingClientRect()
        .width ?? -1
  );
  expect(inner).toBeCloseTo(widest, 0);
});

test("a second press while its work runs does nothing", async ({ page }) => {
  await openExample(page, "button", "agent");
  const save = page.getByRole("button", { name: "Save changes" });
  await save.click();
  await save.click({ force: true });
  await expect(save).toHaveAttribute("data-status", "success");
  expect(await ran(page)).toStrictEqual(["saved"]);
});

test("a press that returns nothing is a plain press: never busy, no state", async ({
  page,
}) => {
  await openExample(page, "button", "variants");
  const edit = page.getByRole("button", { name: "Edit" });
  await edit.click();
  await expect(page.getByText("The editor would open here")).toBeVisible();
  await expect(edit).not.toHaveAttribute("aria-busy");
  await expect(edit).not.toHaveAttribute("data-status");
});

test("a page that runs the work itself gives the status, and the button shows it", async ({
  page,
}) => {
  await openExample(page, "patterns", "forms-settings");
  const save = page.getByRole("button", { name: "Save changes" });
  const before = await widthOf(page, "Save changes");
  await save.click();
  await expect(page.getByRole("button", { name: "Saving" })).toHaveAttribute(
    "aria-busy",
    "true"
  );
  await expect(page.getByRole("button", { name: "Saved" })).toBeVisible();
  expect(await widthOf(page, "Saved")).toBe(before);
});
