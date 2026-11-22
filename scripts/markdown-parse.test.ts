// Markdown's pure half (src/components/markdown/parse.ts): the scheme a host sees; the repair of an answer still being written (a fence, a link, a table, marks
// left open), and the tidy of one cut off; reading a long answer a block at a time; and the one HTML
// form read as a section.
//
//   pnpm exec vp test scripts/markdown-parse.test.ts
import { describe, expect, test } from "vitest";

import {
  groupSections,
  NOTHING,
  openFence,
  parseMarkdown,
  readBlocks,
  repair,
  schemeOf,
  sectionSaid,
  tidy,
} from "../src/components/markdown/parse.ts";

describe(parseMarkdown, () => {
  test("GitHub's additions are read: a table, a task, a strike, a bare address, a note", () => {
    const tree = parseMarkdown(
      "| a |\n| - |\n| 1 |\n\n- [x] done\n\n~~gone~~ www.example.com and a note[^1]\n\n[^1]: A note."
    );
    expect(tree.children.map((node) => node.type)).toStrictEqual([
      "table",
      "list",
      "paragraph",
      "footnoteDefinition",
    ]);
    const [, list, paragraph] = tree.children;
    expect(list?.type === "list" && list.children[0]?.checked).toBeTruthy();
    expect(
      paragraph?.type === "paragraph" &&
        paragraph.children.map((node) => node.type)
    ).toStrictEqual(["delete", "text", "link", "text", "footnoteReference"]);
  });

  test("raw HTML stays a text node, never an element", () => {
    const [block, line] = parseMarkdown(
      '<script>alert(1)</script>\n\nWords <b onmouseover="x">bold</b>.'
    ).children;
    expect(block).toMatchObject({
      type: "html",
      value: "<script>alert(1)</script>",
    });
    expect(
      line?.type === "paragraph" && line.children.map((node) => node.type)
    ).toStrictEqual(["text", "html", "text", "html", "text"]);
  });
});

describe(schemeOf, () => {
  test("the scheme as a browser reads it, in lower case", () => {
    expect(schemeOf("JaVa\tScript:alert(1)")).toBe("javascript");
    expect(schemeOf("  \u0001DATA:text/html,x")).toBe("data");
    expect(schemeOf("cite:2")).toBe("cite");
    expect(schemeOf("/relative")).toBe("");
    expect(schemeOf("#here")).toBe("");
  });
});

describe(repair, () => {
  test("an open fence is code still coming, a half-typed closing waits", () => {
    expect(openFence("```ts\nconst a = 1")).toBeTruthy();
    expect(openFence("```ts\nconst a = 1\n```")).toBeFalsy();
    expect(repair("```ts\nconst a = [1").text).toBe("```ts\nconst a = [1");
    expect(repair("```ts\nconst a = 1\n``").text).toBe("```ts\nconst a = 1\n");
  });

  test("a fence's first line waits for its code, so its marks never show", () => {
    expect(repair("Run it:\n\n```pyth").text).toBe("Run it:\n\n");
  });

  test("a link whose address has begun is closed while written", () => {
    expect(repair("See [the guide](https://exa").text).toBe(
      "See [the guide](https://exa)"
    );
    expect(repair("See [the guide](").text).toBe("See [the guide]()");
  });

  test("a bracket with no address after it is words, not a link being written", () => {
    for (const words of [
      "The range [0, 1) is half-open, so 1 is excluded.",
      "The range [0, 1) is half-open, so 1",
      "Call `f(a[` then",
    ]) {
      expect(repair(words).text).toBe(words);
    }
  });

  test("a short bracket at the very end waits, as it may yet open a link", () => {
    expect(repair("See [the gui").text).toBe("See");
    expect(repair("see [1]").text).toBe("see");
    expect(repair("**under 3% [2").text).toBe("**under 3%**");
  });

  test("a task's box is not a link", () => {
    expect(repair("- [ ").text).toBe("- [ ");
    expect(repair("- [x]").text).toBe("- [x]");
  });

  test("a table is a table from its head, and a row waits for its line", () => {
    expect(repair("| Team | Open |\n").text).toBe(
      "| Team | Open |\n| --- | --- |\n"
    );
    expect(repair("| Team | Open |\n| --- | --- |\n| Sup").text).toBe(
      "| Team | Open |\n| --- | --- |\n"
    );
    // A body row that ends with its last pipe is whole before its line ends.
    expect(repair("| Team | Open |\n| --- | --- |\n| Sales | 2 |").text).toBe(
      "| Team | Open |\n| --- | --- |\n| Sales | 2 |"
    );
    expect(
      parseMarkdown(repair("| Team | Open |\n").text).children[0]?.type
    ).toBe("table");
  });

  test("bold, emphasis and code left open are closed while written", () => {
    expect(repair("**Yes, raise").text).toBe("**Yes, raise**");
    expect(repair("an *aside").text).toBe("an *aside*");
    expect(repair("run `share").text).toBe("run `share`");
    // A mark at the very end may become two: it waits.
    expect(repair("Yes *").text).toBe("Yes ");
  });

  test("a last line that is only a mark waits for its words", () => {
    expect(repair("Done.\n\n#").text).toBe("Done.\n\n");
    expect(repair("Done.\n\n- ").text).toBe("Done.\n\n");
  });

  test("the source up to `kept` is the source's own", () => {
    const source = "Words **bold";
    const { text, kept } = repair(source);
    expect(text.slice(0, kept)).toBe(source.slice(0, kept));
  });
});

