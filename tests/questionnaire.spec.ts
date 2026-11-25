import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("one choice: radios named by the question; Send waits for a choice, then the answer stands in one line", async ({
  page,
}) => {
  await openExample(page, "questionnaire", "single");
  const group = page.getByRole("radiogroup", {
    name: "Which report should I start with?",
  });
  await expect(group).toBeVisible();
  const send = page.getByRole("button", { name: "Send answer" });
  await expect(send).toBeDisabled();
  await group.getByRole("radio", { name: /Supplier review/u }).click();
  await expect(send).toBeEnabled();
  await send.click();
  await expect(page.getByRole("status")).toContainText("Supplier review");
  await expect(group).toBeHidden();
});

test("the recommended choice says so with its name", async ({ page }) => {
  await openExample(page, "questionnaire", "single");
  await expect(
    page.getByRole("radio", { name: /Quarterly summary.*Recommended/u })
  ).toBeVisible();
});

test("several choices: checkboxes, and the answer holds each one chosen", async ({
  page,
}) => {
  await openExample(page, "questionnaire", "multi");
  const group = page.getByRole("group", {
    name: "Where should I look for the decisions?",
  });
  await group.getByRole("checkbox", { name: /Email/u }).click();
  await group.getByRole("checkbox", { name: /Meeting notes/u }).click();
  await expect(
    group.getByRole("checkbox", { name: /Meeting notes/u })
  ).toBeChecked();
  await page.getByRole("button", { name: "Send answer" }).click();
  const answer = page.getByRole("status");
  await expect(answer).toContainText("Email");
  await expect(answer).toContainText("Meeting notes");
});

test("the answer holds the choices in the list's order, not the order they were chosen in", async ({
  page,
}) => {
  await openExample(page, "questionnaire", "multi");
  await page.getByRole("checkbox", { name: /Meeting notes/u }).click();
  await page.getByRole("checkbox", { name: /Email/u }).click();
  await page.getByRole("button", { name: "Send answer" }).click();
  await expect(page.getByRole("status")).toHaveText("Email, Meeting notes");
});

test("the person's own words: Send waits for them, and Enter sends", async ({
  page,
}) => {
  await openExample(page, "questionnaire", "text");
  const words = page.getByRole("textbox", {
    name: "What should the summary focus on?",
  });
  await expect(
    page.getByRole("button", { name: "Send answer" })
  ).toBeDisabled();
  await words.fill("The spring launch");
  await words.press("Enter");
  await expect(page.getByRole("status")).toContainText("The spring launch");
});

