// A one-row prompt input's model chip, step for step as the original design's one-row composer
// (its `useRowFit`). The chat page's box and the compact example, at rest and typed, are driven
// through one script: the box swept from its widest (576px) to its narrowest and back, and at six
// widths every model and level picked in turn, long to short to long, the text cleared and typed
// again, the window widened and narrowed. After every step the chip is whole with its words, its
// maker's mark alone, or away, and the row is one line or tall, as the original's was at that step
// (where a sweep crosses one of its edges, within one step): `expected` is the original's, recorded
// by the same script run against it, where they differ at no step. Every step is set by the box's
// own width, so the pages round it do not count.
import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { openExample, settled } from "./example.ts";

const typed = "And churn among teams of five?";

// Each box, its least width (a window of 300), and the widths the picks are made at (windows of
// about 390, 430, 470, 520, 600 and 1440), each clear of the row's edges with every choice, so
// words drawn a pixel wider on another system do not carry a step across one.
const examples = {
  chat: {
    at: ["patterns", "chat-page"],
    least: 204,
    picks: [294, 334, 374, 424, 530, 576],
  },
  compact: {
    at: ["prompt-input", "compact"],
    least: 252,
    picks: [342, 382, 422, 472, 552, 576],
  },
} as const;

type Example = keyof typeof examples;

const picks: [string, string?][] = [
  ["Claude Opus 5.5", "Low"],
  ["Claude Opus 5.5", "Medium"],
  ["Claude Opus 5.5", "High"],
  ["Claude Opus 5.5", "Extra high"],
  ["Claude Opus 5.5", "Max"],
  ["Claude Opus 5.5", "Extra high"],
  ["Claude Opus 5.5", "High"],
  ["Claude Opus 5.5", "Medium"],
  ["Claude Opus 5.5", "Low"],
  ["Claude Sonnet 5.5", "High"],
  ["Claude Haiku 5.5"],
  ["GPT-5.2", "Extra high"],
  ["Gemini 3 Pro", "Medium"],
  ["Gemini 3 Flash"],
  ["Gemini 3 Pro", "Low"],
  ["GPT-5.2", "Max"],
  ["Claude Haiku 5.5"],
  ["Claude Sonnet 5.5", "Medium"],
  ["Claude Opus 5.5", "Extra high"],
  ["Claude Haiku 5.5"],
  ["Claude Opus 5.5", "Medium"],
];

/** The box's widths in a sweep: 576px down to its least by 4px, and back up. */
const sweepOf = (example: Example): number[] => {
  const { least } = examples[example];
  const down = Array.from(
    { length: Math.floor((576 - least) / 4) + 1 },
    (_, step) => 576 - 4 * step
  );
  if (down.at(-1) !== least) {
    down.push(least);
  }
  return [...down, ...down.toReversed().slice(1)];
};

/** The box's text field. */
const textOf = (page: Page, example: Example): Locator =>
  example === "chat"
    ? page
        .getByRole("form", { name: "Message the assistant" })
        .getByRole("textbox", { name: "Message" })
    : page.getByRole("textbox", { name: "Message" });

/**
 * The box as it stands: its width, the chip (whole with its words, its mark alone, or away) and
 * whether the row is tall (Send under the text, not beside it).
 */
const stateOf = async (page: Page, example: Example) =>
  await textOf(page, example).evaluate((text) => {
    const form = text.closest("form");
    const card = text.closest('[data-slot="prompt-input"]') ?? form;
    if (form === null || card === null) {
      return { width: 0, state: "no box" };
    }
    // oxlint-disable-next-line unicorn/consistent-function-scoping -- runs in the page, so it carries its own helpers
    const shown = (element: Element | null) =>
      element !== null && element.getClientRects().length > 0;
    const buttons = [...form.querySelectorAll("button")];
    const chip = buttons.find((button) =>
      (button.getAttribute("aria-label") ?? "").startsWith("Model")
    );
    const send = buttons.findLast(shown);
    let look = "hidden";
    if (chip !== undefined && shown(chip)) {
      // The words it shows: the text whose element is drawn.
      const walk = document.createTreeWalker(chip, NodeFilter.SHOW_TEXT);
      const words: string[] = [];
      for (let node = walk.nextNode(); node !== null; node = walk.nextNode()) {
        if (shown(node.parentElement)) {
          words.push(node.textContent ?? "");
        }
      }
      const said = words.join(" ").replaceAll(/\s+/gu, " ").trim();
      look = said === "" ? "mark" : `whole(${said})`;
    }
    const tall =
      send !== undefined &&
      send.getBoundingClientRect().top >=
        text.getBoundingClientRect().bottom - 2;
    return {
      width: Math.round(card.getBoundingClientRect().width),
      state: `${look}${tall ? " tall" : ""}`,
    };
  });

