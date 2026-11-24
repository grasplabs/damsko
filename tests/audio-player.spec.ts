import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("its controls are named for what they do", async ({ page }) => {
  await openExample(page, "audio-player", "basic");
  const bar = page.getByRole("region", { name: "Four-note chime" });
  await Promise.all(
    [
      "Play",
      "Back 10 seconds",
      "Forward 10 seconds",
      "Speed 1×",
      "Turn sound off",
    ].map(async (name) => {
      await expect(
        bar.getByRole("button", { name, exact: true })
      ).toBeVisible();
    })
  );
  await expect(bar.getByRole("slider", { name: "Position" })).toHaveAttribute(
    "aria-valuetext",
    "0 seconds of 16 seconds"
  );
  await expect(bar.getByText("0:16")).toBeVisible();
});

test("in another language every control and the time are said in that language", async ({
  page,
}) => {
  await openExample(page, "audio-player", "labels");
  const bar = page.getByRole("region", { name: "Klokkenspel in vier tonen" });
  await Promise.all(
    [
      "Afspelen",
      "10 seconden terug",
      "10 seconden vooruit",
      "Snelheid 1×",
      "Geluid uit",
    ].map(async (name) => {
      await expect(
        bar.getByRole("button", { name, exact: true })
      ).toBeVisible();
    })
  );
  await expect(bar.getByRole("slider", { name: "Positie" })).toHaveAttribute(
    "aria-valuetext",
    "0 seconden van 16 seconden"
  );
});

test("Play plays and turns into Pause, which pauses", async ({ page }) => {
  await openExample(page, "audio-player", "basic");
  const bar = page.getByRole("region", { name: "Four-note chime" });
  await bar.getByRole("button", { name: "Play" }).click();
  await bar.getByRole("button", { name: "Pause" }).click();
  await expect(bar.getByRole("button", { name: "Play" })).toBeVisible();
});

test("the skips, the rate and the sound", async ({ page }) => {
  await openExample(page, "audio-player", "basic");
  const bar = page.getByRole("region", { name: "Four-note chime" });
  const position = bar.getByRole("slider", { name: "Position" });
  await bar.getByRole("button", { name: "Forward 10 seconds" }).click();
  await expect(position).toHaveAttribute(
    "aria-valuetext",
    "10 seconds of 16 seconds"
  );
  await bar.getByRole("button", { name: "Forward 10 seconds" }).click();
  // Never past the end.
  await expect(position).toHaveAttribute(
    "aria-valuetext",
    "16 seconds of 16 seconds"
  );
  await bar.getByRole("button", { name: "Back 10 seconds" }).click();
  await expect(position).toHaveAttribute(
    "aria-valuetext",
    "6 seconds of 16 seconds"
  );
  await bar.getByRole("button", { name: "Speed 1×" }).click();
  await expect(bar.getByRole("button", { name: "Speed 1.25×" })).toBeVisible();
  await bar.getByRole("button", { name: "Turn sound off" }).click();
  await expect(
    bar.getByRole("button", { name: "Turn sound on" })
  ).toBeVisible();
});

test("the rates it is given, from the first, round again", async ({ page }) => {
  await openExample(page, "audio-player", "speeds");
  const bar = page.getByRole("region", { name: "Four-note chime" });
  await bar.getByRole("button", { name: "Speed 1×" }).click();
  await bar.getByRole("button", { name: "Speed 0.75×" }).click();
  await bar.getByRole("button", { name: "Speed 0.5×" }).click();
  await expect(bar.getByRole("button", { name: "Speed 1×" })).toBeVisible();
});

