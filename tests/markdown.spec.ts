import { readFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { listenToLiveRegions, openExample } from "./example.ts";

/** What the page shows now that it should never show while an answer streams. */
const strayMarks = async (page: Page) =>
  await page.evaluate(() => ({
    wrong: [...document.querySelectorAll("p, li")]
      .map((block) => block.textContent)
      .filter(
        (text) =>
          text.trimStart().startsWith("|") ||
          text.includes("```") ||
          /\]\(|\[[^\]]*$/u.test(text)
      ),
    tables: document.querySelectorAll("table").length,
  }));

/**
 * Watches the page for `ms` while an answer streams, and gives back every text it should never
 * have shown (a paragraph of pipes: a table not yet whole; fence marks; a link's brackets) and
 * whether a table was ever drawn.
 */
const watchStream = async (page: Page, ms: number) => {
  const wrong = new Set<string>();
  let tables = 0;
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // One look at a time, in order: each waits for the one before.
    // oxlint-disable-next-line no-await-in-loop
    const seen = await strayMarks(page);
    for (const text of seen.wrong) {
      wrong.add(text.slice(0, 60));
    }
    tables = Math.max(tables, seen.tables);
  }
  return { wrong: [...wrong], tables };
};

test("an answer: its heading, list, table, code with copy, quote and a link that opens safely", async ({
  page,
}) => {
  await openExample(page, "markdown", "answer");
  await expect(
    page.getByRole("heading", { level: 2, name: "Summary of the comments" })
  ).toBeVisible();
  await expect(page.getByRole("list").first().getByRole("listitem")).toHaveText(
    [
      "The support numbers for March look low.",
      "The move to the new office needs a date.",
    ]
  );
  await expect(page.getByText("await report.share(")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Copy", exact: true })
  ).toBeVisible();
  await expect(
    page.getByText('Lena: "Can we add the survey results before Friday?"')
  ).toBeVisible();
  const link = page.getByRole("link", {
    name: "sharing guide (opens in a new tab)",
  });
  await expect(link).toHaveAttribute(
    "href",
    "https://example.com/guides/sharing"
  );
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");
});

test("fenced code: coloured in its language, named over it, and Download saves it as a file of that language", async ({
  page,
}) => {
  await openExample(page, "markdown", "code");
  const block = page.getByRole("region", { name: "TypeScript" });
  await expect(
    block.getByText("export async function withRetry")
  ).toBeVisible();
  // Coloured once the worker has read it: a keyword is a span of its own.
  await expect(block.locator("span", { hasText: /^export$/u })).toHaveCount(1);
  const [file] = await Promise.all([
    page.waitForEvent("download"),
    block.getByRole("button", { name: "Download" }).click(),
  ]);
  expect(file.suggestedFilename()).toBe("file.ts");
  const saved = await file.path();
  expect(await readFile(saved, "utf-8")).toContain(
    "export async function withRetry(call: () => Promise<Response>, tries = 3) {"
  );
  const shell = page.getByRole("region", { name: "Bash" });
  const [script] = await Promise.all([
    page.waitForEvent("download"),
    shell.getByRole("button", { name: "Download" }).click(),
  ]);
  expect(script.suggestedFilename()).toBe("file.sh");
  await expect(shell.getByRole("button", { name: "Copy" })).toBeEnabled();
});

test("a table is a table, named by the heading above it, its columns headed", async ({
  page,
}) => {
  await openExample(page, "markdown", "answer");
  const table = page.getByRole("table", { name: "Summary of the comments" });
  await expect(table.getByRole("columnheader")).toHaveText([
    "Section",
    "Comments",
    "Open",
  ]);
  await expect(table.getByRole("row")).toHaveCount(4);
  await expect(
    table.getByRole("row", { name: "Risks 4 2" }).getByRole("cell")
  ).toHaveText(["Risks", "4", "2"]);
});

