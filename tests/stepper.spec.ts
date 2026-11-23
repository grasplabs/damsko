import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { drawnParts, listenToLiveRegions, openExample } from "./example.ts";
import type { DrawnPart } from "./example.ts";

/** A step's name and its status, as a screen reader hears them: "Details, done". */
const said = (name: string, status: string) =>
  new RegExp(`^${name}\\s*, ${status}$`, "u");

test("an ordered list, named, the current step marked and each status said", async ({
  page,
}) => {
  await openExample(page, "stepper", "select");
  const list = page.getByRole("list", { name: "Setting up the workspace" });
  const steps = list.getByRole("listitem");
  await expect(steps).toHaveCount(4);
  await expect(steps.nth(0)).toHaveText(said("Details", "done"));
  await expect(steps.nth(1)).toHaveText(said("Members", "done"));
  await expect(steps.nth(2)).toHaveText(said("Billing", "current step"));
  await expect(steps.nth(2)).toHaveAttribute("aria-current", "step");
  await expect(steps.nth(3)).toHaveText(said("Review", "not started"));
  await expect(list.locator('[aria-current="step"]')).toHaveCount(1);
});

test("Tab reaches the done steps only, with a ring, and Enter goes back to one", async ({
  page,
}) => {
  await openExample(page, "stepper", "select");
  const details = page.getByRole("button", { name: said("Details", "done") });
  await page.keyboard.press("Tab");
  await expect(details).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: said("Members", "done") })
  ).toBeFocused();
  await expect(page.getByRole("button")).toHaveCount(2);
  await details.focus();
  await page.keyboard.press("Enter");
  const steps = page.getByRole("listitem");
  await expect(steps.nth(0)).toHaveAttribute("aria-current", "step");
  await expect(steps.nth(0)).toHaveText(said("Details", "current step"));
  await expect(steps.nth(1)).toHaveText(said("Members", "not started"));
  // The move is said once, through the page's live region.
  await expect(page.getByRole("status")).toHaveText("Step 1 of 4: Details");
});

test("where it stands is said when it moves, once for each move, and never at rest", async ({
  page,
}) => {
  const heard = await listenToLiveRegions(page);
  await openExample(page, "stepper", "select");
  const members = page.getByRole("button", { name: said("Members", "done") });
  await expect(members).toBeVisible();
  // At rest the list says where it stands; nothing is announced.
  expect(await heard()).toEqual([]);
  await members.click();
  await expect.poll(heard).toEqual(["Step 2 of 4: Members"]);
  await page.getByRole("button", { name: said("Details", "done") }).click();
  await expect
    .poll(heard)
    .toEqual(["Step 2 of 4: Members", "Step 1 of 4: Details"]);
});

test("a failed step says so, on its own and once every step is done", async ({
  page,
}) => {
  await openExample(page, "stepper", "failed");
  const [failed, finished] = [
    page.getByRole("list", { name: "Importing contacts" }).nth(0),
    page.getByRole("list", { name: "Importing contacts" }).nth(1),
  ];
  await expect(failed.getByRole("listitem").nth(1)).toHaveText(
    said("Match columns", "failed")
  );
  await expect(finished.getByRole("listitem")).toHaveText([
    said("Upload", "done"),
    said("Match columns", "done"),
    said("Import", "done"),
  ]);
});

test("with reached, every step up to the furthest is a way there, forward too", async ({
  page,
}) => {
  await openExample(page, "stepper", "reached");
  const steps = page.getByRole("listitem");
  await expect(steps.nth(1)).toHaveAttribute("aria-current", "step");
  // Reached and come back from: said as done.
  await expect(steps.nth(3)).toHaveText(said("Review", "done"));
  await page.getByRole("button", { name: said("Review", "done") }).click();
  await expect(steps.nth(3)).toHaveAttribute("aria-current", "step");
  await page.getByRole("button", { name: said("Members", "done") }).click();
  await expect(steps.nth(1)).toHaveAttribute("aria-current", "step");
});

test("past the furthest reached, a step is no button", async ({ page }) => {
  await openExample(page, "stepper", "marks");
  const list = page.getByRole("list", { name: "Setting up Grasp" }).first();
  // Reached step 6, back on step 3: steps 1 to 6 but the current one are buttons.
  await expect(list.getByRole("button")).toHaveCount(5);
  await list.getByRole("button", { name: /^Tools\b/u }).click();
  await expect(list.getByRole("listitem").nth(4)).toHaveAttribute(
    "aria-current",
    "step"
  );
});