/** The next frames, and a moment for what they set going. */
const drawn = async (page: Page) => {
  await settled(page);
  await page.waitForTimeout(60);
  await settled(page);
};

/** Sets the window so the box is `width` wide. */
const sizeTo = async (page: Page, example: Example, width: number) => {
  for (let tries = 0; tries < 4; tries += 1) {
    // oxlint-disable-next-line no-await-in-loop -- each try reads the last
    const { width: now } = await stateOf(page, example);
    if (now === width) {
      return;
    }
    const window = page.viewportSize()?.width ?? 0;
    // oxlint-disable-next-line no-await-in-loop -- each try reads the last
    await page.setViewportSize({ width: window + width - now, height: 900 });
    // oxlint-disable-next-line no-await-in-loop -- each try reads the last
    await drawn(page);
  }
  throw new Error(`The box is not ${width}px wide.`);
};

/** The example, opened at the window that gives its box `width`. */
const open = async (page: Page, example: Example, width: number) => {
  const [component, name] = examples[example].at;
  await page.setViewportSize({ width: 400, height: 900 });
  await openExample(page, component, name);
  const { width: at } = await stateOf(page, example);
  const room = 400 - at;
  await page.setViewportSize({ width: width + room, height: 900 });
  await openExample(page, component, name);
  await drawn(page);
  await sizeTo(page, example, width);
};

const type = async (page: Page, example: Example) => {
  await textOf(page, example).click();
  await page.keyboard.type(typed);
  await drawn(page);
};

/** Picks a model and its level through the chip's panel, then closes it; false if the chip is away. */
const pick = async (
  page: Page,
  example: Example,
  [model, level]: [string, string?]
) => {
  const chip = page.getByRole("button", { name: /^Model: /u });
  if (!(await chip.isVisible())) {
    return false;
  }
  await chip.click();
  const panel = page.getByRole("dialog");
  // The compact example's panel is the list alone; the chat page's search finds the model.
  if (example === "chat") {
    await panel.getByRole("combobox", { name: "Search models" }).fill(model);
  }
  await panel.getByRole("option", { name: model, exact: true }).click();
  if (level !== undefined) {
    await panel.getByRole("button", { name: level, exact: true }).click();
  }
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await page.mouse.move(1, 1);
  await drawn(page);
  return true;
};

