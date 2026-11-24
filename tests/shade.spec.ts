// Every layer with a shade (lib/layer `shadeProps`). Closed by anything but a press on its shade,
// the page takes a press 0, 70 and 140ms after. Closed by a press on its shade, a second press at
// the same place goes where it went before the shade had its watch: the table each layer carries,
// measured on `main` (in Chromium and WebKit, by mouse and by touch, five times a cell).
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
  /**
   * After a press on its shade closed it, whether a second press there this many ms later reaches
   * the page, gap by gap (`gaps`). Undefined: its shade closes nothing (an alert dialog's).
   */
  secondPress?: Outcome[];
  /**
   * Its leave, in ms, where a second press stops being the shade's: a round whose second press,
   * meant before it, came after it is taken again. None when the leave outlasts every gap.
   */
  leave?: number;
  /** The ways to close it, besides Escape and its buttons, as a person would take them. */
  also?: [string, (panel: Locator, input: Input) => Promise<void>][];
}

/** A second press goes through, is the shade's, or either: the gap is the layer's own leave. */
type Outcome = "through" | "shade" | "either";
type Input = "mouse" | "touch";

const gaps = [0, 40, 100, 140, 200, 320];

const alertDialog: Layer = {
  component: "alert-dialog",
  example: "basic",
  trigger: "Delete workspace",
  role: "alertdialog",
  buttons: ["Keep it"],
};