test.describe("a table's controls", () => {
  // Only Chromium has the clipboard's permissions: a context asked for them elsewhere does not open.
  test.use({
    permissions: async ({ browserName }, give) => {
      await give(browserName === "chromium" ? ["clipboard-write"] : []);
    },
  });

  test("a table: Copy as Markdown, CSV or TSV, and Download as CSV or Markdown", async ({
    page,
  }) => {
    const said = await listenToLiveRegions(page);
    await openExample(page, "markdown", "answer");
    const save = async (format: string) => {
      await page.getByRole("button", { name: "Download table" }).click();
      const [file] = await Promise.all([
        page.waitForEvent("download"),
        page.getByRole("menuitem", { name: format }).click(),
      ]);
      return {
        name: file.suggestedFilename(),
        text: await readFile(await file.path(), "utf-8"),
      };
    };
    // Each names itself in a tooltip, as CodeBlock's buttons do.
    await page.getByRole("button", { name: "Copy table" }).hover();
    await expect(page.getByRole("tooltip")).toHaveText("Copy table");
    expect(await save("CSV")).toStrictEqual({
      name: "table.csv",
      text: "\uFEFFSection,Comments,Open\r\nHighlights,5,0\r\nRisks,4,2\r\nNext steps,3,0",
    });
    expect(await save("Markdown")).toStrictEqual({
      name: "table.md",
      text: "| Section | Comments | Open |\n| --- | --- | --- |\n| Highlights | 5 | 0 |\n| Risks | 4 | 2 |\n| Next steps | 3 | 0 |",
    });
    await page.getByRole("button", { name: "Copy table" }).click();
    await expect(page.getByRole("menuitem")).toHaveText([
      "Markdown",
      "CSV",
      "TSV",
    ]);
    await page.getByRole("menuitem", { name: "TSV" }).click();
    await expect.poll(said).toContain("Copied");
  });
});

test("a tag on a line of its own is its words, and the list after it a list of links", async ({
  page,
}) => {
  await openExample(page, "markdown", "tag-line");
  await expect(
    page.getByText("<untrusted-ExpoGBLIFfAjjZadRE8wCg>").first()
  ).toBeVisible();
  const list = page.getByRole("list");
  await expect(list.getByRole("listitem")).toHaveCount(3);
  await expect(list.getByRole("link", { name: "ISS-2306" })).toHaveAttribute(
    "href",
    "https://tracker.example.com/issue/ISS-2306/export-queue"
  );
  await expect(page.locator("untrusted-expogbliffajjzadre8wcg")).toHaveCount(0);
});

test("lists hold lists, and an item of two paragraphs keeps both", async ({
  page,
}) => {
  await openExample(page, "markdown", "lists");
  const steps = page.getByRole("list").first();
  await expect(steps.getByRole("listitem")).toHaveCount(5);
  const tell = steps.getByRole("listitem").filter({ hasText: "Tell the team" });
  await expect(tell.getByRole("list").getByRole("listitem")).toHaveText([
    "Support, by Friday",
    "Sales, on Monday",
  ]);
  await expect(page.getByText("Ask for a card at the gate.")).toBeVisible();
});

test("headings start at the caller's level", async ({ page }) => {
  await openExample(page, "markdown", "headings");
  await expect(
    page.getByRole("heading", { level: 2, name: "Expenses review" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 3, name: "Where the money went" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 4, name: "Travel" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 5, name: "Hotels" })
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(0);
});

test("untrusted text: raw HTML is text, and only http, https, mailto and paths here lead anywhere", async ({
  page,
}) => {
  await openExample(page, "markdown", "safe");
  await expect(
    page.getByText('<b onmouseover="alert(1)">', { exact: false })
  ).toBeVisible();
  await expect(page.locator("b")).toHaveCount(0);
  await expect(
    page.getByText(/script link.* data link are words, not links\.$/u)
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "script link" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "a page here" })).toHaveAttribute(
    "href",
    "/components/markdown"
  );
  await expect(
    page.getByRole("link", { name: "safe link (opens in a new tab)" })
  ).toHaveAttribute("href", "https://example.com/");
  const mail = page.getByRole("link", { name: "an email" });
  await expect(mail).toHaveAttribute("href", "mailto:team@example.com");
  await expect(mail).not.toHaveAttribute("target");
});

test("untrusted text: a script stays text, a data link is words, a picture never loads", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("pixel.gif")) {
      requests.push(request.url());
    }
  });
  await openExample(page, "markdown", "safe");
  await expect(page.getByText("<script>alert(1)</script>")).toBeVisible();
  await expect(
    page.getByText("A script link and a data link are words, not links.")
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "data link" })).toHaveCount(0);
  await expect(page.getByRole("img")).toHaveCount(0);
  await expect(page.getByText("a tracking pixel")).toBeVisible();
  expect(requests).toStrictEqual([]);
  // KaTeX draws the formula with `\href` refused: the command as its words, muted, and no link.
  const formula = page.locator("[data-slot=markdown-math]");
  await expect(formula.locator(".katex mtext")).toHaveText("\\href");
  await expect(formula.locator("a, [href]")).toHaveCount(0);
  // Mermaid draws the diagram at its strict level: no handler, no script, no link out of a node.
  const diagram = page.locator("[data-slot=markdown-diagram-drawing] svg");
  await expect(diagram).toHaveCount(1);
  await expect(
    diagram.locator(
      "[onclick], [onerror], script, a, b, [*|href^='javascript']"
    )
  ).toHaveCount(0);
});

