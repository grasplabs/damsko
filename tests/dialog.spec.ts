import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { fixedTime, listenToLiveRegions, openExample } from "./example.ts";

const holdsFocus = async (element: Locator): Promise<boolean> =>
  await element.evaluate((node) => node.contains(document.activeElement));

const height = async (target: Locator): Promise<number | undefined> => {
  const box = await target.boundingBox();
  return box?.height;
};

test("its trigger opens it, named by its title and described by its text", async ({
  page,
}) => {
  await openExample(page, "dialog", "basic");
  await page.getByRole("button", { name: "Publish report" }).click();
  const dialog = page.getByRole("dialog", { name: "Publish the report" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAccessibleDescription(
    "Everyone in the workspace can read it once it is published."
  );
});

test("the keyboard opens it and focus moves in", async ({ page }) => {
  await openExample(page, "dialog", "basic");
  await page.getByRole("button", { name: "Publish report" }).focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Publish the report" });
  await expect(dialog).toBeVisible();
  await expect.poll(async () => await holdsFocus(dialog)).toBe(true);
});

test("Tab and Shift+Tab keep focus inside it", async ({ page }) => {
  await openExample(page, "dialog", "basic");
  await page.getByRole("button", { name: "Publish report" }).click();
  const dialog = page.getByRole("dialog", { name: "Publish the report" });
  await expect.poll(async () => await holdsFocus(dialog)).toBe(true);
  const stops = await dialog.getByRole("button").count();
  for (const key of ["Tab", "Shift+Tab"]) {
    for (let step = 0; step <= stops; step += 1) {
      // oxlint-disable-next-line no-await-in-loop -- one key after the other
      await page.keyboard.press(key);
      // oxlint-disable-next-line no-await-in-loop -- see above
      expect(await holdsFocus(dialog)).toBe(true);
    }
  }
});

test("Escape closes it and gives focus back to its trigger", async ({
  page,
}) => {
  await openExample(page, "dialog", "basic");
  const trigger = page.getByRole("button", { name: "Publish report" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Publish the report" });
  await expect.poll(async () => await holdsFocus(dialog)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("a press on the shade closes it, and the page takes presses again", async ({
  page,
}) => {
  await openExample(page, "dialog", "basic");
  const trigger = page.getByRole("button", { name: "Publish report" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Publish the report" });
  await expect(dialog).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  // No shade is left over the page: its trigger opens it again.
  await trigger.click();
  await expect(dialog).toBeVisible();
});

test("its close button closes it, named Close", async ({ page }) => {
  await openExample(page, "dialog", "basic");
  const trigger = page.getByRole("button", { name: "Publish report" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Publish the report" });
  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("Cancel closes it and gives focus back to its trigger", async ({
  page,
}) => {
  await openExample(page, "dialog", "basic");
  const trigger = page.getByRole("button", { name: "Publish report" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Publish the report" });
  await dialog.getByRole("button", { name: "Cancel" }).press("Enter");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("the page behind does not scroll while it is open", async ({ page }) => {
  await openExample(page, "dialog", "basic");
  await page.evaluate(() => {
    document.body.style.minHeight = "300vh";
  });
  await page.getByRole("button", { name: "Publish report" }).click();
  const dialog = page.getByRole("dialog", { name: "Publish the report" });
  await expect.poll(async () => await holdsFocus(dialog)).toBe(true);
  await page.mouse.move(5, 5);
  await expect(async () => {
    const before = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 600);
    await page.keyboard.press("PageDown");
    await page.keyboard.press("End");
    // A frame for any scroll to land, then the page is where it was.
    await page.evaluate(
      async () =>
        // oxlint-disable-next-line promise/avoid-new -- the next frame, which has no promise of its own
        await new Promise((resolve) => {
          requestAnimationFrame(resolve);
        })
    );
    expect(await page.evaluate(() => scrollY)).toBe(before);
  }).toPass();
});

test("while its action works it stays open, and it closes once the work is done", async ({
  page,
}) => {
  await openExample(page, "dialog", "basic");
  await page.getByRole("button", { name: "Publish report" }).click();
  const dialog = page.getByRole("dialog", { name: "Publish the report" });
  const publish = dialog.getByRole("button", { name: "Publish", exact: true });
  await publish.click();
  await expect(
    dialog.getByRole("button", { name: "Publishing" })
  ).toHaveAttribute("aria-busy", "true");
  await page.keyboard.press("Escape");
  await page.mouse.click(5, 5);
  await expect(dialog).toBeVisible();
  await expect(dialog).toBeHidden();
});

test("an action's own loading words are said as its work starts", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "dialog", "basic", { time: fixedTime });
  await page.clock.pauseAt(new Date(fixedTime.getTime() + 60_000));
  await page.getByRole("button", { name: "Publish report" }).click();
  await page.clock.runFor(500);
  const dialog = page.getByRole("dialog", { name: "Publish the report" });
  await dialog.getByRole("button", { name: "Publish", exact: true }).click();
  // Well inside the second a press with no words of its own waits, and the 1.2s the work takes.
  await page.clock.runFor(200);
  expect(await said()).toStrictEqual(["Publishing"]);
});

test("a failed action says so and keeps it open", async ({ page }) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "dialog", "check-failed");
  await page.getByRole("button", { name: "Test the connection" }).click();
  const dialog = page.getByRole("dialog", { name: "Test the connection" });
  const check = dialog.getByRole("button", { name: "Test", exact: true });
  await check.click();
  // With no errorText, the alert stands on the button and the catalogue's words are said.
  await expect(check).toHaveAttribute("data-status", "error");
  await expect.poll(said).toContain("Could not finish");
  await expect(dialog).toBeVisible();
});

test("a long body is a region the keys can scroll", async ({ page }) => {
  await openExample(page, "dialog", "long-body");
  await page.setViewportSize({ width: 1280, height: 480 });
  await page.getByRole("button", { name: "Review changes" }).click();
  const region = page.getByRole("region", { name: "Review changes" });
  await expect(region).toHaveAttribute("tabindex", "0");
  await region.focus();
  await page.keyboard.press("End");
  await expect
    .poll(async () => await region.evaluate((node) => node.scrollTop))
    .toBeGreaterThan(0);
  await expect(
    page.getByRole("button", { name: "Share the report" })
  ).toBeInViewport();
});

test("with a long body it closes for good, and the page takes presses again", async ({
  page,
}) => {
  await openExample(page, "dialog", "long-body");
  const trigger = page.getByRole("button", { name: "Review changes" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Review changes" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await trigger.click();
  await expect(dialog).toBeVisible();
});

test("a required field left empty keeps it open, says why and takes focus", async ({
  page,
}) => {
  await openExample(page, "dialog", "form-test");
  await page.getByRole("button", { name: "Rename project" }).focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Rename project" });
  const name = dialog.getByRole("textbox", { name: "Project name" });
  await expect(name).toBeFocused();
  await name.fill("");
  await dialog.getByRole("button", { name: "Rename", exact: true }).click();
  await expect(dialog.getByText("Give the project a name.")).toBeVisible();
  await expect(name).toBeFocused();
  await expect(dialog).toBeVisible();
});

for (const how of ["click", "Enter"] as const) {
  test(`a filled field focused as it opens keeps its words, the caret at their end, after a ${how}`, async ({
    page,
  }) => {
    await openExample(page, "dialog", "form-test");
    const trigger = page.getByRole("button", { name: "Rename project" });
    if (how === "click") {
      await trigger.click();
    } else {
      await trigger.focus();
      await page.keyboard.press("Enter");
    }
    const name = page
      .getByRole("dialog", { name: "Rename project" })
      .getByRole("textbox", { name: "Project name" });
    await expect(name).toBeFocused();
    const caret = async () => {
      const at = await name.evaluate((input) =>
        input instanceof HTMLInputElement
          ? [input.selectionStart, input.selectionEnd]
          : []
      );
      return at;
    };
    await expect.poll(caret).toStrictEqual([16, 16]);
  });
}

test("full, it opens wider than a dialog for a short task", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openExample(page, "dialog", "full");
  await page.getByRole("button", { name: "Open the year in full" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Requests closed this year",
  });
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThan(800);
});

test("on a phone it is a sheet along the bottom, its actions sharing the line", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openExample(page, "dialog", "nested");
  await page.getByRole("button", { name: "Edit the report" }).click();
  const dialog = page.getByRole("dialog", { name: "Edit the report" });
  await expect(dialog).toBeVisible();
  const panel = await dialog.boundingBox();
  expect(Math.round((panel?.y ?? 0) + (panel?.height ?? 0))).toBe(844);
  expect(Math.round(panel?.width ?? 0)).toBe(390);
  const close = await dialog
    .getByRole("button", { name: "Close", exact: true })
    .first()
    .boundingBox();
  const remove = await dialog
    .getByRole("button", { name: "Delete it" })
    .boundingBox();
  expect(Math.abs((close?.width ?? 0) - (remove?.width ?? 0))).toBeLessThan(2);
  expect(close?.height).toBe(remove?.height);
});

const focusedName = async (page: Page): Promise<string> =>
  await page.evaluate(() =>
    document.activeElement === document.body
      ? "the page"
      : (document.activeElement?.textContent ?? "").trim()
  );

test("opened by `open` with no trigger, it is named and described, and focus goes back to the opener", async ({
  page,
}) => {
  await openExample(page, "dialog", "by-prop");
  const ask = page.getByRole("button", { name: "Ask" });
  for (const how of ["Escape", "Not yet"]) {
    // oxlint-disable-next-line no-await-in-loop -- one way of closing after the other
    await ask.focus();
    // oxlint-disable-next-line no-await-in-loop -- see above
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Send the report?" });
    // oxlint-disable-next-line no-await-in-loop -- see above
    await expect(dialog).toHaveAccessibleDescription(
      "Everyone on the team gets it by email."
    );
    // oxlint-disable-next-line no-await-in-loop -- see above
    await expect(dialog.getByRole("button", { name: "Not yet" })).toBeFocused();
    // oxlint-disable-next-line no-await-in-loop -- see above
    await page.keyboard.press(how === "Escape" ? "Escape" : "Enter");
    // oxlint-disable-next-line no-await-in-loop -- see above
    await expect(dialog).toBeHidden();
    // oxlint-disable-next-line no-await-in-loop -- see above
    await expect(ask).toBeFocused();
  }
});

test("mounted only while open, it gives focus back to the opener as it leaves", async ({
  page,
}) => {
  await openExample(page, "dialog", "mounted");
  const ask = page.getByRole("button", { name: "Ask" });
  for (const how of ["Escape", "Close", "shade"]) {
    // oxlint-disable-next-line no-await-in-loop -- one way of closing after the other
    await ask.focus();
    // oxlint-disable-next-line no-await-in-loop -- see above
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Send the report?" });
    // oxlint-disable-next-line no-await-in-loop -- see above
    await expect.poll(async () => await holdsFocus(dialog)).toBe(true);
    if (how === "Escape") {
      // oxlint-disable-next-line no-await-in-loop -- see above
      await page.keyboard.press("Escape");
    } else if (how === "shade") {
      // oxlint-disable-next-line no-await-in-loop -- see above
      await page.mouse.click(8, 8);
    } else {
      // oxlint-disable-next-line no-await-in-loop -- see above
      await dialog.getByRole("button", { name: how, exact: true }).click();
    }
    // oxlint-disable-next-line no-await-in-loop -- see above
    await expect(dialog).toBeHidden();
    // oxlint-disable-next-line no-await-in-loop -- see above
    await expect(ask).toBeFocused();
  }
});

test("a layer opened inside it: each Escape gives focus back one level", async ({
  page,
}) => {
  await openExample(page, "dialog", "nested");
  await page.getByRole("button", { name: "Edit the report" }).focus();
  await page.keyboard.press("Enter");
  const outer = page.getByRole("dialog", { name: "Edit the report" });
  await outer.getByRole("button", { name: "Delete it" }).press("Enter");
  const inner = page.getByRole("alertdialog", { name: "Delete the report?" });
  await expect(inner).toBeVisible();
  await expect.poll(async () => await focusedName(page)).toBe("Keep it");
  await page.keyboard.press("Escape");
  await expect(inner).toBeHidden();
  await expect(outer.getByRole("button", { name: "Delete it" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(outer).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Edit the report" })
  ).toBeFocused();
});

// The agent fixture: the page's one bridge (window.damskoAgent, site/behaviour/agent.ts).
const act = async (page: Page, ref: string, args?: string[]) =>
  await page.evaluate(
    async ([name, list]) => {
      const result = await window.damskoAgent?.act({
        steps: [{ ref: name, action: "press", args: list }],
      });
      return { ok: result?.ok === true, message: result?.error?.message ?? "" };
    },
    [ref, args] as const
  );

const agentSees = async (page: Page): Promise<string[]> =>
  await page.evaluate(() =>
    (window.damskoAgent?.snapshot() ?? []).map((entry) => entry.label ?? "")
  );

const log = async (page: Page): Promise<string[]> =>
  await page.evaluate(() => window.dialogLog ?? []);

test("an agent opens it by its trigger, reads its title and presses its action by name", async ({
  page,
}) => {
  await openExample(page, "dialog", "agent");
  expect(await agentSees(page)).toEqual(
    expect.arrayContaining(["Rename project", "Delete project"])
  );
  const opened = await act(page, "Rename project");
  expect(opened.ok).toBe(true);
  const dialog = page.getByRole("dialog", { name: "Rename the project" });
  await expect(dialog).toBeVisible();
  await expect
    .poll(async () => await agentSees(page))
    .toContain("Rename the project");
  const saved = await act(page, "Rename the project", ["Save the name"]);
  expect(saved.ok).toBe(true);
  expect(await log(page)).toContain("renamed");
  await expect(dialog).toBeHidden();
});

test("an agent's press on a destructive action waits for the person's yes", async ({
  page,
}) => {
  await openExample(page, "dialog", "agent");
  await page.evaluate(() => {
    window.damskoAgentYes = false;
  });
  const refused = await act(page, "Delete project", ["Delete forever"]);
  expect(refused.ok).toBe(false);
  expect(await log(page)).not.toContain("deleted");
  await page.evaluate(() => {
    window.damskoAgentYes = true;
  });
  const allowed = await act(page, "Delete project", ["Delete forever"]);
  expect(allowed.ok).toBe(true);
  await expect.poll(async () => await log(page)).toContain("deleted");
});

test("an agent hears a failed action in its words, and the dialog stays open", async ({
  page,
}) => {
  await openExample(page, "dialog", "agent");
  const failed = await act(page, "Publish report", ["Publish now"]);
  expect(failed.ok).toBe(false);
  expect(failed.message).toContain("Could not publish");
  const dialog = page.getByRole("dialog", { name: "Publish the report" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Could not publish" })
  ).toBeVisible();
});

test("opened by a prop, a choice made in a Select inside it does not lose where focus goes back to", async ({
  page,
}) => {
  await openExample(page, "dialog", "by-prop-select");
  const ask = page.getByRole("button", { name: "Ask" });
  await ask.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Send the report?" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("combobox", { name: "Send to" }).click();
  await page.getByRole("option", { name: "Managers" }).click();
  await expect(dialog.getByRole("combobox", { name: "Send to" })).toHaveText(
    /Managers/u
  );
  await dialog.getByRole("button", { name: "Not yet" }).click();
  await expect(dialog).toBeHidden();
  await expect(ask).toBeFocused();
});

test("in its footer a Button that names no size stands as tall as Close beside it", async ({
  page,
}) => {
  await openExample(page, "dialog", "basic");
  await page.getByRole("button", { name: "Publish report" }).click();
  const dialog = page.getByRole("dialog", { name: "Publish the report" });
  const [cancel, publish] = await Promise.all([
    dialog.getByRole("button", { name: "Cancel" }).boundingBox(),
    dialog.getByRole("button", { name: "Publish", exact: true }).boundingBox(),
  ]);
  expect(cancel?.height).toBe(32);
  expect(publish?.height).toBe(32);
});

const openFooterSizes = async (page: Page): Promise<Locator> => {
  await openExample(page, "dialog", "footer-sizes");
  await page.getByRole("button", { name: "Share the report" }).click();
  return page.getByRole("dialog", { name: "Share the report" });
};

test("a footer's own action that names no size is small, a HoldButton too, and a named size wins", async ({
  page,
}) => {
  const dialog = await openFooterSizes(page);
  expect(await height(dialog.getByRole("button", { name: "More ways" }))).toBe(
    32
  );
  expect(
    await height(dialog.getByRole("button", { name: "Hold to stop sharing" }))
  ).toBe(32);
  expect(
    await height(dialog.getByRole("button", { name: "Share", exact: true }))
  ).toBe(36);
});

test("a popover opened from a footer keeps its own Button's size", async ({
  page,
}) => {
  const dialog = await openFooterSizes(page);
  await dialog.getByRole("button", { name: "More ways" }).click();
  const copy = page.getByRole("button", { name: "Copy the link" });
  // Polled: the popover grows in from its trigger.
  await expect.poll(async () => await height(copy)).toBe(36);
});

for (const [component, example, opener, name, action] of [
  [
    "alert-dialog",
    "confirm",
    "Send release notes",
    "Email 2,400 customers?",
    "Send to everyone",
  ],
  ["sheet", "basic", "Report details", "Quarterly summary", "Archive"],
  [
    "drawer",
    "basic",
    "Remind me tomorrow",
    "Remind me tomorrow",
    "Set reminder",
  ],
] as const) {
  test(`in a ${component}'s footer a Button that names no size is small, as its Close is`, async ({
    page,
  }) => {
    await openExample(page, component, example);
    await page.getByRole("button", { name: opener }).click();
    const layer = page.getByRole(
      component === "alert-dialog" ? "alertdialog" : "dialog",
      { name }
    );
    const box = await layer
      .getByRole("button", { name: action, exact: true })
      .boundingBox();
    expect(box?.height).toBe(32);
  });
}
