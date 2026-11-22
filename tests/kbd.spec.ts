import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("each key shows its sign, and a symbol is read by its name", async ({
  page,
}) => {
  await openExample(page, "kbd", "keys");
  await Promise.all(
    ["Esc", "Shift", "Enter", "⌘"].map(async (sign) => {
      await expect(page.getByText(sign, { exact: true })).toBeVisible();
    })
  );
  await expect(page.getByText("Command", { exact: true })).toBeAttached();
  await expect(page.getByText("Command", { exact: true })).not.toBeInViewport();
});

for (const theme of ["light", "dark"] as const) {
  test(`a shortcut reads as part of its sentence, on its baseline, ${theme}`, async ({
    page,
  }) => {
    await openExample(page, "kbd", "shortcut", { theme });
    const sentence = page.getByText("to search.");
    await expect(sentence).toHaveText(/Press\s*⌘\s*Command\s*K\s*to search\./u);
    // A key is read as a word in the line: its sign stands on the sentence's baseline and its box
    // stays inside the line's own height.
    const offsets = await sentence.evaluate((line) => {
      const baselineMark =
        "display:inline-block;width:0;height:0;vertical-align:baseline";
      const marker = () => {
        const mark = document.createElement("i");
        mark.style.cssText = baselineMark;
        return mark;
      };
      const words = marker();
      line.append(words);
      const baseline = words.getBoundingClientRect().bottom;
      const lineBox = line.getBoundingClientRect();
      const keys = [...line.querySelectorAll("kbd:not(:has(kbd))")];
      const each = keys.map((key) => {
        const box = key.getBoundingClientRect();
        // The sign wrapped in a span with the marker, so the marker sits in the sign's own line.
        const holder = key.querySelector("span[aria-hidden]") ?? key;
        const wrap = document.createElement("span");
        const mark = marker();
        wrap.append(...holder.childNodes, mark);
        holder.append(wrap);
        const off = mark.getBoundingClientRect().bottom - baseline;
        mark.remove();
        holder.append(...wrap.childNodes);
        wrap.remove();
        return {
          off,
          inside:
            box.top >= lineBox.top - 0.5 && box.bottom <= lineBox.bottom + 0.5,
        };
      });
      words.remove();
      return each;
    });
    expect(offsets).toHaveLength(2);
    for (const { off, inside } of offsets) {
      expect(Math.abs(off)).toBeLessThanOrEqual(0.5);
      expect(inside).toBe(true);
    }
  });
}