test("diagrams: drawn by Mermaid once loaded, only for a diagram; Download as SVG, PNG or MMD, full screen and zoom; one Mermaid cannot read stays code", async ({
  page,
}) => {
  // Mermaid by what it holds, whatever its files are named: dagre, the layout it draws with.
  const scripts: string[] = [];
  // A body still on its way when the test ends is not read: the page is gone, and so is it.
  page.on("response", async (response) => {
    if (response.request().resourceType() === "script") {
      scripts.push(await response.text().catch(() => ""));
    }
  });
  const mermaidLoaded = () => scripts.some((text) => text.includes("dagre"));
  await openExample(page, "markdown", "answer");
  await expect(page.getByRole("table")).toBeVisible();
  expect(mermaidLoaded()).toBe(false);
  await openExample(page, "markdown", "diagram");
  const diagrams = page.locator("[data-slot=markdown-diagram]");
  const drawn = diagrams.nth(0);
  const unread = diagrams.nth(1);
  await expect(
    drawn.locator("[data-slot=markdown-diagram-drawing] svg")
  ).toHaveCount(1);
  await expect(drawn.getByText("Orders").first()).toBeVisible();
  await expect(unread.locator("svg[aria-roledescription]")).toHaveCount(0);
  await expect(unread.getByText("A --> -->")).toBeVisible();
  const save = async (format: string) => {
    await drawn.getByRole("button", { name: "Download diagram" }).click();
    const [file] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("menuitem", { name: format }).click(),
    ]);
    return file.suggestedFilename();
  };
  expect(await save("SVG")).toBe("diagram.svg");
  expect(await save("PNG")).toBe("diagram.png");
  expect(await save("MMD")).toBe("diagram.mmd");
  const drawing = drawn.locator("[data-slot=markdown-diagram-drawing]");
  const before = await drawing.evaluate(
    (node) => getComputedStyle(node).transform
  );
  await drawn.getByRole("button", { name: "Zoom in" }).click();
  await expect
    .poll(
      async () =>
        await drawing.evaluate((node) => getComputedStyle(node).transform)
    )
    .not.toBe(before);
  expect(mermaidLoaded()).toBe(true);
  // Named as a diagram, its code its description, moved by the arrow keys.
  const named = drawn.getByRole("application", { name: "Mermaid diagram" });
  await named.focus();
  const placed = await drawing.evaluate(
    (node) => getComputedStyle(node).transform
  );
  await page.keyboard.press("ArrowLeft");
  await expect
    .poll(
      async () =>
        await drawing.evaluate((node) => getComputedStyle(node).transform)
    )
    .not.toBe(placed);
  await drawn.getByRole("button", { name: "View full screen" }).click();
  await expect(
    page.getByRole("dialog").locator("svg[aria-roledescription]")
  ).toHaveCount(1);
});

test("diagrams: one with any way to an address in it is code, so nothing loads, in any diagram type; a drawn one holds no HTML and no handler", async ({
  page,
}) => {
  const elsewhere: string[] = [];
  page.on("request", (request) => {
    if (/example\.com|relative-/u.test(request.url())) {
      elsewhere.push(request.url());
    }
  });
  await openExample(page, "markdown", "diagram-hostile");
  const diagrams = page.locator("[data-slot=markdown-diagram]");
  await expect(diagrams).toHaveCount(17);
  // Each is weighed, and drawn, once it comes near the screen.
  for (const diagram of await diagrams.all()) {
    // oxlint-disable-next-line no-await-in-loop -- one after the other, down the answer
    await diagram.scrollIntoViewIfNeeded();
  }
  await expect(
    page.locator("[data-slot=markdown-diagram][aria-busy=true]")
  ).toHaveCount(0);
  // Sixteen are their code, words and all: an actor's icon among them, at a relative address.
  await expect(
    diagrams.filter({
      hasNot: page.locator("[data-slot=markdown-diagram-drawing]"),
    })
  ).toHaveCount(16);
  await expect(diagrams.getByText("relative-icon.png")).toBeVisible();
  await expect(diagrams.getByText("state.png")).toBeVisible();
  // The last is drawn, its HTML as words: no element of HTML's, no handler, no address.
  const drawings = page.locator("[data-slot=markdown-diagram-drawing] svg");
  await expect(drawings).toHaveCount(1);
  await expect(drawings).toContainText("bold");
  await expect(
    drawings.locator(
      "foreignObject, a, b, image, img, [onmouseover], [href^='http'], [*|href^='http']"
    )
  ).toHaveCount(0);
  // Long enough for a load to have started.
  await page.waitForTimeout(1000);
  expect(elsewhere).toStrictEqual([]);
});

