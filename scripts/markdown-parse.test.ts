// Markdown's pure half (src/components/markdown/parse.ts): the scheme a host sees; the repair of an answer still being written (a fence, a link, a table, marks
// left open), and the tidy of one cut off; reading a long answer a block at a time; and the one HTML
// form read as a section.
//
//   pnpm exec vp test scripts/markdown-parse.test.ts
import { describe, expect, test } from "vitest";

import {
  bounded,
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
/**
 * How long a test that weighs its own time may run, in milliseconds: on a busy machine it takes many
 * times as long as on a quiet one, and what it holds is growth, not time.
 */
const SLOW_TEST = 60_000;

/** This process's own time on the processor so far, in milliseconds. */
const now = () => {
  const { user, system } = process.cpuUsage();
  return (user + system) / 1000;
};

/**
 * How many times longer `whole` takes than `small`, and how long it takes, in milliseconds of this
 * process's own time on the processor, which does not grow while a busy machine runs others: each
 * run once to warm up, then the best of seven runs of each, taken in turn.
 */
const growthOf = (small: () => unknown, whole: () => unknown) => {
  small();
  whole();
  let fast = Number.POSITIVE_INFINITY;
  let slow = Number.POSITIVE_INFINITY;
  for (let run = 0; run < 7; run += 1) {
    const start = now();
    small();
    const middle = now();
    whole();
    fast = Math.min(fast, middle - start);
    slow = Math.min(slow, now() - middle);
  }
  return { growth: slow / Math.max(fast, 1), time: slow };
};

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
  ])(
    "%s",
    (_, make) => {
      for (const read of [repair, tidy]) {
        const quarter = make(10_000);
        const whole = make(40_000);
        expect(
          growthOf(
            () => read(quarter),
            () => read(whole)
          ).growth
        ).toBeLessThan(8);
      }
    },
    SLOW_TEST
  );
});

/** `unit` again and again, to `length` characters at least. */
const filled = (unit: string) => (length: number) =>
  unit.repeat(Math.ceil(length / unit.length));

/** `paragraph` again and again in paragraphs of their own, to `length` characters at least. */
const paragraphs = (paragraph: string) => filled(`${paragraph}\n\n`);

/** A node of a tree, as far as these tests read it. */
interface Tree {
  type: string;
  value?: unknown;
  children?: Tree[];
}

/** A node's words: its value, or its children's, run together. */
const wordsOf = (node: Tree): string =>
  typeof node.value === "string"
    ? node.value
    : (node.children ?? []).map(wordsOf).join("");

/** The types of a tree's nodes, three levels down. */
const shapeOf = (node: Tree, depth = 0): string =>
  depth === 3 || node.children === undefined
    ? node.type
    : `${node.type}(${node.children
        .map((child) => shapeOf(child, depth + 1))
        .join(",")})`;

/** The tree of an answer as Markdown draws it: within the bounds, then parsed. */
const boundedTree = (source: string) => parseMarkdown(bounded(source));

const noSpace = (text: string) => text.replaceAll(/\s/gu, "");

/** A sentence a real answer may hold: a link, bold and code. */
const sentenceOf = (n: number) =>
  `See [the report ${n}](https://example.com/${n}), which says **point ${n}** holds, as \`run ${n}\` shows. `;