test("an answer that fails to send says so, and the choice stays to send again", async ({
  page,
}) => {
  await openExample(page, "questionnaire", "failed");
  const choice = page.getByRole("radio", { name: /A full report/u });
  await choice.click();
  await page.getByRole("button", { name: "Send answer" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Could not send the answer"
  );
  await expect(choice).toBeChecked();
  await expect(page.getByRole("button", { name: "Send answer" })).toBeEnabled();
});

test("sending held by the page: Send stays a Tab stop described by the reason, and neither it nor Enter sends", async ({
  page,
}) => {
  await openExample(page, "questionnaire", "held");
  const reason = "No assistant is connected, so the answer cannot be sent yet.";
  await expect(page.getByText(reason)).toBeVisible();
  const send = page.getByRole("button", { name: "Send answer" });
  await expect(send).toBeDisabled();
  await expect(send).toHaveAccessibleDescription(reason);
  // The person can still choose, and Enter on a choice sends nothing.
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowDown");
  const second = page.getByRole("radio", { name: /Supplier review/u });
  await expect(second).toBeChecked();
  await page.keyboard.press("Enter");
  await expect(second).toBeChecked();
  // The answer of its own, then Send.
  await page.keyboard.press("Tab");
  await expect(page.getByRole("textbox", { name: "Other" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(send).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect(second).toBeVisible();
});

test("the keyboard alone: Tab to the choices, the arrows between them, Enter sends", async ({
  page,
}) => {
  await openExample(page, "questionnaire", "single");
  await page.keyboard.press("Tab");
  const first = page.getByRole("radio", { name: /Quarterly summary/u });
  await expect(first).toBeFocused();
  await page.keyboard.press("ArrowDown");
  const second = page.getByRole("radio", { name: /Supplier review/u });
  await expect(second).toBeFocused();
  await expect(second).toBeChecked();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("Supplier review");
});

test("the number keys pick the first nine choices", async ({ page }) => {
  await openExample(page, "questionnaire", "columns");
  await page.getByRole("checkbox", { name: "Finance" }).focus();
  await page.keyboard.press("3");
  await expect(page.getByRole("checkbox", { name: "People" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "People" })).toBeFocused();
  await page.keyboard.press("3");
  await expect(
    page.getByRole("checkbox", { name: "People" })
  ).not.toBeChecked();
});

test("words of one's own take a single choice's place", async ({ page }) => {
  await openExample(page, "questionnaire", "single");
  const choice = page.getByRole("radio", { name: /Supplier review/u });
  await choice.click();
  await page.getByRole("textbox", { name: "Other" }).fill("Cash flow");
  await expect(choice).not.toBeChecked();
  await page.getByRole("button", { name: "Send answer" }).click();
  await expect(page.getByRole("status")).toHaveText("Cash flow");
});

test("once sent, focus lands on the answer's line", async ({ page }) => {
  await openExample(page, "questionnaire", "multi");
  await page.getByRole("checkbox", { name: "Calendar" }).click();
  await page.getByRole("button", { name: "Send answer" }).click();
  await expect(page.getByRole("status")).toBeFocused();
});

test("steps: progress says where, Next waits for an answer, Mod+Enter goes on, the left arrow goes back with the answer kept", async ({
  page,
}) => {
  await openExample(page, "questionnaire", "steps");
  // The head says what the run is at its start and the place at its end; a screen reader hears
  // the place as a whole sentence.
  const progress = page.getByRole("progressbar", { name: "Progress" });
  await expect(progress).toHaveText("Questions1 of 3");
  await expect(progress).toHaveAttribute("aria-valuetext", "Question 1 of 3");
  const next = page.getByRole("button", { name: "Next" });
  await expect(next).toBeDisabled();
  await page.getByRole("radio", { name: /Supplier review/u }).click();
  await expect(next).toBeEnabled();
  await page.keyboard.press("ControlOrMeta+Enter");
  await expect(progress).toHaveText("Questions2 of 3");
  const people = page.getByRole("checkbox", { name: "People" });
  await expect(people).toBeVisible();
  await expect(
    page.getByRole("radio", { name: /Supplier review/u })
  ).toBeHidden();
  await people.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(
    page.getByRole("radio", { name: /Supplier review/u })
  ).toBeChecked();
  await expect(page.getByRole("button", { name: "Previous" })).toHaveCount(0);
});

test("steps: an optional question is skipped, and the last one sends every answer in one line", async ({
  page,
}) => {
  await openExample(page, "questionnaire", "steps");
  await page.getByRole("radio", { name: /Quarterly summary/u }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("checkbox", { name: "Operations" }).click();
  await page.getByRole("checkbox", { name: "Finance" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Skip" }).click();
  await page.getByRole("button", { name: "Send answers" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Quarterly summary, Finance, Operations"
  );
});

test("Skip moves the question away, and the line in its place brings it back", async ({
  page,
}) => {
  await openExample(page, "questionnaire", "multi");
  await page.getByRole("button", { name: "Skip" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Skipped. I'll look everywhere."
  );
  await page.getByRole("button", { name: "Choose after all" }).click();
  // The question and its checkboxes are both groups named by it.
  await expect(
    page
      .getByRole("group", { name: "Where should I look for the decisions?" })
      .first()
  ).toBeVisible();
});

test("inside a prompt input it is a group of its own: Enter on a choice and Send answer it", async ({
  page,
}) => {
  await openExample(page, "questionnaire", "in-prompt-input");
  const question = page.getByRole("group", {
    name: "Which report should I start with?",
  });
  await expect(question).toBeVisible();
  await question.getByRole("radio", { name: "Supplier review" }).click();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("Supplier review");
  // Opened afresh, and waited on as the first time: a press before the page is live is lost.
  await openExample(page, "questionnaire", "in-prompt-input");
  await question.getByRole("radio", { name: "Quarterly summary" }).click();
  await page.getByRole("button", { name: "Send answer" }).click();
  await expect(page.getByRole("status")).toContainText("Quarterly summary");
});

test("right to left, a choice's control stands at the right of its words", async ({
  page,
}) => {
  await openExample(page, "questionnaire", "single");
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  const control = await page
    .getByRole("radio", { name: /Supplier review/u })
    .boundingBox();
  const words = await page
    .getByText("Supplier review", { exact: true })
    .boundingBox();
  expect(control).not.toBeNull();
  expect(words).not.toBeNull();
  expect(control?.x ?? 0).toBeGreaterThan(
    (words?.x ?? 0) + (words?.width ?? 0) - 1
  );
});

test.describe("on a touch screen", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 800 },
  });

  test("every choice and button takes a finger, 21px from its middle each way", async ({
    page,
  }) => {
    await openExample(page, "questionnaire", "multi");
    // Three choices, Skip and Send answer (and the old build's Other): a finger 21px off each
    // one's middle still lands on it, or on the row that labels it.
    const short = await page.evaluate(() =>
      [
        ...document.querySelectorAll<HTMLElement>(
          "form [role=checkbox], form button:not([role])"
        ),
      ]
        .filter((element) => {
          const box = element.getBoundingClientRect();
          const x = box.x + box.width / 2;
          const y = box.y + box.height / 2;
          const row = element.closest("label");
          return ![
            [0, -21],
            [0, 21],
            [-21, 0],
            [21, 0],
          ].every(([dx = 0, dy = 0]) => {
            const at = document.elementFromPoint(x + dx, y + dy);
            return (
              at !== null &&
              (element.contains(at) || (row !== null && row.contains(at)))
            );
          });
        })
        .map((element) => element.textContent)
    );
    expect(short).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      )
    ).toBe(false);
  });
});

test("item names every object knows (__proto__, constructor, toString) each send their answer", async ({
  page,
}) => {
  await openExample(page, "questionnaire", "untrusted");
  await page.getByRole("radio", { name: "Quarterly" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Finance" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: "Slides" }).click();
  await page.getByRole("button", { name: "Send answer" }).click();
  const got = page.getByRole("list", { name: "Answers received" });
  await expect(got.getByRole("listitem")).toHaveText([
    "__proto__: quarterly",
    "constructor: finance",
    "toString: slides",
  ]);
});

test("held by the page: a choice is chosen as its checked says, and the page hears every change", async ({
  page,
}) => {
  await openExample(page, "questionnaire", "controlled");
  const email = page.getByRole("checkbox", { name: "Email" });
  const notes = page.getByRole("checkbox", { name: "Meeting notes" });
  await email.click();
  await expect(email).toBeChecked();
  await expect(page.getByText("Chosen: email")).toBeVisible();
  await page.getByRole("button", { name: "Choose email and notes" }).click();
  await expect(notes).toBeChecked();
  await expect(page.getByText("Chosen: email, notes")).toBeVisible();
  await page.getByRole("textbox", { name: "Other" }).fill("Slack");
  await expect(page.getByText("; other: Slack")).toBeVisible();
  await page.getByRole("button", { name: "Send answer" }).click();
  await expect(page.getByText("Email, Meeting notes, Slack")).toBeVisible();
});

for (const theme of ["light", "dark"] as const) {
  test(`a choice shows its key boxed at its start; chosen, the box takes the main fill and a tick shows at its end, ${theme}`, async ({
    page,
  }) => {
    await openExample(page, "questionnaire", "steps", { theme });
    const card = page.locator("label").filter({ hasText: "Supplier review" });
    const read = async () =>
      await card.evaluate((label) => {
        const radio = label.querySelector("[role=radio]");
        const box = radio?.parentElement?.parentElement;
        const tick = label.lastElementChild;
        if (box === null || box === undefined || tick === null) {
          return null;
        }
        const probe = document.createElement("span");
        label.append(probe);
        const tokens = ["control", "primary"].map((name) => {
          probe.style.backgroundColor = `var(--damsko-${name})`;
          return getComputedStyle(probe).backgroundColor;
        });
        probe.remove();
        const look = getComputedStyle(box);
        return {
          size: [box.clientWidth, box.clientHeight],
          atStart:
            box.getBoundingClientRect().left <
            (label.querySelector("span[id]")?.getBoundingClientRect().left ??
              0),
          fill: tokens.indexOf(look.backgroundColor),
          tick: getComputedStyle(tick).visibility,
        };
      });
    expect(await read()).toEqual({
      size: [20, 20],
      atStart: true,
      fill: 0,
      tick: "hidden",
    });
    await page.getByRole("radio", { name: /Supplier review/u }).click();
    expect(await read()).toMatchObject({ fill: 1, tick: "visible" });
  });
}

test("words of one's own are one more card under the choices, reached by the key after the last choice", async ({
  page,
}) => {
  await openExample(page, "questionnaire", "steps");
  const other = page.getByRole("textbox", { name: "Other" });
  const last = page.locator("label").filter({ hasText: "Supplier review" });
  const [card, choice] = await Promise.all([
    other.locator("xpath=ancestor::label").boundingBox(),
    last.boundingBox(),
  ]);
  // The same card, as tall as the choices, their gap under the last one.
  expect(card?.x).toBe(choice?.x);
  expect(card?.width).toBe(choice?.width);
  expect(card?.height).toBe(choice?.height);
  expect((card?.y ?? 0) - ((choice?.y ?? 0) + (choice?.height ?? 0))).toBe(8);
  await page.getByRole("radio", { name: /Supplier review/u }).focus();
  await page.keyboard.press("3");
  await expect(other).toBeFocused();
  await page.keyboard.type("The hiring plan");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("checkbox", { name: "People" })).toBeVisible();
});

test("Skip is a ghost button and the steps are small", async ({ page }) => {
  await openExample(page, "questionnaire", "steps");
  const skip = page.getByRole("button", { name: "Skip" });
  await expect(skip).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(skip).toHaveCSS("box-shadow", "none");
  const box = await skip.boundingBox();
  expect(box?.height).toBe(32);
});

test("the question wraps as it falls, as the original's question did", async ({
  page,
}) => {
  await openExample(page, "questionnaire", "single");
  await expect(
    page.getByText("Which report should I start with?", { exact: true })
  ).toHaveCSS("text-wrap-style", "auto");
});