test("diagrams: drawn with the source check off, in Mermaid's frame, not one fence loads anything", async ({
  page,
}) => {
  // Every request for these addresses that reaches the network; one a policy refuses never does.
  const loaded: string[] = [];
  await page.route(/example\.com|relative-icon/u, async (route) => {
    loaded.push(route.request().url());
    await route.fulfill({ status: 200, contentType: "image/png", body: "" });
  });
  await openExample(page, "markdown", "diagram-unchecked");
  // Mermaid drew them: only the policy stands between them and their addresses.
  await expect(page.locator("[data-drawn]")).toHaveAttribute(
    "data-drawn",
    "8",
    {
      timeout: 30_000,
    }
  );
  // Long enough for a load to have started.
  await page.waitForTimeout(1000);
  expect(loaded).toStrictEqual([]);
});

test("maths: a formula past 4,000 characters stays its TeX, and a huge rule stays inside the column", async ({
  page,
}) => {
  await openExample(page, "markdown", "math-limits");
  const formulas = page.locator("[data-slot=markdown-math]");
  await expect(formulas.locator("math")).toHaveCount(3);
  await expect(formulas.first().locator("math")).toHaveCount(0);
  await expect(formulas.first().locator("code")).toHaveCount(1);
  // The 1,200-row matrix in a sentence, thousands of pixels drawn, is cut at ten lines' height.
  const tall = await formulas.nth(1).evaluate((element) => ({
    box: element.getBoundingClientRect().height,
    em: Number(getComputedStyle(element).fontSize.replace("px", "")),
  }));
  expect(tall.box).toBeGreaterThan(tall.em * 5);
  expect(tall.box).toBeLessThanOrEqual(tall.em * 10 + 1);
  const width = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth,
    window: window.innerWidth,
  }));
  expect(width.page).toBeLessThanOrEqual(width.window);
});

test("maths: a formula in a sentence and on lines of its own, drawn as MathML by KaTeX, loaded only for maths, a dollar alone a dollar", async ({
  page,
}) => {
  // A page without maths loads none of KaTeX.
  const loaded: string[] = [];
  page.on("request", (request) => {
    if (/katex/iu.test(request.url())) {
      loaded.push(request.url());
    }
  });
  await openExample(page, "markdown", "answer");
  await expect(page.getByRole("table")).toBeVisible();
  expect(loaded).toStrictEqual([]);
  await openExample(page, "markdown", "math");
  const formulas = page.locator("[data-slot=markdown-math]");
  await expect(formulas).toHaveCount(5);
  await expect(formulas.locator("math")).toHaveCount(5);
  await expect(page.locator("math[display=block]")).toHaveCount(1);
  await expect(page.locator("math[display=block] annotation")).toHaveText(
    "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"
  );
  await expect(
    page.getByText("A price such as $5 stays a price.")
  ).toBeVisible();
});

test("tasks are said as done or not, and a rule separates", async ({
  page,
}) => {
  await openExample(page, "markdown", "tasks");
  await expect(page.getByRole("listitem")).toHaveText([
    "DoneGather the comments",
    "DoneCount the open requests",
    "Not doneAdd the survey results",
    "Not doneShare with the team",
  ]);
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  await expect(page.getByRole("separator")).toHaveCount(1);
});