test("seeking by keys: the timeline's own arrows, the bar's five seconds", async ({
  page,
}) => {
  await openExample(page, "audio-player", "basic");
  const bar = page.getByRole("region", { name: "Four-note chime" });
  const position = bar.getByRole("slider", { name: "Position" });
  await position.focus();
  await page.keyboard.press("ArrowRight");
  await expect(position).toHaveAttribute(
    "aria-valuetext",
    "1 second of 16 seconds"
  );
  await page.keyboard.press("End");
  await expect(position).toHaveAttribute(
    "aria-valuetext",
    "16 seconds of 16 seconds"
  );
  await page.keyboard.press("Home");
  // On a button, the arrows go on and back five seconds.
  await bar.getByRole("button", { name: "Turn sound off" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(position).toHaveAttribute(
    "aria-valuetext",
    "5 seconds of 16 seconds"
  );
  await page.keyboard.press("ArrowLeft");
  await expect(position).toHaveAttribute(
    "aria-valuetext",
    "0 seconds of 16 seconds"
  );
});

test("K and Space play and pause, M turns the sound off, and the page stays put", async ({
  page,
}) => {
  await openExample(page, "audio-player", "basic");
  const bar = page.getByRole("region", { name: "Four-note chime" });
  const before = await page.evaluate(() => window.scrollY);
  await bar.getByRole("slider", { name: "Position" }).focus();
  await page.keyboard.press("Space");
  await expect(bar.getByRole("button", { name: "Pause" })).toBeVisible();
  await page.keyboard.press("k");
  await expect(bar.getByRole("button", { name: "Play" })).toBeVisible();
  await page.keyboard.press("m");
  await expect(
    bar.getByRole("button", { name: "Turn sound on" })
  ).toBeVisible();
  // Space on a button presses that button.
  await bar.getByRole("button", { name: "Turn sound on" }).focus();
  await page.keyboard.press("Space");
  await expect(
    bar.getByRole("button", { name: "Turn sound off" })
  ).toBeVisible();
  await expect(bar.getByRole("button", { name: "Play" })).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
});

test("one sound at a time: starting a second player pauses the first", async ({
  page,
}) => {
  await openExample(page, "audio-player", "narrow");
  const medium = page.getByRole("region", {
    name: "Four-note chime, medium bar",
  });
  const small = page.getByRole("region", {
    name: "Four-note chime, small bar",
  });
  await medium.getByRole("button", { name: "Play" }).click();
  await expect(medium.getByRole("button", { name: "Pause" })).toBeVisible();
  await small.getByRole("button", { name: "Play" }).click();
  await expect(small.getByRole("button", { name: "Pause" })).toBeVisible();
  await expect(medium.getByRole("button", { name: "Play" })).toBeVisible();
});

test("narrow, the skips go first, then the times", async ({ page }) => {
  await openExample(page, "audio-player", "narrow");
  const medium = page.getByRole("region", {
    name: "Four-note chime, medium bar",
  });
  const small = page.getByRole("region", {
    name: "Four-note chime, small bar",
  });
  await expect(
    medium.getByRole("button", { name: "Back 10 seconds" })
  ).toBeHidden();
  await expect(medium.getByText("0:16")).toBeVisible();
  await expect(small.getByText("0:16")).toBeHidden();
  await expect(small.getByRole("slider", { name: "Position" })).toBeVisible();
});

test("a file that cannot play says so in place of the controls", async ({
  page,
}) => {
  await openExample(page, "audio-player", "failed");
  const bar = page.getByRole("region", { name: "Recording that was moved" });
  await expect(bar.getByRole("alert")).toHaveText(
    "Could not play this file. It may have been moved."
  );
  await expect(bar.getByRole("button")).toHaveCount(0);
});

test("a failed bar keeps the bar's height: on a phone its two lines fill it, no taller", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openExample(page, "audio-player", "failed");
  const alert = page
    .getByRole("region", { name: "Recording that was moved" })
    .getByRole("alert");
  const box = await alert.boundingBox();
  // Two lines of small words, 20px each, in the bar's 40px.
  expect(box?.height).toBe(40);
});

test("a player stands at its own width, beside another of the same", async ({
  page,
}) => {
  await openExample(page, "audio-player", "switch");
  const box = await page
    .getByRole("region", { name: "First take" })
    .boundingBox();
  expect(box?.width).toBe(640);
});

test("a moment of the file, heard and sent elsewhere from the page", async ({
  page,
}) => {
  await openExample(page, "audio-player", "moment");
  const bar = page.getByRole("region", { name: "From 0:04 to 0:06" });
  const position = bar.getByRole("slider", { name: "Position" });
  await expect(position).toHaveAttribute(
    "aria-valuetext",
    "4 seconds of 16 seconds"
  );
  await page.getByRole("button", { name: "Go to 0:10" }).click();
  await expect(position).toHaveAttribute(
    "aria-valuetext",
    "10 seconds of 16 seconds"
  );
  await expect(page.getByText("Heard at 10.0 seconds")).toBeVisible();
});

test("a remote sound from a chat is never requested, and what is not sound never plays; a sound written into the address does", async ({
  page,
}) => {
  const requested: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).hostname.endsWith("example.com")) {
      requested.push(request.url());
    }
  });
  await openExample(page, "audio-player", "untrusted");
  await Promise.all(
    ["Voice note from a link", "A drawing, not a sound"].map(async (name) => {
      const bar = page.getByRole("region", { name });
      await expect(bar.getByRole("alert")).toHaveText(
        "Could not play this file"
      );
      await expect(bar.getByRole("button")).toHaveCount(0);
    })
  );
  const inline = page.getByRole("region", {
    name: "Voice note written into the address",
  });
  await expect(inline.getByRole("button", { name: "Play" })).toBeVisible();
  await expect(inline.getByRole("alert")).toHaveCount(0);
  await page.waitForLoadState("networkidle");
  expect(requested).toStrictEqual([]);
});

for (const example of ["switch", "untrusted"]) {
  test(`on a phone the ${example} column of players fits the page, with no sideways scroll`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openExample(page, "audio-player", example);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth
      )
    ).toBe(true);
  });
}