test("the marks alone: each name is read, and is its tooltip on hover and focus", async ({
  page,
}) => {
  await openExample(page, "stepper", "marks");
  const list = page.getByRole("list", { name: "Setting up Grasp" }).first();
  await expect(
    list.getByRole("listitem").nth(2).getByText(said("Team", "current step"))
  ).toBeAttached();
  await expect(list.getByText("Team", { exact: true })).toBeHidden();
  await list.getByRole("button", { name: /^Tools\b/u }).hover();
  await expect(page.getByRole("tooltip")).toHaveText("Tools");
  await page.mouse.move(0, 0);
  await expect(page.getByRole("tooltip")).toBeHidden();
  // Keyboard focus on a step shows its name too.
  await list.getByRole("button", { name: /^Tools\b/u }).focus();
  await page.keyboard.press("Tab");
  await expect(list.getByRole("button", { name: /^Data\b/u })).toBeFocused();
  await expect(page.getByRole("tooltip")).toHaveText("Data");
});

test("running down, the steps keep their order and their descriptions", async ({
  page,
}) => {
  await openExample(page, "stepper", "vertical");
  const steps = page
    .getByRole("list", { name: "Publishing the report" })
    .getByRole("listitem");
  await expect(steps.nth(2)).toHaveAttribute("aria-current", "step");
  await expect(steps.nth(0)).toContainText("Written and saved on 3 March.");
});

test("the footer: Back, how far through, and Next as the step's action", async ({
  page,
}) => {
  await openExample(page, "stepper", "nav-footer");
  const progress = page.getByRole("progressbar", { name: "Step 3 of 7" });
  await expect(progress).toHaveAttribute("aria-valuetext", "Step 3 of 7");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(
    page.getByRole("progressbar", { name: "Step 4 of 7" })
  ).toBeVisible();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(progress).toBeVisible();
});

test("the footer's last step says what it does, and the first keeps Back's room", async ({
  page,
}) => {
  await openExample(page, "stepper", "nav-footer-states");
  await expect(
    page.getByRole("progressbar", { name: "Step 1 of 7" })
  ).toBeVisible();
  // Hidden on the first step, its room kept: Tab goes straight to Next.
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Next" }).first()
  ).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Create agent" })
  ).toBeVisible();
});

test("Next that waits for an answer keeps its place in the keys and says why", async ({
  page,
}) => {
  await openExample(page, "stepper", "nav-bar-states");
  const held = page.getByRole("button", { name: "Next" }).nth(1);
  await expect(held).toHaveAttribute("aria-disabled", "true");
  await expect(held).toHaveAccessibleDescription("Choose one to go on");
  // Next, then the second bar's Back, then its held Next.
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(held).toBeFocused();
  await expect(page.getByRole("tooltip")).toHaveText("Choose one to go on");
});

test("the bar: ghost arrows named Back and Next, and the finish words on the last step", async ({
  page,
}) => {
  await openExample(page, "stepper", "nav-bar");
  await expect(
    page.getByRole("progressbar", { name: "Step 3 of 7" })
  ).toBeVisible();
  const next = page.getByRole("button", { name: "Next" });
  await next.click();
  await expect(
    page.getByRole("progressbar", { name: "Step 4 of 7" })
  ).toBeVisible();
  await next.click();
  await expect(
    page.getByRole("progressbar", { name: "Step 5 of 7" })
  ).toBeVisible();
  await next.click();
  await expect(
    page.getByRole("progressbar", { name: "Step 6 of 7" })
  ).toBeVisible();
  await next.click();
  await expect(page.getByRole("button", { name: "Next" })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Create agent" })
  ).toBeVisible();
});

test("Alt+Left is Back and Mod+Enter is Next, anywhere in the flow", async ({
  page,
}) => {
  await openExample(page, "stepper", "nav-bar");
  await page.keyboard.press("Alt+ArrowLeft");
  await expect(
    page.getByRole("progressbar", { name: "Step 2 of 7" })
  ).toBeVisible();
  await page.keyboard.press("ControlOrMeta+Enter");
  await expect(
    page.getByRole("progressbar", { name: "Step 3 of 7" })
  ).toBeVisible();
});

test("in a form, Next submits it: Enter in the field goes on", async ({
  page,
}) => {
  await openExample(page, "stepper", "nav-form");
  await page.getByLabel("Your name").fill("Ada");
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Your team")).toBeVisible();
  await expect(
    page.getByRole("progressbar", { name: "Step 2 of 3" })
  ).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByLabel("Your role")).toBeVisible();
  await page.keyboard.press("Alt+ArrowLeft");
  await expect(page.getByLabel("Your team")).toBeVisible();
});