test("a task's box takes the system's small corner in the squircle, its tick the icon's own size", async ({
  page,
}) => {
  await openExample(page, "markdown", "tasks");
  const done = page.getByRole("listitem").filter({ hasText: "Done" }).first();
  const box = await done.evaluate((item) => {
    const mark = item.querySelector("svg");
    const face = mark?.parentElement;
    if (mark === null || face === null || face === undefined) {
      return null;
    }
    const look = getComputedStyle(face);
    return {
      // Where the browser draws corner shapes, the system's squircle (computed as superellipse(2)).
      squircle:
        !CSS.supports("corner-shape", "squircle") ||
        look.getPropertyValue("corner-top-left-shape") === "superellipse(2)",
      // The system's small corner, 6px, or 4px where no corner-shape is drawn (tokens.css).
      radius:
        look.borderTopLeftRadius ===
        getComputedStyle(face).getPropertyValue("--damsko-radius-sm").trim(),
      tick: mark.getBoundingClientRect().width,
    };
  });
  expect(box).toEqual({ squircle: true, radius: true, tick: 16 });
});

test("footnotes: a mark leads to its note at the foot, and the note leads back", async ({
  page,
}) => {
  await openExample(page, "markdown", "footnotes");
  const marks = page.getByRole("link", { name: /^Footnote \d$/u });
  await expect(marks).toHaveText(["1", "2", "1"]);
  const notes = page.getByRole("list").last().getByRole("listitem");
  await expect(notes).toHaveText([
    "Year on year, in euros, before currency effects. ↩ ↩2",
    "Churn counts cancelled seats only, not downgrades. ↩",
  ]);
  await marks.nth(1).click();
  await expect(page).toHaveURL(/-fn-2$/u);
  await notes.nth(1).getByRole("link", { name: "Back to reference 2" }).click();
  // Back to the mark it came from: the second, numbered 2.
  expect(
    await page.evaluate(
      () =>
        document.querySelector(`#${CSS.escape(location.hash.slice(1))}`)
          ?.textContent
    )
  ).toBe("2");
});

test("while it is written: no pipes, no fence marks, no brackets, and the table arrives whole", async ({
  page,
}) => {
  await openExample(page, "markdown", "streaming");
  const seen = await watchStream(page, 9000);
  expect(seen.wrong).toStrictEqual([]);
  expect(seen.tables).toBeGreaterThan(0);
});

test("caught part way: an open fence is code being written, a half link its words, a half table a table with its half row", async ({
  page,
}) => {
  await openExample(page, "markdown", "half-written");
  const fence = page.getByRole("region", { name: "A fence not yet closed" });
  await expect(fence.getByText("def closed(requests):")).toBeVisible();
  await expect(fence.getByText("Writing")).toBeVisible();
  await expect(fence.getByText("```")).toHaveCount(0);
  // Saved and copied once the answer is written, as a chat's are.
  await expect(fence.getByRole("button", { name: "Download" })).toBeDisabled();
  await expect(fence.getByRole("button", { name: "Copy" })).toBeDisabled();
  const link = page.getByRole("region", {
    name: "A link still being written",
  });
  await expect(
    link.getByText("The numbers are in the weekly report")
  ).toBeVisible();
  await expect(link.getByRole("link")).toHaveCount(0);
  const table = page.getByRole("region", {
    name: "A table still being written",
  });
  await expect(table.getByRole("row", { name: "Support 58 4" })).toBeVisible();
  // Copied and saved once the answer is written, as a chat's tables are.
  await expect(
    table.getByRole("button", { name: "Copy table" })
  ).toBeDisabled();
  await expect(
    table.getByRole("button", { name: "Download table" })
  ).toBeDisabled();
  // Its half row is drawn as it is written, as Streamdown draws it.
  await expect(table.getByRole("row")).toHaveCount(3);
  await expect(table.getByText("|")).toHaveCount(0);
});

test("cut off: stopped part way and drawn from history, no raw mark and no link to nowhere", async ({
  page,
}) => {
  await openExample(page, "markdown", "cut");
  // Written, then stopped: busy while it is written, and not once it has stopped.
  await expect(page.locator("[aria-busy=true]")).toHaveCount(1);
  await expect(page.locator("[aria-busy=true]")).toHaveCount(0);
  await expect(
    page
      .getByRole("paragraph")
      .filter({ hasText: /while churn stays under 3%$/u })
  ).toHaveCount(2);
  await expect(page.getByText(/[[\]*]/u)).toHaveCount(0);
  await expect(page.getByRole("link")).toHaveCount(0);
});