// The original's states, recorded by this script run against it. A sweep's are runs: from that
// width on (going down, or back up), that state. A pick script's are its steps' in order.
const expected: Record<string, string[]> = {
  "chat empty sweep": [
    "down 576 whole(Medium)",
    "down 404 mark",
    "down 296 hidden",
    "up 300 mark",
    "up 408 whole(Medium)",
  ],
  "chat empty 294": [
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "mark",
    "hidden",
  ],
  "chat empty 334": [
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "whole(Claude Haiku 5.5)",
    "hidden",
  ],
  "chat empty 374": [
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "whole(Claude Haiku 5.5)",
    "hidden",
  ],
  "chat empty 424": [
    "whole(Medium)",
    "whole(Low)",
    "whole(Medium)",
    "whole(High)",
    "whole(Extra high)",
    "whole(Max)",
    "whole(Extra high)",
    "whole(High)",
    "whole(Medium)",
    "whole(Low)",
    "whole(High)",
    "whole(Claude Haiku 5.5)",
    "whole(Extra high)",
    "whole(Medium)",
    "whole(Gemini 3 Flash)",
    "whole(Low)",
    "whole(Max)",
    "whole(Claude Haiku 5.5)",
    "whole(Medium)",
    "whole(Extra high)",
    "whole(Claude Haiku 5.5)",
    "whole(Medium)",
    "whole(Medium)",
    "whole(Medium)",
  ],
  "chat empty 530": [
    "whole(Medium)",
    "whole(Low)",
    "whole(Medium)",
    "whole(High)",
    "whole(Extra high)",
    "whole(Max)",
    "whole(Extra high)",
    "whole(High)",
    "whole(Medium)",
    "whole(Low)",
    "whole(High)",
    "whole(Claude Haiku 5.5)",
    "whole(Extra high)",
    "whole(Medium)",
    "whole(Gemini 3 Flash)",
    "whole(Low)",
    "whole(Max)",
    "whole(Claude Haiku 5.5)",
    "whole(Medium)",
    "whole(Extra high)",
    "whole(Claude Haiku 5.5)",
    "whole(Medium)",
    "whole(Medium)",
    "whole(Medium)",
  ],
  "chat empty 576": [
    "whole(Medium)",
    "whole(Low)",
    "whole(Medium)",
    "whole(High)",
    "whole(Extra high)",
    "whole(Max)",
    "whole(Extra high)",
    "whole(High)",
    "whole(Medium)",
    "whole(Low)",
    "whole(High)",
    "whole(Claude Haiku 5.5)",
    "whole(Extra high)",
    "whole(Medium)",
    "whole(Gemini 3 Flash)",
    "whole(Low)",
    "whole(Max)",
    "whole(Claude Haiku 5.5)",
    "whole(Medium)",
    "whole(Extra high)",
    "whole(Claude Haiku 5.5)",
    "whole(Medium)",
    "whole(Medium)",
    "whole(Medium)",
  ],
  "chat typed sweep": [
    "down 576 whole(Medium)",
    "down 500 whole(Medium) tall",
    "down 404 mark tall",
    "up 408 whole(Medium) tall",
    "up 504 whole(Medium)",
  ],
  "chat typed 294": [
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "whole(Claude Haiku 5.5) tall",
    "mark tall",
    "mark tall",
    "whole(Gemini 3 Flash) tall",
    "mark tall",
    "mark tall",
    "whole(Claude Haiku 5.5) tall",
    "mark tall",
    "mark tall",
    "whole(Claude Haiku 5.5) tall",
    "mark tall",
    "hidden",
    "mark tall",
    "mark tall",
    "mark tall",
  ],
  "chat typed 334": [
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "whole(Claude Haiku 5.5) tall",
    "mark tall",
    "mark tall",
    "whole(Gemini 3 Flash) tall",
    "mark tall",
    "mark tall",
    "whole(Claude Haiku 5.5) tall",
    "mark tall",
    "mark tall",
    "whole(Claude Haiku 5.5) tall",
    "mark tall",
    "mark",
    "mark tall",
    "whole(Medium) tall",
    "mark tall",
  ],
  "chat typed 374": [
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "whole(Claude Haiku 5.5) tall",
    "mark tall",
    "mark tall",
    "whole(Gemini 3 Flash) tall",
    "mark tall",
    "mark tall",
    "whole(Claude Haiku 5.5) tall",
    "mark tall",
    "mark tall",
    "whole(Claude Haiku 5.5) tall",
    "mark tall",
    "mark",
    "mark tall",
    "whole(Medium) tall",
    "mark tall",
  ],
  "chat typed 424": [
    "whole(Medium) tall",
    "whole(Low) tall",
    "whole(Medium) tall",
    "whole(High) tall",
    "whole(Extra high) tall",
    "whole(Max) tall",
    "whole(Extra high) tall",
    "whole(High) tall",
    "whole(Medium) tall",
    "whole(Low) tall",
    "whole(High) tall",
    "whole(Claude Haiku 5.5) tall",
    "whole(Extra high) tall",
    "whole(Medium) tall",
    "whole(Gemini 3 Flash) tall",
    "whole(Low) tall",
    "whole(Max) tall",
    "whole(Claude Haiku 5.5) tall",
    "whole(Medium) tall",
    "whole(Extra high) tall",
    "whole(Claude Haiku 5.5) tall",
    "whole(Medium) tall",
    "whole(Medium)",
    "whole(Medium) tall",
    "whole(Medium)",
    "whole(Medium) tall",
  ],
  "chat typed 530": [
    "whole(Medium)",
    "whole(Low)",
    "whole(Medium)",
    "whole(High)",
    "whole(Extra high)",
    "whole(Max)",
    "whole(Extra high)",
    "whole(High)",
    "whole(Medium)",
    "whole(Low)",
    "whole(High)",
    "whole(Claude Haiku 5.5) tall",
    "whole(Extra high)",
    "whole(Medium)",
    "whole(Gemini 3 Flash) tall",
    "whole(Low)",
    "whole(Max)",
    "whole(Claude Haiku 5.5) tall",
    "whole(Medium)",
    "whole(Extra high)",
    "whole(Claude Haiku 5.5) tall",
    "whole(Medium)",
    "whole(Medium)",
    "whole(Medium)",
    "whole(Medium)",
    "whole(Medium)",
  ],
  "chat typed 576": [
    "whole(Medium)",
    "whole(Low)",
    "whole(Medium)",
    "whole(High)",
    "whole(Extra high)",
    "whole(Max)",
    "whole(Extra high)",
    "whole(High)",
    "whole(Medium)",
    "whole(Low)",
    "whole(High)",
    "whole(Claude Haiku 5.5)",
    "whole(Extra high)",
    "whole(Medium)",
    "whole(Gemini 3 Flash)",
    "whole(Low)",
    "whole(Max)",
    "whole(Claude Haiku 5.5)",
    "whole(Medium)",
    "whole(Extra high)",
    "whole(Claude Haiku 5.5)",
    "whole(Medium)",
    "whole(Medium)",
    "whole(Medium)",
    "whole(Medium)",
    "whole(Medium)",
  ],
  "compact empty sweep": [
    "down 576 whole(Medium)",
    "down 404 mark",
    "down 296 hidden",
    "up 300 mark",
    "up 408 whole(Medium)",
  ],
  "compact empty 342": [
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "whole(Claude Haiku 5.5)",
    "hidden",
  ],
  "compact empty 382": [
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "mark",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "hidden",
    "whole(Claude Haiku 5.5)",
    "hidden",
  ],
  "compact empty 422": [
    "whole(Medium)",
    "whole(Low)",
    "whole(Medium)",
    "whole(High)",
    "whole(Extra high)",
    "whole(Max)",
    "whole(Extra high)",
    "whole(High)",
    "whole(Medium)",
    "whole(Low)",
    "whole(High)",
    "whole(Claude Haiku 5.5)",
    "whole(Extra high)",
    "whole(Medium)",
    "whole(Gemini 3 Flash)",
    "whole(Low)",
    "whole(Max)",
    "whole(Claude Haiku 5.5)",
    "whole(Medium)",
    "whole(Extra high)",
    "whole(Claude Haiku 5.5)",
    "whole(Medium)",
    "whole(Medium)",
    "whole(Medium)",
  ],
  "compact empty 472": [
    "whole(Medium)",
    "whole(Low)",
    "whole(Medium)",
    "whole(High)",
    "whole(Extra high)",
    "whole(Max)",
    "whole(Extra high)",
    "whole(High)",
    "whole(Medium)",
    "whole(Low)",
    "whole(High)",
    "whole(Claude Haiku 5.5)",
    "whole(Extra high)",
    "whole(Medium)",
    "whole(Gemini 3 Flash)",
    "whole(Low)",
    "whole(Max)",
    "whole(Claude Haiku 5.5)",
    "whole(Medium)",
    "whole(Extra high)",
    "whole(Claude Haiku 5.5)",
    "whole(Medium)",
    "whole(Medium)",
    "whole(Medium)",
  ],
  "compact empty 552": [
    "whole(Medium)",
    "whole(Low)",
    "whole(Medium)",
    "whole(High)",
    "whole(Extra high)",
    "whole(Max)",
    "whole(Extra high)",
    "whole(High)",
    "whole(Medium)",
    "whole(Low)",
    "whole(High)",
    "whole(Claude Haiku 5.5)",
    "whole(Extra high)",
    "whole(Medium)",
    "whole(Gemini 3 Flash)",
    "whole(Low)",
    "whole(Max)",
    "whole(Claude Haiku 5.5)",
    "whole(Medium)",
    "whole(Extra high)",
    "whole(Claude Haiku 5.5)",
    "whole(Medium)",
    "whole(Medium)",
    "whole(Medium)",
  ],
  "compact empty 576": [
    "whole(Medium)",
    "whole(Low)",
    "whole(Medium)",
    "whole(High)",
    "whole(Extra high)",
    "whole(Max)",
    "whole(Extra high)",
    "whole(High)",
    "whole(Medium)",
    "whole(Low)",
    "whole(High)",
    "whole(Claude Haiku 5.5)",
    "whole(Extra high)",
    "whole(Medium)",
    "whole(Gemini 3 Flash)",
    "whole(Low)",
    "whole(Max)",
    "whole(Claude Haiku 5.5)",
    "whole(Medium)",
    "whole(Extra high)",
    "whole(Claude Haiku 5.5)",
    "whole(Medium)",
    "whole(Medium)",
    "whole(Medium)",
  ],
  "compact typed sweep": [
    "down 576 whole(Medium)",
    "down 500 whole(Medium) tall",
    "down 404 mark tall",
    "up 408 whole(Medium) tall",
    "up 504 whole(Medium)",
  ],
  "compact typed 342": [
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "whole(Claude Haiku 5.5) tall",
    "mark tall",
    "mark tall",
    "whole(Gemini 3 Flash) tall",
    "mark tall",
    "mark tall",
    "whole(Claude Haiku 5.5) tall",
    "mark tall",
    "mark tall",
    "whole(Claude Haiku 5.5) tall",
    "mark tall",
    "mark",
    "mark tall",
    "whole(Medium) tall",
    "mark tall",
  ],
  "compact typed 382": [
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "mark tall",
    "whole(Claude Haiku 5.5) tall",
    "mark tall",
    "mark tall",
    "whole(Gemini 3 Flash) tall",
    "mark tall",
    "mark tall",
    "whole(Claude Haiku 5.5) tall",
    "mark tall",
    "mark tall",
    "whole(Claude Haiku 5.5) tall",
    "mark tall",
    "mark",
    "mark tall",
    "whole(Medium) tall",
    "mark tall",
  ],
  "compact typed 422": [
    "whole(Medium) tall",
    "whole(Low) tall",
    "whole(Medium) tall",
    "whole(High) tall",
    "whole(Extra high) tall",
    "whole(Max) tall",
    "whole(Extra high) tall",
    "whole(High) tall",
    "whole(Medium) tall",
    "whole(Low) tall",
    "whole(High) tall",
    "whole(Claude Haiku 5.5) tall",
    "whole(Extra high) tall",
    "whole(Medium) tall",
    "whole(Gemini 3 Flash) tall",
    "whole(Low) tall",
    "whole(Max) tall",
    "whole(Claude Haiku 5.5) tall",
    "whole(Medium) tall",
    "whole(Extra high) tall",
    "whole(Claude Haiku 5.5) tall",
    "whole(Medium) tall",
    "whole(Medium)",
    "whole(Medium) tall",
    "whole(Medium)",
    "whole(Medium) tall",
  ],
  "compact typed 472": [
    "whole(Medium) tall",
    "whole(Low) tall",
    "whole(Medium) tall",
    "whole(High) tall",
    "whole(Extra high) tall",
    "whole(Max) tall",
    "whole(Extra high) tall",
    "whole(High) tall",
    "whole(Medium) tall",
    "whole(Low) tall",
    "whole(High) tall",
    "whole(Claude Haiku 5.5) tall",
    "whole(Extra high) tall",
    "whole(Medium) tall",
    "whole(Gemini 3 Flash) tall",
    "whole(Low) tall",
    "whole(Max) tall",
    "whole(Claude Haiku 5.5) tall",
    "whole(Medium) tall",
    "whole(Extra high) tall",
    "whole(Claude Haiku 5.5) tall",
    "whole(Medium) tall",
    "whole(Medium)",
    "whole(Medium) tall",
    "whole(Medium)",
    "whole(Medium) tall",
  ],
  "compact typed 552": [
    "whole(Medium)",
    "whole(Low)",
    "whole(Medium)",
    "whole(High)",
    "whole(Extra high)",
    "whole(Max)",
    "whole(Extra high)",
    "whole(High)",
    "whole(Medium)",
    "whole(Low)",
    "whole(High)",
    "whole(Claude Haiku 5.5) tall",
    "whole(Extra high)",
    "whole(Medium)",
    "whole(Gemini 3 Flash)",
    "whole(Low)",
    "whole(Max)",
    "whole(Claude Haiku 5.5) tall",
    "whole(Medium)",
    "whole(Extra high)",
    "whole(Claude Haiku 5.5) tall",
    "whole(Medium)",
    "whole(Medium)",
    "whole(Medium)",
    "whole(Medium)",
    "whole(Medium)",
  ],
  "compact typed 576": [
    "whole(Medium)",
    "whole(Low)",
    "whole(Medium)",
    "whole(High)",
    "whole(Extra high)",
    "whole(Max)",
    "whole(Extra high)",
    "whole(High)",
    "whole(Medium)",
    "whole(Low)",
    "whole(High)",
    "whole(Claude Haiku 5.5)",
    "whole(Extra high)",
    "whole(Medium)",
    "whole(Gemini 3 Flash)",
    "whole(Low)",
    "whole(Max)",
    "whole(Claude Haiku 5.5)",
    "whole(Medium)",
    "whole(Extra high)",
    "whole(Claude Haiku 5.5)",
    "whole(Medium)",
    "whole(Medium)",
    "whole(Medium)",
    "whole(Medium)",
    "whole(Medium)",
  ],
};