describe(tidy, () => {
  test("a link still being written goes, its words with it", () => {
    expect(tidy("Your own rule allows a rise [2")).toBe(
      "Your own rule allows a rise"
    );
    expect(tidy("Your own rule allows a rise [2](cite:")).toBe(
      "Your own rule allows a rise"
    );
    expect(tidy("See [the report](https://ex")).toBe("See");
    expect(tidy("An image ![alt](htt")).toBe("An image");
    expect(tidy("Para one.\n\n- item one\n- item [two")).toBe(
      "Para one.\n\n- item one\n- item"
    );
  });

  test("a bracket with no address after it is words, and stays", () => {
    for (const words of [
      "The range [0, 1) is half-open, so 1 is excluded.",
      "Call `f(a[` then stop.",
      "Pick one of [this or that",
    ]) {
      expect(tidy(words)).toBe(words);
    }
  });

  test("bold, emphasis and code left open are closed", () => {
    expect(tidy("**Yes, raise it")).toBe("**Yes, raise it**");
    expect(tidy("**Yes**, and `cod")).toBe("**Yes**, and `cod`");
    expect(tidy("**bold and [link")).toBe("**bold and**");
  });

  test("an answer that ended whole is untouched", () => {
    for (const whole of [
      "A whole answer with [a link](https://example.com).",
      "Ends **bold**",
      "Ends `code`",
      "Rule below\n\n***",
      "Plain words.",
      "- [ ] a task",
      "```ts\nconst a = [1",
    ]) {
      expect(tidy(whole)).toBe(whole);
    }
  });
});

describe("a link whose title is still coming", () => {
  test("while written, it is closed: its title's mark, then the bracket", () => {
    expect(repair('see [1](cite:1 "Churn in the').text).toBe(
      'see [1](cite:1 "Churn in the")'
    );
    expect(repair("see [1](cite:1 'Churn").text).toBe(
      "see [1](cite:1 'Churn')"
    );
    expect(repair("see [1](cite:1 ").text).toBe("see [1](cite:1)");
  });

  test("cut off there, it goes", () => {
    expect(tidy('see [1](cite:1 "Churn in the')).toBe("see");
  });

  test("whole, it stays", () => {
    expect(repair('see [1](cite:1 "whole")').text).toBe(
      'see [1](cite:1 "whole")'
    );
    expect(tidy('see [1](cite:1 "whole")')).toBe('see [1](cite:1 "whole")');
  });

  test("its title closed, the bracket still coming, it is closed", () => {
    expect(repair('see [text](https://example.com "A title"').text).toBe(
      'see [text](https://example.com "A title")'
    );
    expect(tidy('see [text](https://example.com "A title"')).toBe("see");
  });
});

// A script link's scheme, written so no lint takes the test's own strings for one.
const JS = ["java", "script"].join("");

describe("a link's address is its own, never marks", () => {
  test("an underscore in it opens no emphasis, whole or still being written", () => {
    expect(repair("See [the spec](https://example.com/a_b").text).toBe(
      "See [the spec](https://example.com/a_b)"
    );
    expect(repair("See [the spec](https://example.com/_b").text).toBe(
      "See [the spec](https://example.com/_b)"
    );
    expect(repair("See [the spec](https://example.com/_b) and more").text).toBe(
      "See [the spec](https://example.com/_b) and more"
    );
  });

  test("a parenthesis in it is closed before the link is", () => {
    expect(
      repair("See [Foo](https://en.wikipedia.org/wiki/Foo_(bar").text
    ).toBe("See [Foo](https://en.wikipedia.org/wiki/Foo_(bar))");
    expect(
      repair("See [Foo](https://en.wikipedia.org/wiki/Foo_(bar)").text
    ).toBe("See [Foo](https://en.wikipedia.org/wiki/Foo_(bar))");
    expect(tidy("See [Foo](https://en.wikipedia.org/wiki/Foo_(bar")).toBe(
      "See"
    );
  });

  test("a script link being written is closed, so it is its words", () => {
    expect(repair(`[x](${JS}:alert(1`).text).toBe(`[x](${JS}:alert(1))`);
  });
});