test("single line breaks: off runs on, softBreaks breaks every one", async ({
  page,
}) => {
  await openExample(page, "markdown", "line-breaks");
  // The two ways in order: off, then softBreaks; each paragraph's line breaks.
  const breaks = async (start: RegExp) =>
    await Promise.all(
      [0, 1].map(
        async (way) =>
          await page.getByText(start).nth(way).locator("br").count()
      )
    );
  expect(await breaks(/^When: 14 and 15 August/u)).toStrictEqual([0, 3]);
  expect(await breaks(/^I checked three venues/u)).toStrictEqual([0, 2]);
  expect(await breaks(/^Next steps/u)).toStrictEqual([0, 3]);
});

test("a section folds: its summary names its button, Enter and a press open and close it", async ({
  page,
}) => {
  await openExample(page, "markdown", "sections");
  await expect(page.getByText("<details>")).toHaveCount(0);
  const toggle = page.getByRole("button", { name: "The policy's limits" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByText("Meals: €40 a day.")).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("Meals: €40 a day.")).toBeVisible();
  await toggle.press("Enter");
  await expect(page.getByText("Meals: €40 a day.")).toBeHidden();
});

test("sections: nested ones fold, and any other HTML or an unclosed one stays text", async ({
  page,
}) => {
  await openExample(page, "markdown", "sections-cases");
  const outer = page.getByRole("button", { name: "Outer" }).first();
  await outer.click();
  const inner = page.getByRole("button", { name: "Inner" }).first();
  await expect(inner).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByText("<div>Other HTML stays text.</div>")
  ).toBeVisible();
  await expect(page.getByText("<summary>Never closed</summary>")).toBeVisible();
  await expect(page.getByRole("button", { name: "Never closed" })).toHaveCount(
    0
  );
  await expect(page.getByRole("button", { name: "Arrives whole" })).toBeVisible(
    {
      timeout: 10_000,
    }
  );
});

test("a closed section's words are found by find in page, which opens it", async ({
  page,
}) => {
  await openExample(page, "markdown", "sections");
  const toggle = page.getByRole("button", { name: "The policy's limits" });
  const words = page.getByText("Meals: €40 a day.");
  await expect(words).toBeHidden();
  expect(
    await words.evaluate((node) =>
      node.closest("[hidden]")?.getAttribute("hidden")
    )
  ).toBe("until-found");
  // What the browser's find does when it lands on hidden words.
  await words.evaluate((node) => {
    node
      .closest("[hidden]")
      ?.dispatchEvent(new Event("beforematch", { bubbles: true }));
  });
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(words).toBeVisible();
});

test("a section written open stands open from the first paint, without opening", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  // Every height the open section's words are seen at, from the first frame they are drawn in.
  await page.addInitScript(() => {
    const seen = new Set<number>();
    let frames = 0;
    const watch = () => {
      for (const node of document.querySelectorAll("p")) {
        if (node.textContent.includes("The claim's approver decides")) {
          const panel = node.parentElement?.parentElement;
          if (panel) {
            seen.add(Math.round(panel.getBoundingClientRect().height));
            frames += 1;
            document.documentElement.dataset.seenHeights = [...seen].join(" ");
            document.documentElement.dataset.seenFrames = String(frames);
          }
        }
      }
      requestAnimationFrame(watch);
    };
    requestAnimationFrame(watch);
  });
  await openExample(page, "markdown", "sections");
  const toggle = page.getByRole("button", { name: "Who decides" });
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByText("The claim's approver decides, never the agent.")
  ).toBeVisible();
  // Past the time an opening takes: thirty frames of it drawn.
  await expect
    .poll(async () =>
      Number(await page.locator("html").getAttribute("data-seen-frames"))
    )
    .toBeGreaterThan(30);
  // One height, never a climb from nothing.
  await expect(page.locator("html")).toHaveAttribute(
    "data-seen-heights",
    /^[1-9]\d*$/u
  );
});