for (const example of ["chat", "compact"] as const) {
  for (const mode of ["at rest", "typed"] as const) {
    const key = `${example} ${mode === "typed" ? "typed" : "empty"}`;

    test(`${example}, ${mode}: swept narrower and wider, the chip and the row are the original's at every width`, async ({
      page,
    }) => {
      test.setTimeout(120_000);
      await open(page, example, 576);
      if (mode === "typed") {
        await type(page, example);
      }
      const sweep = sweepOf(example);
      const turn = sweep.indexOf(examples[example].least);
      const runs = expected[`${key} sweep`] ?? [];
      const steps = sweep.map(
        (width, at) => `${at <= turn ? "down" : "up"} ${width}`
      );
      // The original's state at each step, from the run it falls in.
      const states: string[] = [];
      for (const step of steps) {
        states.push(
          runs
            .find((run) => run.startsWith(`${step} `))
            ?.slice(step.length + 1) ??
            states.at(-1) ??
            ""
        );
      }
      const seen: string[] = [];
      const want: string[] = [];
      for (const [at, width] of sweep.entries()) {
        // oxlint-disable-next-line no-await-in-loop -- one width after the other, as a window is dragged
        await sizeTo(page, example, width);
        // oxlint-disable-next-line no-await-in-loop -- one width after the other, as a window is dragged
        const { state } = await stateOf(page, example);
        // Where the original's state changes, the step on either side may show either: another
        // system draws the typed words a pixel or so wider (Linux's font rendering), which moves
        // the row's edge by up to a step.
        const either = [states[at - 1], states[at], states[at + 1]];
        seen.push(`${steps[at]} ${state}`);
        want.push(
          `${steps[at]} ${either.includes(state) ? state : states[at]}`
        );
      }
      expect(seen).toEqual(want);
    });

    for (const width of examples[example].picks) {
      test(`${example}, ${mode}, a box ${width}px wide: every model and level picked in turn, the chip and the row are the original's after each`, async ({
        page,
      }) => {
        test.setTimeout(120_000);
        const seen: string[] = [];
        const look = async (step: string) => {
          const now = await stateOf(page, example);
          seen.push(`${step}: ${now.state}`);
        };
        await open(page, example, width);
        if (mode === "typed") {
          await type(page, example);
        }
        await look("start");
        for (const choice of picks) {
          // oxlint-disable-next-line no-await-in-loop -- one pick after the other
          const done = await pick(page, example, choice);
          // oxlint-disable-next-line no-await-in-loop -- one pick after the other
          await look(`${choice.join(" ")}${done ? "" : " (chip away)"}`);
        }
        if (mode === "typed") {
          await textOf(page, example).click();
          await page.keyboard.press("ControlOrMeta+a");
          await page.keyboard.press("Backspace");
          await drawn(page);
          await look("cleared");
          await type(page, example);
          await look("typed again");
        }
        await sizeTo(page, example, Math.min(576, width + 100));
        await look("wider");
        await sizeTo(page, example, width);
        await look("back");
        const steps = seen.map((each) => each.slice(0, each.lastIndexOf(": ")));
        expect(seen).toEqual(
          (expected[`${key} ${width}`] ?? []).map(
            (state, at) => `${steps[at]}: ${state}`
          )
        );
      });
    }
  }
}

// The text field's width in the box at windows of 300, 390 and 430, at rest and typed: the
// original's, recorded against it. At rest it is what the chip, its step and the tools leave it
// (none of these boxes is at one of the row's edges, so no step's tolerance is needed); typed, the
// row is tall and the field has the card's width.
const fields: Record<Example, [number, number, number][]> = {
  // The box's width, then the field's at rest and typed.
  chat: [
    [204, 60, 180],
    [294, 150, 270],
    [334, 130, 310],
  ],
  compact: [
    [252, 108, 228],
    [342, 138, 318],
    [382, 178, 358],
  ],
};

for (const example of ["chat", "compact"] as const) {
  for (const [width, rest, typedWidth] of fields[example]) {
    test(`${example}, a box ${width}px wide: the text field is the original's width, at rest and typed`, async ({
      page,
    }) => {
      const field = async () => {
        const box = await textOf(page, example).boundingBox();
        return Math.round(box?.width ?? Number.NaN);
      };
      await open(page, example, width);
      expect(await field()).toBe(rest);
      await type(page, example);
      expect(await field()).toBe(typedWidth);
    });
  }
}
