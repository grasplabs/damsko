import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

for (const [name, ratio] of [
  ["16:9", 16 / 9],
  ["4:3", 4 / 3],
  ["1:1", 1],
] as const) {
  test(`what it holds fills a box of ${name}`, async ({ page }) => {
    await openExample(page, "aspect-ratio", "ratios");
    const box = await page.getByText(name, { exact: true }).boundingBox();
    expect(box).not.toBeNull();
    expect((box?.width ?? 0) / (box?.height ?? 1)).toBeCloseTo(ratio, 1);
  });
}

test("flush in a frame, it keeps its ratio at the frame's width", async ({
  page,
}) => {
  await openExample(page, "aspect-ratio", "flush");
  const figure = await page.getByRole("figure").boundingBox();
  const caption = await page
    .getByText("The frame cuts the corner; the box sits flush.")
    .boundingBox();
  expect(figure).not.toBeNull();
  expect(caption).not.toBeNull();
  // The box is the figure's width, and its height is that over 16:9: the caption starts under it.
  const height = (caption?.y ?? 0) - (figure?.y ?? 0);
  expect((figure?.width ?? 0) / height).toBeCloseTo(16 / 9, 1);
});
