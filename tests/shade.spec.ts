// Every layer with a shade (lib/layer `shadeProps`): as it leaves, the second press of a double
// press on its shade is the shade's, never the page's under it; closed any other way, the page
// takes the very next press.
import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { openExample } from "./example.ts";

interface Layer {
  component: string;
  example: string;
  trigger: string;
  role: "dialog" | "alertdialog";
  /** The buttons in it that close it, by name, besides Escape. */
  buttons: string[];
  /** A press on its shade closes it (an alert dialog's never does). */
  shadeCloses: boolean;
}

const alertDialog: Layer = {
  component: "alert-dialog",
  example: "basic",
  trigger: "Delete workspace",
  role: "alertdialog",
  buttons: ["Keep it"],
  shadeCloses: false,
};

const layers: Layer[] = [
  {
    component: "dialog",
    example: "basic",
    trigger: "Publish report",
    role: "dialog",
    buttons: ["Cancel", "Close"],
    shadeCloses: true,
  },
  alertDialog,
  {
    component: "sheet",
    example: "basic",
    trigger: "Report details",
    role: "dialog",
    buttons: ["Close"],
    shadeCloses: true,
  },
  {
    component: "drawer",
    example: "basic",
    trigger: "Remind me tomorrow",
    role: "dialog",
    buttons: ["Cancel"],
    shadeCloses: true,
  },
  {
    component: "command",
    example: "dialog",
    trigger: "Search",
    role: "dialog",
    buttons: [],
    shadeCloses: true,
  },
];

/** Puts a plain button at the window's top start corner, under where the shade lies, and counts its presses. */
const addCornerButton = async (page: Page): Promise<Locator> => {
  await page.evaluate(() => {
    const button = document.createElement("button");
    button.textContent = "Corner";
    button.dataset.presses = "0";
    button.style.cssText = "position:fixed;top:0;left:0;width:40px;height:40px";
    button.addEventListener("click", () => {
      button.dataset.presses = String(Number(button.dataset.presses) + 1);
    });
    document.body.append(button);
  });
  return page.getByRole("button", { name: "Corner", exact: true });
};

const open = async (page: Page, layer: Layer): Promise<Locator> => {
  // With motion, so it takes the time of its leave to go.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openExample(page, layer.component, layer.example);
  return await addCornerButton(page);
};

const show = async (page: Page, layer: Layer): Promise<Locator> => {
  await page.getByRole("button", { name: layer.trigger, exact: true }).click();
  const panel = page.getByRole(layer.role);
  await expect(panel).toBeVisible();
  // Arrived whole, as a person would see it.
  await page.waitForTimeout(400);
  return panel;
};

for (const layer of layers) {
  test(`${layer.component}: a fast double press on its shade never reaches the page`, async ({
    page,
  }) => {
    const corner = await open(page, layer);
    for (let round = 0; round < 3; round += 1) {
      // oxlint-disable-next-line no-await-in-loop -- one opening after another
      const panel = await show(page, layer);
      // oxlint-disable-next-line no-await-in-loop -- see above
      await page.mouse.dblclick(20, 20);
      // oxlint-disable-next-line no-await-in-loop -- see above
      await page.waitForTimeout(500);
      // oxlint-disable-next-line no-await-in-loop -- see above
      await expect(corner).toHaveAttribute("data-presses", "0");
      // An alert dialog stays: Escape closes it for the next round.
      // oxlint-disable-next-line no-await-in-loop -- see above
      await (layer.shadeCloses
        ? Promise.resolve()
        : page.keyboard.press("Escape"));
      // oxlint-disable-next-line no-await-in-loop -- see above
      await expect(panel).toBeHidden();
    }
  });

  for (const close of ["Escape", ...layer.buttons]) {
    test(`${layer.component}: closed by ${close}, a press 0 to 140ms after goes through`, async ({
      page,
    }) => {
      const corner = await open(page, layer);
      let presses = 0;
      for (const after of [0, 70, 140]) {
        // oxlint-disable-next-line no-await-in-loop -- one opening after another
        const panel = await show(page, layer);
        // oxlint-disable-next-line no-await-in-loop -- see above
        await (close === "Escape"
          ? page.keyboard.press("Escape")
          : panel
              .getByRole("button", { name: close, exact: true })
              .last()
              .click());
        if (after > 0) {
          // oxlint-disable-next-line no-await-in-loop -- see above
          await page.waitForTimeout(after);
        }
        // oxlint-disable-next-line no-await-in-loop -- see above
        await page.mouse.click(20, 20);
        presses += 1;
        // oxlint-disable-next-line no-await-in-loop -- see above
        await expect(corner).toHaveAttribute("data-presses", String(presses));
        // oxlint-disable-next-line no-await-in-loop -- see above
        await expect(panel).toBeHidden();
      }
    });
  }
}

test("alert-dialog: a press on its shade that did nothing is forgotten, so a close by a screen reader's click lets the next press through", async ({
  page,
}) => {
  const corner = await open(page, alertDialog);
  const panel = await show(page, alertDialog);
  await page.mouse.click(20, 20);
  await page.waitForTimeout(100);
  await expect(panel).toBeVisible();
  // A screen reader's click: no pointer down, no key.
  await panel
    .getByRole("button", { name: "Keep it" })
    .evaluate((button: HTMLElement) => {
      button.click();
    });
  await page.mouse.click(20, 20);
  await expect(corner).toHaveAttribute("data-presses", "1");
  await expect(panel).toBeHidden();
});
