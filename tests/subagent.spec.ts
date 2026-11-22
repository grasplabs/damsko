import { expect, test } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

test("its line names the run and opens on the tool calls and what it found", async ({
  page,
}) => {
  await openExample(page, "subagent", "basic");
  const run = page.getByRole("button", { name: "Ran the research agent" });
  const found = page.getByText("The cache is keyed on the commit SHA.");
  await expect(run).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByText("Ran grep -rn cacheKey scripts", { exact: true })
  ).toBeVisible();
  await expect(found).toBeVisible();
  await run.click();
  await expect(run).toHaveAttribute("aria-expanded", "false");
  await expect(found).toBeHidden();
});

test("the keyboard reaches the line with a ring; Space closes and Enter opens", async ({
  page,
}) => {
  await openExample(page, "subagent", "basic");
  const run = page.getByRole("button", { name: "Ran the research agent" });
  await page.keyboard.press("Tab");
  await expect(run).toBeFocused();
  expect(await hasFocusRing(run)).toBe(true);
  await page.keyboard.press("Space");
  await expect(run).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("Enter");
  await expect(run).toHaveAttribute("aria-expanded", "true");
});

test("a run under way says it is working, and so does its running tool call", async ({
  page,
}) => {
  await openExample(page, "subagent", "running");
  await expect(
    page.getByRole("button", { name: /^Running the research agent.*Working$/u })
  ).toBeVisible();
  // Each running title shimmers: its words are drawn twice, once for the eye only.
  await expect(page.getByText(", Working", { exact: true })).toHaveCount(2);
});

test("details: the model and the time in its name, the task, a tool call's output and the output schema", async ({
  page,
}) => {
  await openExample(page, "subagent", "details");
  await expect(
    page.getByRole("button", {
      name: "Ran the research agent research-model-2 , 48s",
    })
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Instructions" })
  ).toContainText("Find out why image optimization reruns on every deploy.");
  await expect(
    page.getByRole("region", { name: "Output schema" })
  ).toBeVisible();
  const call = page.getByRole("button", {
    name: "Ran ls public/images | wc -l",
  });
  await expect(call).toHaveAttribute("aria-expanded", "false");
  await call.click();
  await expect(page.getByText("1240", { exact: true })).toBeVisible();
});