test("the host draws links: out asks first, a path goes through its router, a citation is its chip, a script link is words", async ({
  page,
}) => {
  await openExample(page, "markdown", "host-links");
  await expect(page.getByRole("button", { name: "Source 1" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Source 2" })).toBeVisible();
  const router = page.getByRole("link", { name: "the contracts page" });
  await expect(router).toHaveAttribute("href", "#/contracts/q4");
  await expect(router).toHaveAttribute("data-router-link", "");
  await expect(page.getByRole("link", { name: "like this one" })).toHaveCount(
    0
  );
  await expect(page.getByRole("link", { name: /on their site/u })).toHaveCount(
    0
  );
  await page.getByRole("button", { name: "on their site" }).click();
  const dialog = page.getByRole("dialog", { name: "Open external link?" });
  await expect(
    dialog.getByText("https://tailspin.example.com/notices/2026-rates")
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
});

/**
 * Watches the streaming example for `ms`, a frame at a time: every row, cell and code block once
 * shown keeps its place until the answer starts again, and every word added fades in or, with
 * reduced motion, is there at once. Gives back what moved and how the words came.
 */
const watchFrames = async (page: Page, ms: number) =>
  await page.evaluate(
    async (time) =>
      // oxlint-disable-next-line promise/avoid-new -- frames until the time is up, which have no promise of their own
      await new Promise<{ moved: string[]; faded: number; popped: number }>(
        (resolve) => {
          const placed = new WeakMap<Element, string>();
          const moved: string[] = [];
          const counts = { faded: 0, popped: 0 };
          const root = document.querySelector("[data-slot=markdown]");
          let length = 0;
          new MutationObserver((changes) => {
            for (const added of changes.flatMap((change) => [
              ...change.addedNodes,
            ])) {
              const spans =
                added instanceof Element
                  ? [added, ...added.querySelectorAll("span")]
                  : [];
              // A word: a span of words alone in a block's text, not one hidden for a screen reader.
              for (const span of spans) {
                const word =
                  span instanceof HTMLSpanElement &&
                  span.closest("p, li, td, th") !== null &&
                  span.children.length === 0 &&
                  span.textContent.trim() !== "" &&
                  getComputedStyle(span).position !== "absolute";
                if (word) {
                  counts[
                    span.getAnimations().length > 0 ? "faded" : "popped"
                  ] += 1;
                }
              }
            }
          }).observe(root ?? document.body, { childList: true, subtree: true });
          const frame = () => {
            const now = root?.textContent?.length ?? 0;
            const restarted = now < length;
            length = now;
            for (const part of root?.querySelectorAll(
              "tr, th, td, [data-slot=code-block]"
            ) ?? []) {
              const box = part.getBoundingClientRect();
              const at = `${Math.round(box.top)},${Math.round(box.left)},${Math.round(box.width)}`;
              const was = placed.get(part);
              if (was !== undefined && was !== at && !restarted) {
                moved.push(`${part.localName}: ${was} to ${at}`);
              }
              placed.set(part, at);
            }
            if (performance.now() < time) {
              requestAnimationFrame(frame);
            } else {
              resolve({ moved, ...counts });
            }
          };
          requestAnimationFrame(frame);
        }
      ),
    await page.evaluate((wait) => performance.now() + wait, ms)
  );

test("while it is written, a table and a code block keep their place and each new word fades in", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openExample(page, "markdown", "streaming");
  const seen = await watchFrames(page, 9000);
  expect(seen.moved).toStrictEqual([]);
  // One pass of the example draws 32 words outside its link; 9 s holds at least one in any engine.
  expect(seen.faded).toBeGreaterThan(30);
  expect(seen.popped).toBe(0);
});

test("with reduced motion, each new word is there at once", async ({
  page,
}) => {
  await openExample(page, "markdown", "streaming");
  const seen = await watchFrames(page, 9000);
  expect(seen.popped).toBeGreaterThan(30);
  expect(seen.faded).toBe(0);
});

test("your own elements: a link names its site, fenced code is the product's CodeBlock, a script link never reaches them", async ({
  page,
}) => {
  await openExample(page, "markdown", "components");
  await expect(
    page.getByRole("link", {
      name: /^the reporting service \(reports\.example\.com\)/u,
    })
  ).toHaveAttribute("href", "https://reports.example.com/docs");
  const code = page.getByRole("region", { name: /report\.ts/u });
  await expect(code).toContainText(
    'export const totals = await report.daily({ team: "support" });'
  );
  await expect(page.getByText("daily_totals")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /link the model was tricked into/u })
  ).toHaveCount(0);
  await expect(page.getByText("link the model was tricked into")).toBeVisible();
});

test("a fence with codeMaxLines={false} never folds, yet draws only its first 2,000 lines and says how many more", async ({
  page,
}) => {
  await openExample(page, "markdown", "long-code");
  // Line 1,999 is the thousandth entry, line 2,001 the next.
  await expect(page.getByText("entry 1000", { exact: true })).toBeAttached();
  await expect(page.getByText("entry 1001", { exact: true })).toHaveCount(0);
  await expect(page.getByText("999 more lines")).toBeVisible();
  await expect(page.getByRole("button", { name: "Show more" })).toHaveCount(0);
});

/**
 * Watches the stream-cases example for `ms`, a frame at a time, and gives back what it should never
 * draw: a link's words, once shown in full, fading again; a heading; a raw mark at the end of the
 * words; a closing fence still being typed as a line of code.
 */
// The words the frame-by-frame check follows in markdown/stream-cases.
const PHRASES = [
  "full",
  "www.example",
  "gradually",
  "eventually",
  "wordy",
  "handbook",
];
const watchCases = async (page: Page, ms: number) =>
  await page.evaluate(
    async ({ time, phrases }) =>
      // oxlint-disable-next-line promise/avoid-new -- frames until the time is up, which have no promise of their own
      await new Promise<string[]>((resolve) => {
        const root = document.querySelector("[data-slot=markdown]");
        const wrong = new Set<string>();
        const shown = new Set<string>();
        let length = 0;
        /** How visible a text is: its element's opacity times each of its ancestors'. */
        const opacityOf = (node: Node) => {
          let seen = 1;
          for (
            let element = node.parentElement;
            element !== null && element !== root;
            element = element.parentElement
          ) {
            seen *= Number(getComputedStyle(element).opacity);
          }
          return seen;
        };
        /** One text: words fading again once shown, or a fence still being typed as code. */
        const look = (text: Node, inCode: boolean) => {
          for (const phrase of phrases) {
            if (text.textContent?.includes(phrase) === true) {
              if (opacityOf(text) > 0.99) {
                shown.add(phrase);
              } else if (shown.has(phrase)) {
                wrong.add(`${phrase} faded again`);
              }
            }
          }
          if (inCode && /^[`~]+$/u.test(text.textContent?.trim() ?? "")) {
            wrong.add(`a fence as code: ${text.textContent ?? ""}`);
          }
        };
        const frame = () => {
          // The answer starts again (a mark becoming a note's number shortens it a little).
          const now = root?.textContent?.length ?? 0;
          if (now < length / 2) {
            shown.clear();
          }
          length = now;
          const walker = document.createTreeWalker(
            root ?? document.body,
            NodeFilter.SHOW_TEXT
          );
          let words = "";
          for (let text = walker.nextNode(); text; text = walker.nextNode()) {
            const inCode = text.parentElement?.closest("code") !== null;
            words += inCode ? " " : (text.textContent ?? "");
            look(text, inCode);
          }
          for (const phrase of shown) {
            if (root?.textContent?.includes(phrase) !== true) {
              wrong.add(`${phrase} went`);
            }
          }
          const heading = root?.querySelector("h1, h2, h3, h4, h5, h6");
          if (heading) {
            wrong.add(`a heading: ${heading.textContent}`);
          }
          if (/[*_~`]\s*$/u.test(words)) {
            wrong.add(`a raw mark: ${words.slice(-30)}`);
          }
          if (performance.now() < time) {
            requestAnimationFrame(frame);
          } else {
            resolve([...wrong]);
          }
        };
        requestAnimationFrame(frame);
      }),
    {
      time: await page.evaluate((wait) => performance.now() + wait, ms),
      phrases: PHRASES,
    }
  );

test("while it is written, words never fade again or go as a link, a note or a reference resolves, no line is a heading for a moment, and no raw mark shows", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openExample(page, "markdown", "stream-cases");
  expect(await watchCases(page, 12_000)).toStrictEqual([]);
});

test("streaming a table of 300 rows and a paragraph of 2,000 words starts a fade per word at most, and never an empty one", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    let started = 0;
    let empty = 0;
    document.addEventListener(
      "animationstart",
      (event) => {
        started += 1;
        if (
          event.target instanceof Element &&
          event.target.textContent === ""
        ) {
          empty += 1;
        }
        document.documentElement.dataset.fades = `${started} ${empty}`;
      },
      true
    );
  });
  await openExample(page, "markdown", "stream-long");
  await expect(page.locator("[data-done]")).toBeAttached({ timeout: 30_000 });
  const fades = await page.locator("html").getAttribute("data-fades");
  const [started = 0, empty = 0] = (fades ?? "").split(" ").map(Number);
  // Over 3,000 words: a fade for each of the first 1,000 of a block, then one for each read.
  expect(empty).toBe(0);
  expect(started).toBeLessThan(2500);
});