/** How long `work` takes, in milliseconds: the better of two runs, so the first's warm-up is not counted. */
const timeOf = (work: () => unknown) =>
  Math.min(
    ...[1, 2].map(() => {
      const start = performance.now();
      work();
      return performance.now() - start;
    })
  );

describe("the end of a long answer, read on every word that arrives", () => {
  // Each took half a second or more at 40 KB, for every few words, while its patterns weighed every
  // way to split the run; now it takes time in step with the length.
  test.each([
    ["a run of stars", (n: number) => `${"*".repeat(n)}a`],
    [
      "lines of a space, then a bracket",
      (n: number) => `${"\n ".repeat(n / 2)}x[`,
    ],
    [
      "a row of dashes and spaces",
      (n: number) => `| a |\n|-${" ".repeat(n)}x\n`,
    ],
    [
      "brackets and parentheses that open no link",
      (n: number) => `[a](b "${"](".repeat(n / 2)}" c`,
    ],
  ])("%s", (_, make) => {
    for (const read of [repair, tidy]) {
      const quarter = timeOf(() => read(make(10_000)));
      const whole = timeOf(() => read(make(40_000)));
      expect(whole / Math.max(quarter, 1)).toBeLessThan(8);
    }
  });
});

describe(readBlocks, () => {
  test("the finished blocks are kept, and only the last is read again", () => {
    const first = readBlocks("One.\n\nTwo", NOTHING);
    expect(first.blocks.map(({ node }) => node.type)).toStrictEqual([
      "paragraph",
      "paragraph",
    ]);
    expect(first.kept.text).toBe("One.\n\n");
    const next = readBlocks("One.\n\nTwo and more.", first.kept);
    expect(next.blocks[0]).toBe(first.blocks[0]);
    expect(next.blocks[1]?.base).toBe("One.\n\n".length);
    expect(next.kept).toBe(first.kept);
  });

  test("other words than those kept start again", () => {
    const { kept } = readBlocks("One.\n\nTwo", NOTHING);
    expect(readBlocks("Else.", kept).kept).toBe(NOTHING);
  });
});

const blocksOf = (source: string) =>
  parseMarkdown(source).children.map((node) => ({ node, base: 0 }));

describe(groupSections, () => {
  test("a <details> with a <summary> line is a section holding its blocks", () => {
    const [section] = groupSections(
      blocksOf(
        "<details>\n<summary>The **limits**</summary>\n\n- Meals\n\n</details>"
      )
    );
    expect(section?.type).toBe("section");
    expect(section?.type === "section" && section.summaryText).toBe(
      "The **limits**"
    );
    expect(section?.type === "section" && section.open).toBeFalsy();
    expect(
      section?.type === "section" && section.children.map((child) => child.type)
    ).toStrictEqual(["block"]);
  });

  test("`open` stands open, and sections hold sections", () => {
    const [outer] = groupSections(
      blocksOf(
        "<details open>\n<summary>Outer</summary>\n\n<details>\n<summary>Inner</summary>\n\nWords.\n\n</details>\n\n</details>"
      )
    );
    expect(outer?.type === "section" && outer.open).toBeTruthy();
    expect(outer?.type === "section" && outer.children[0]?.type).toBe(
      "section"
    );
  });

  test("an unclosed one and any other HTML stay text", () => {
    expect(
      groupSections(
        blocksOf("<details>\n<summary>Never closed</summary>\n\nStill text.")
      ).map((each) => each.type)
    ).toStrictEqual(["block", "block"]);
    expect(
      groupSections(blocksOf("<div>Other HTML.</div>")).map((each) => each.type)
    ).toStrictEqual(["block"]);
  });

  test("a section's opening says its summary, its closing nothing, other HTML its text", () => {
    expect(sectionSaid("<details>\n<summary>Limits</summary>")).toBe("Limits");
    expect(sectionSaid("</details>")).toBe("");
    expect(sectionSaid("<div>x</div>")).toBe("<div>x</div>");
  });
});