const middle = (part: Omit<DrawnPart, "cut">) => ({
  x: (part.left + part.right) / 2,
  y: (part.top + part.bottom) / 2,
});

/**
 * A step's mark as the screen draws it, read from the pixels at the step's corner, clear of its
 * words: what the mark is made of (a dot, and round the current one its ring), and the line that
 * runs on from it to the step before and the step after.
 */
const markOf = async (page: Page, step: Locator, down: boolean) => {
  const box = await step.boundingBox();
  if (box === null) {
    throw new Error("The step is not drawn.");
  }
  const clip = down
    ? { x: box.x - 4, y: box.y - 6, width: 32, height: 42 }
    : { x: box.x - 12, y: box.y - 4, width: 44, height: 28 };
  const parts = await drawnParts(page, clip);
  return {
    mark: parts.filter((part) => !part.cut),
    line: parts.filter((part) => part.cut),
    /** Where what was looked at starts on the page, which the parts are placed from. */
    origin: { x: clip.x, y: clip.y },
  };
};

/** The mark's parts stand about one middle, and the line runs through it. */
const expectOneMiddle = (
  { mark, line }: { mark: DrawnPart[]; line: DrawnPart[] },
  parts: number,
  down: boolean
) => {
  expect(mark).toHaveLength(parts);
  expect(line.length).toBeGreaterThan(0);
  const [dot] = mark.toSorted((a, b) => a.right - a.left - (b.right - b.left));
  if (dot === undefined) {
    throw new Error("No mark is drawn.");
  }
  for (const part of mark) {
    expect(Math.abs(middle(part).x - middle(dot).x)).toBeLessThan(0.5);
    expect(Math.abs(middle(part).y - middle(dot).y)).toBeLessThan(0.5);
  }
  for (const stretch of line) {
    expect(
      Math.abs(
        down
          ? middle(stretch).x - middle(dot).x
          : middle(stretch).y - middle(dot).y
      )
    ).toBeLessThan(0.5);
  }
};

for (const scale of [1, 2]) {
  for (const down of [false, true]) {
    test(`a mark's dot, its ring and the line share one middle in every state, ${down ? "down" : "across"} at ${scale}x`, async ({
      browser,
    }) => {
      const page = await browser.newPage({
        deviceScaleFactor: scale,
        reducedMotion: "reduce",
      });
      await openExample(page, "stepper", "fixture");
      const steps = page
        .getByRole("list", { name: "Setting up the workspace" })
        .nth(down ? 1 : 0)
        .getByRole("listitem");
      /** How many shapes the second step's mark is made of: two while its ring shows. */
      const shapes = async () => {
        const { mark } = await markOf(page, steps.nth(1), down);
        return mark.length;
      };
      // Done and still to come: a dot and an open ring, each one shape.
      expectOneMiddle(await markOf(page, steps.nth(0), down), 1, down);
      expectOneMiddle(await markOf(page, steps.nth(2), down), 1, down);
      // The current step: its dot and the ring round it.
      await expect(steps.nth(1)).toHaveAttribute("aria-current", "step");
      expectOneMiddle(await markOf(page, steps.nth(1), down), 2, down);
      // Failed: a square, no ring.
      await page.getByRole("button", { name: "Fail this step" }).click();
      await expect(steps.nth(1)).toContainText("failed");
      await expect.poll(shapes).toBe(1);
      expectOneMiddle(await markOf(page, steps.nth(1), down), 1, down);
      // In progress: the ring gives way to the light on the line.
      await page.getByRole("button", { name: "Clear failure" }).click();
      await page.getByRole("button", { name: "In progress" }).click();
      await expect.poll(shapes).toBe(1);
      expectOneMiddle(await markOf(page, steps.nth(1), down), 1, down);
      await page.close();
    });
  }
}

/**
 * The box round what is drawn in `clip` otherwise than in `before`, a picture of the same place
 * taken earlier: what the step drew in answer to the pointer or the keyboard. Each edge is placed
 * to the fraction of a pixel its blend says: a shape whose edge falls halfway across a device
 * pixel colours that pixel half as much as its inside, so a circle that stands half a pixel off the
 * pixel grid on one side is still measured round. Null when nothing changed.
 */
