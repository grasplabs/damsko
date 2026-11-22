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
  await expect(page.getByRole("progressbar", { name: "Progress" })).toHaveText(
    "Question 1 of 3"
  );
  const next = page.getByRole("button", { name: "Next" });
  await expect(next).toBeDisabled();
  await page.getByRole("radio", { name: /Supplier review/u }).click();
  await expect(next).toBeEnabled();
  await page.keyboard.press("ControlOrMeta+Enter");
  await expect(page.getByRole("progressbar", { name: "Progress" })).toHaveText(
    "Question 2 of 3"
  );
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
  // The first is required: no Skip.
  await expect(page.getByRole("button", { name: "Skip" })).toHaveCount(0);
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