describe("a paragraph longer than any answer's", () => {
  // The parser's work on one paragraph grows as its square when it is full of escapes, code, tags,
  // references or marks: a paragraph of 100 KB took seconds, of 500 KB a minute. A paragraph
  // past the bound is not read for marks, so each takes time in step with its length. Eight times
  // the text: in step is 8, the square is 64; 24 is near their midpoint as a factor (three times
  // the one, a third of the other), room for a busy machine, and the budget for a slow one.
  test.each([
    [
      "brackets",
      (n: number) => `${"[".repeat(n / 5)}a${"](b)".repeat(n / 5)}`,
      200_000,
    ],
    ["stars", filled("*a"), 200_000],
    ["stray ends", filled("]("), 200_000],
    ["closing stars", filled("a* "), 200_000],
    [
      "a bracket left open before words",
      (n: number) => `[${filled("word ")(n)}`,
      200_000,
    ],
    ["pictures left open", filled("![a"), 200_000],
    ["references left open", filled("[x]["), 200_000],
    ["comments left open", filled("a <!-- "), 200_000],
    ["instructions left open", filled("a <? "), 200_000],
    ["declarations left open", filled("a <!x "), 200_000],
    ["escapes", filled("a \\* "), 200_000],
    ["code", filled("a `b` "), 200_000],
    ["comments closed", filled("a <!-- x --> "), 200_000],
    ["references to characters", filled("a &amp; "), 200_000],
    [
      "stars, in paragraphs just short of the bound",
      paragraphs("*a".repeat(995)),
      64_000,
    ],
    [
      "closing stars, in paragraphs just short of the bound",
      paragraphs("a* ".repeat(663)),
      64_000,
    ],
    [
      "comments left open, in paragraphs just short of the bound",
      paragraphs("a <!-- ".repeat(284)),
      64_000,
    ],
  ])(
    "%s takes time in step with its length",
    (_, make, size) => {
      const eighth = make(size / 8);
      const whole = make(size);
      const { growth, time } = growthOf(
        () => boundedTree(eighth),
        () => boundedTree(whole)
      );
      expect(growth).toBeLessThan(24);
      expect(time).toBeLessThan(2000);
    },
    SLOW_TEST
  );

  test("a long one is its own characters, in its place in a list, a quote, a table, a heading and a note", () => {
    const long = `words *not* \\* \`code\` [x](y) &amp; <!-- ${"word ".repeat(1700)}end`;
    const cases = [
      [
        `- one\n- ${long}\n- three`,
        "list(listItem(paragraph(text)),listItem(paragraph(text)),listItem(paragraph(text)))",
      ],
      [`> ${long}\n> ${long}\n\nafter`, "root"],
      [`| a | b |\n| - | - |\n| ${long} | x |\n| c | d |`, "root"],
      [`# ${long}`, "heading(text)"],
      [`x[^1]\n\n[^1]: ${long}`, "root"],
    ] as const;
    expect(
      shapeOf(parseMarkdown(cases[0][0]).children[0] ?? { type: "none" })
    ).toBe(cases[0][1]);
    expect(
      parseMarkdown(cases[1][0]).children.map((node) => shapeOf(node))
    ).toStrictEqual(["blockquote(paragraph(text))", "paragraph(text)"]);
    expect(
      shapeOf(parseMarkdown(cases[2][0]).children[0] ?? { type: "none" })
    ).toBe(
      "table(tableRow(tableCell(text),tableCell(text)),tableRow(tableCell(text),tableCell(text)),tableRow(tableCell(text),tableCell(text)))"
    );
    expect(
      shapeOf(parseMarkdown(cases[3][0]).children[0] ?? { type: "none" })
    ).toBe(cases[3][1]);
    expect(
      parseMarkdown(cases[4][0]).children.map((node) => shapeOf(node))
    ).toStrictEqual([
      "paragraph(text,footnoteReference)",
      "footnoteDefinition(paragraph(text))",
    ]);
    for (const [source] of cases) {
      expect(wordsOf(parseMarkdown(source))).toContain(long);
    }
  });

  test("a short one beside it is still read for its marks", () => {
    const tree = parseMarkdown(
      `Some **bold** and \`code\`.\n\n${"word ".repeat(1700)}`
    );
    expect(shapeOf(tree.children[0] ?? { type: "none" })).toBe(
      "paragraph(text,strong(text),text,inlineCode,text)"
    );
  });

  test("a paragraph of 5,000 characters with links, bold and code keeps every mark", () => {
    const paragraph = Array.from({ length: 55 }, (_, n) => sentenceOf(n)).join(
      ""
    );
    expect(paragraph.length).toBeGreaterThan(5000);
    const [node] = parseMarkdown(paragraph).children;
    const kinds = (node?.type === "paragraph" ? node.children : []).map(
      ({ type }) => type
    );
    expect(kinds.filter((type) => type === "link")).toHaveLength(55);
    expect(kinds.filter((type) => type === "strong")).toHaveLength(55);
    expect(kinds.filter((type) => type === "inlineCode")).toHaveLength(55);
  });

  // Each paragraph just under the bound costs its most; a long answer of them is read for marks
  // only so far, and plain text after.
  test(
    "400 KB of the costliest paragraphs just under the bound is read within the budget",
    () => {
      const paragraph = "a* ".repeat(2667).slice(0, 7999);
      const source = filled(`${paragraph}\n\n`)(400_000);
      boundedTree(source);
      const time = Math.min(
        ...[1, 2].map(() => {
          const start = now();
          boundedTree(source);
          return now() - start;
        })
      );
      expect(time).toBeLessThan(3000);
    },
    SLOW_TEST
  );

  // Text made at random in every place a paragraph can stand, each past the bound: whatever its
  // characters (marks, escapes, tags, tabs, two-unit characters, the character that stands in for
  // them while the blocks are read), it is drawn in its place, every character, in order.
  test("a long one loses no character, wherever it stands and whatever it holds", () => {
    // Park and Miller's: the same text on every run.
    let seed = 7;
    const random = (below: number) => {
      seed = (seed * 16_807) % 2_147_483_647;
      return Math.floor((seed / 2_147_483_647) * below);
    };
    const pieces = [
      "word",
      "*",
      "**",
      "_",
      "~~",
      "`",
      "[",
      "](",
      "\\",
      "&amp;",
      "<!--",
      "-->",
      "<?",
      "<b>",
      "\u00A7",
      "\t",
      "\u{1F600}",
      "www.example.com",
      "  ",
      "|",
    ];
    const contentOf = (cell: boolean) => {
      const lines: string[] = [];
      let line = "word";
      while (lines.join("").length + line.length < 8200) {
        const piece = pieces[random(pieces.length)] ?? "";
        line += ` ${cell && (piece === "|" || piece === "\\") ? "x" : piece}`;
        if (!cell && random(12) === 0) {
          lines.push(line);
          line = "word";
        }
      }
      lines.push(line);
      return lines;
    };
    const places = [
      { first: "", next: "", shape: "paragraph" },
      { first: "> ", next: "> ", shape: "blockquote(paragraph" },
      { first: "- ", next: "  ", shape: "list(listItem(paragraph" },
      { first: "1. ", next: "   ", shape: "list(listItem(paragraph" },
      { first: "[^n]: ", next: "    ", shape: "footnoteDefinition(paragraph" },
    ];
    for (let round = 0; round < 60; round += 1) {
      const place = places[round % places.length] ?? places[0];
      const lines = contentOf(false);
      const ending = round % 2 === 0 ? "\n" : "\r\n";
      const source = lines
        .map((line, index) => (index === 0 ? place?.first : place?.next) + line)
        .join(ending);
      const [node] = parseMarkdown(source).children;
      expect(shapeOf(node ?? { type: "none" })).toMatch(
        new RegExp(
          `^${(place?.shape ?? "").replaceAll("(", "\\(")}\\((text|break)(,(text|break))*\\)`,
          "u"
        )
      );
      expect(noSpace(wordsOf(node ?? { type: "none" }))).toBe(
        noSpace(lines.join(""))
      );
      const cell = contentOf(true).join(" ");
      const table = parseMarkdown(`| a |\n| - |\n| ${cell} |`);
      expect(noSpace(wordsOf(table))).toBe(noSpace(`a${cell}`));
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