const layers: Layer[] = [
  {
    component: "dialog",
    example: "basic",
    trigger: "Publish report",
    role: "dialog",
    buttons: ["Cancel", "Close"],
    secondPress: ["shade", "shade", "shade", "shade", "through", "through"],
    leave: 160,
  },
  alertDialog,
  {
    component: "sheet",
    example: "basic",
    trigger: "Report details",
    role: "dialog",
    buttons: ["Close"],
    secondPress: ["shade", "shade", "shade", "shade", "shade", "shade"],
  },
  {
    component: "drawer",
    example: "basic",
    trigger: "Remind me tomorrow",
    role: "dialog",
    buttons: ["Cancel"],
    secondPress: ["shade", "shade", "shade", "shade", "shade", "shade"],
  },
  {
    component: "command",
    example: "dialog",
    trigger: "Search",
    role: "dialog",
    buttons: [],
    secondPress: ["shade", "shade", "either", "through", "through", "through"],
    leave: 100,
    also: [
      [
        "a command chosen by Enter",
        async (panel) => {
          await panel.page().keyboard.press("Enter");
        },
      ],
      [
        "a command pressed",
        async (panel, input) => {
          const option = panel.getByRole("option").first();
          await (input === "touch" ? option.tap() : option.click());
        },
      ],
    ],
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
    // When each press anywhere began, for how far apart two presses truly came.
    window.pressesAt = [];
    window.addEventListener(
      "pointerdown",
      () => {
        window.pressesAt?.push(performance.now());
      },
      true
    );
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

/** A press at the corner button's place, under the shade. */
const press = async (page: Page, input: Input) => {
  await (input === "touch"
    ? page.touchscreen.tap(20, 20)
    : page.mouse.click(20, 20));
};

/** How far apart the last two presses began, in ms. */
const lastGap = async (page: Page) =>
  await page.evaluate(() => {
    const at = window.pressesAt ?? [];
    return (at.at(-1) ?? 0) - (at.at(-2) ?? 0);
  });

/** The gaps of a table with that outcome, as words. */
const gapsWith = (table: Outcome[], outcome: Outcome) =>
  gaps.filter((_gap, index) => table[index] === outcome).join(", ");

/**
 * After a press on the shade closed the layer, whether a second press at the same place `gap` ms
 * later reached the page. A round whose second press the browser sent past the layer's leave,
 * though it was meant before it, measures another gap: it is taken again, waiting less by as much
 * as that round was late (a busy machine sends each press late).
 */
const secondPressReaches = async (
  page: Page,
  layer: Layer,
  input: Input,
  gap: number,
  { wait = gap, tries = 5 } = {}
): Promise<boolean> => {
  const corner = page.getByRole("button", { name: "Corner", exact: true });
  const before = Number(await corner.getAttribute("data-presses"));
  const panel = await show(page, layer);
  await press(page, input);
  if (wait > 0) {
    await page.waitForTimeout(wait);
  }
  await press(page, input);
  await expect(panel).toBeHidden();
  // A click that would come late has come.
  await page.waitForTimeout(300);
  const { leave = Infinity } = layer;
  const came = await lastGap(page);
  if (gap < leave && came >= leave) {
    expect(tries, `rounds sent past the ${leave}ms leave`).toBeGreaterThan(1);
    return await secondPressReaches(page, layer, input, gap, {
      wait: Math.max(0, wait - (came - gap)),
      tries: tries - 1,
    });
  }
  return Number(await corner.getAttribute("data-presses")) > before;
};

/**
 * The table of each layer (`secondPress`), by mouse or by touch: after a press on the shade closed
 * the layer, a second press at the same place goes through or is the shade's, gap by gap, as on
 * `main`. A gap whose outcome is either is not asserted. For an alert dialog, a press on its shade
 * closes nothing.
 */
const secondPressTests = (input: Input) => {
  const noun = input === "touch" ? "tap" : "press";
  for (const layer of layers) {
    const table = layer.secondPress;
    if (table === undefined) {
      test(`${layer.component}: a ${noun} on its shade closes nothing`, async ({
        page,
      }) => {
        const corner = await open(page, layer);
        const panel = await show(page, layer);
        await press(page, input);
        await page.waitForTimeout(300);
        await expect(panel).toBeVisible();
        await expect(corner).toHaveAttribute("data-presses", "0");
      });
    } else {
      const through = gapsWith(table, "through");
      test(`${layer.component}: closed by a ${noun} on its shade, a second ${noun} there ${gapsWith(table, "shade")}ms after is the shade's${through === "" ? "" : `, ${through}ms after goes through`}`, async ({
        page,
      }) => {
        await open(page, layer);
        for (const [index, gap] of gaps.entries()) {
          const outcome = table[index];
          if (outcome !== "either") {
            // oxlint-disable-next-line no-await-in-loop -- one opening after another
            const reached = await secondPressReaches(page, layer, input, gap);
            expect(reached ? "through" : "shade", `${gap}ms after`).toBe(
              outcome
            );
          }
        }
      });
    }
  }
};

secondPressTests("mouse");

for (const layer of layers) {
  const closes: [string, (panel: Locator) => Promise<void>][] = [
    [
      "Escape",
      async (panel) => {
        await panel.page().keyboard.press("Escape");
      },
    ],
    ...layer.buttons.map(
      (name): [string, (panel: Locator) => Promise<void>] => [
        name,
        async (panel) => {
          await panel.getByRole("button", { name, exact: true }).last().click();
        },
      ]
    ),
    ...layer.buttons.map(
      (name): [string, (panel: Locator) => Promise<void>] => [
        `a click from code on ${name}`,
        async (panel) => {
          await panel
            .getByRole("button", { name, exact: true })
            .last()
            .evaluate((button: HTMLElement) => {
              button.click();
            });
        },
      ]
    ),
    ...(layer.also ?? []).map(
      ([how, close]): [string, (panel: Locator) => Promise<void>] => [
        how,
        async (panel) => {
          await close(panel, "mouse");
        },
      ]
    ),
  ];
  for (const [how, close] of closes) {
    test(`${layer.component}: closed by ${how}, a press 0, 70 and 140ms after goes through`, async ({
      page,
    }) => {
      const corner = await open(page, layer);
      let presses = 0;
      for (const after of [0, 70, 140]) {
        // oxlint-disable-next-line no-await-in-loop -- one opening after another
        const panel = await show(page, layer);
        // oxlint-disable-next-line no-await-in-loop -- see above
        await close(panel);
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

declare global {
  interface Window {
    /** Every close request UI SDK listens for (`CloseWatcher`), as it made them (see below). */
    closeWatchers?: (EventTarget & { destroyed: boolean })[];
    /** When each press began (`performance.now()`), from the corner button's arrival. */
    pressesAt?: number[];
  }
}

/** The phone's back: a close request to the last CloseWatcher UI SDK still listens to. */
const back = async (page: Page) => {
  await page.evaluate(() => {
    window.closeWatchers
      ?.findLast(({ destroyed }) => !destroyed)
      ?.dispatchEvent(new Event("close"));
  });
};

// On a phone. Chromium makes a tap's click a touch PointerEvent (WebKit a mouse one), and Android's
// back is a close request, which UI SDK hears through a CloseWatcher on Android alone
// (foundation/popups/popup.js `watchClose`). A test browser has no back gesture, so the page's
// CloseWatcher is a stand-in that keeps each one UI SDK makes, and the back is its `close`.
test.describe("on a touch screen", () => {
  test.use({
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
  });

  secondPressTests("touch");

  // Not the drawer: on a phone UI SDK moves it by scrolling a box over the whole window, which
  // takes every tap until the drawer has gone (about 420ms), however it was closed. A known gap,
  // to be fixed in UI SDK.
  for (const layer of layers.filter(
    ({ component }) => component !== "drawer"
  )) {
    const closes: [string, (panel: Locator) => Promise<void>][] = [
      [
        "the phone's back",
        async (panel) => {
          await back(panel.page());
        },
      ],
      ...layer.buttons.map(
        (name): [string, (panel: Locator) => Promise<void>] => [
          `a screen reader's click on ${name}`,
          async (panel) => {
            await panel
              .getByRole("button", { name, exact: true })
              .last()
              .evaluate((button: HTMLElement) => {
                button.click();
              });
          },
        ]
      ),
      ...(layer.also ?? []).map(
        ([how, close]): [string, (panel: Locator) => Promise<void>] => [
          how,
          async (panel) => {
            await close(panel, "touch");
          },
        ]
      ),
    ];
    for (const [how, close] of closes) {
      const first =
        layer.secondPress === undefined
          ? "after a tap on its shade that closes nothing, "
          : "";
      test(`${layer.component}: ${first}closed by ${how}, a tap 0, 70 and 140ms after goes through`, async ({
        page,
      }) => {
        await page.addInitScript(() => {
          const made: (EventTarget & { destroyed: boolean })[] = [];
          window.closeWatchers = made;
          Object.assign(globalThis, {
            CloseWatcher: class extends EventTarget {
              destroyed = false;
              constructor() {
                super();
                made.push(this);
              }
              destroy() {
                this.destroyed = true;
              }
            },
          });
        });
        const corner = await open(page, layer);
        let presses = 0;
        for (const after of [0, 70, 140]) {
          // oxlint-disable-next-line no-await-in-loop -- one opening after another
          const panel = await show(page, layer);
          if (layer.secondPress === undefined) {
            // oxlint-disable-next-line no-await-in-loop -- see above
            await page.touchscreen.tap(20, 20);
            // oxlint-disable-next-line no-await-in-loop -- see above
            await page.waitForTimeout(300);
            // oxlint-disable-next-line no-await-in-loop -- see above
            await expect(panel).toBeVisible();
          }
          // oxlint-disable-next-line no-await-in-loop -- see above
          await close(panel);
          if (after > 0) {
            // oxlint-disable-next-line no-await-in-loop -- see above
            await page.waitForTimeout(after);
          }
          // oxlint-disable-next-line no-await-in-loop -- see above
          await page.touchscreen.tap(20, 20);
          presses += 1;
          // oxlint-disable-next-line no-await-in-loop -- see above
          await expect(corner).toHaveAttribute("data-presses", String(presses));
          // oxlint-disable-next-line no-await-in-loop -- see above
          await expect(panel).toBeHidden();
        }
      });
    }
  }
});