const changedBox = async (
  page: Page,
  clip: { x: number; y: number; width: number; height: number },
  before: Buffer
) => {
  const after = await page.screenshot({
    clip,
    fullPage: true,
    scale: "device",
  });
  return await page.evaluate(
    async ({ pictures, across }) => {
      const pixels = await Promise.all(
        pictures.map(async (png) => {
          const bitmap = await createImageBitmap(
            new Blob(
              [Uint8Array.from(atob(png), (char) => char.codePointAt(0) ?? 0)],
              { type: "image/png" }
            )
          );
          const context = new OffscreenCanvas(
            bitmap.width,
            bitmap.height
          ).getContext("2d");
          if (context === null) {
            throw new Error("No canvas to read the picture with.");
          }
          context.drawImage(bitmap, 0, 0);
          return context.getImageData(0, 0, bitmap.width, bitmap.height);
        })
      );
      const [was, now] = pixels;
      if (was === undefined || now === undefined) {
        throw new Error("Two pictures are needed.");
      }
      const { width, height } = now;
      const change = Array.from({ length: width * height }, (_, pixel) =>
        [0, 1, 2].reduce(
          (sum, at) =>
            sum +
            Math.abs(
              (was.data[pixel * 4 + at] ?? 0) - (now.data[pixel * 4 + at] ?? 0)
            ),
          0
        )
      );
      const most = Math.max(...change);
      if (most <= 12) {
        return null;
      }
      // How much of each column and each row the shape covers, at its fullest: 1 inside it.
      const columns = Array.from({ length: width }, () => 0);
      const rows = Array.from({ length: height }, () => 0);
      for (const [pixel, amount] of change.entries()) {
        const x = pixel % width;
        const y = (pixel - x) / width;
        columns[x] = Math.max(columns[x] ?? 0, amount / most);
        rows[y] = Math.max(rows[y] ?? 0, amount / most);
      }
      // Where the shape starts and ends along each side, in device pixels.
      const [sideways, upright] = [columns, rows].map((cover) => {
        const first = cover.findIndex((part) => part > 0.1);
        const last = cover.findLastIndex((part) => part > 0.1);
        return {
          start: first + 1 - (cover[first] ?? 0),
          end: last + (cover[last] ?? 0),
        };
      });
      if (sideways === undefined || upright === undefined) {
        throw new Error("Both sides are measured.");
      }
      const scale = width / across;
      return {
        left: sideways.start / scale,
        right: sideways.end / scale,
        top: upright.start / scale,
        bottom: upright.end / scale,
      };
    },
    {
      pictures: [before.toString("base64"), after.toString("base64")],
      across: clip.width,
    }
  );
};

for (const scale of [1, 1.5, 2, 3]) {
  for (const down of [false, true]) {
    for (const answer of ["hover", "focus"] as const) {
      test(`a step that can be pressed answers ${answer === "hover" ? "the pointer" : "the keyboard"} with a circle about its dot, ${down ? "down" : "across"} at ${scale}x`, async ({
        browser,
      }) => {
        const page = await browser.newPage({
          deviceScaleFactor: scale,
          reducedMotion: "reduce",
        });
        await openExample(page, "stepper", "fixture");
        const step = page
          .getByRole("list", { name: "Setting up the workspace" })
          .nth(down ? 1 : 0)
          .getByRole("listitem")
          .first();
        const press = step.getByRole("button", { name: /^Details\b/u });
        const { mark, origin } = await markOf(page, step, down);
        const [dot] = mark;
        if (dot === undefined) {
          throw new Error("No dot is drawn.");
        }
        expect(mark).toHaveLength(1);
        // The dot's middle on the page.
        const centre = {
          x: origin.x + middle(dot).x,
          y: origin.y + middle(dot).y,
        };
        // Round the dot, clear of the name: under it across, beside it down.
        const reach = { x: 22, y: down ? 22 : 17 };
        const clip = {
          x: centre.x - reach.x,
          y: centre.y - reach.y,
          width: 2 * reach.x,
          height: 2 * reach.y,
        };
        const before = await page.screenshot({
          clip,
          fullPage: true,
          scale: "device",
        });
        if (answer === "hover") {
          await press.hover();
        } else {
          await press.focus();
          await expect(press).toBeFocused();
          expect(
            await press.evaluate((node) => node.matches(":focus-visible"))
          ).toBe(true);
        }
        // Once the answer has eased in.
        await page.evaluate(async () => {
          await Promise.all(
            document
              .getAnimations()
              .map(async (motion) => await motion.finished)
          );
        });
        const shown = await changedBox(page, clip, before);
        if (shown === null) {
          throw new Error(`Nothing answers the ${answer}.`);
        }
        // A circle: its box is square, and about the dot's middle.
        expect(
          Math.abs(shown.right - shown.left - (shown.bottom - shown.top))
        ).toBeLessThan(0.5);
        expect(Math.abs(clip.x + middle(shown).x - centre.x)).toBeLessThan(0.5);
        expect(Math.abs(clip.y + middle(shown).y - centre.y)).toBeLessThan(0.5);
        await page.close();
      });
    }
  }
}
