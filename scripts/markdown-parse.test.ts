// Markdown's pure half (src/components/markdown/parse.ts): the scheme a host sees; the repair of an answer still being written (a fence, a link, a table, marks
// left open), and the tidy of one cut off; the bounds on what the parser's work costs (a paragraph
// longer or denser with marks than any answer's, an answer of more lines than one piece holds);
// reading a long answer a block at a time; and the one HTML form read as a section.
//
//   pnpm exec vp test scripts/markdown-parse.test.ts
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";
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

/**
 * How long a test that weighs its own time may run, in milliseconds. What it weighs is this
 * process's time on the processor, of which it takes a second at most; on a machine busy with
 * others that can be many times as long by the clock, which a test's default five seconds go by.
 */
const SLOW_TEST = 120_000;

/** This process's own time on the processor so far, in milliseconds. */
const now = () => {
  const { user, system } = process.cpuUsage();
  return (user + system) / 1000;
};

/**
 * How many times longer `whole` takes than `small`, in this process's own time on the processor,
 * which does not grow while a busy machine runs others. One run of each, as a rule; should the
 * growth not be under `limit`, each is run again, up to twelve times, and the best of each is
 * taken: what a collection of garbage or a compile added to one run goes, and growth that is the
 * code's stays.
 */
const growthOf = (small: () => unknown, whole: () => unknown, limit = 24) => {
  let fast = Number.POSITIVE_INFINITY;
  let slow = Number.POSITIVE_INFINITY;
  for (let run = 0; run < 12; run += 1) {
    const start = now();
    small();
    const middle = now();
    whole();
    fast = Math.min(fast, middle - start);
    slow = Math.min(slow, now() - middle);
    if (slow / Math.max(fast, 1) < limit) {
      break;
    }
  }
  return slow / Math.max(fast, 1);
};

describe("the end of a long answer, read on every word that arrives", () => {
  // Each took half a second or more at 40 KB, for every few words, while its patterns weighed every
  // way to split the run; now it takes time in step with the length. Four times the text: in step
  // is 4, the square is 16.
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
        const growth = growthOf(
          () => read(quarter),
          () => read(whole),
          8
        );
        expect(growth).toBeLessThan(8);
      }
    },
    SLOW_TEST
  );
});

/** `unit` again and again, to `length` characters at least. */
const filled = (unit: string) => (length: number) =>
  unit.repeat(Math.ceil(length / unit.length));

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

/** How many nodes of each of `types` a tree holds. */
const countOf = (tree: Tree, types: string[]) => {
  const count = new Map(types.map((type) => [type, 0]));
  const visit = (node: Tree) => {
    const found = count.get(node.type);
    if (found !== undefined) {
      count.set(node.type, found + 1);
    }
    for (const child of node.children ?? []) {
      visit(child);
    }
  };
  visit(tree);
  return Object.fromEntries(count);
};

/** Whether `node` holds anything read from marks: a link, bold, code. */
const hasMarks = (node: Tree): boolean =>
  (node.children ?? []).some(
    (child) =>
      !["text", "break", "paragraph", "listItem"].includes(child.type) ||
      hasMarks(child)
  );

/** The tree of an answer as Markdown draws it: within the bounds, then parsed. */
const boundedTree = (source: string) => parseMarkdown(bounded(source));

const noSpace = (text: string) => text.replaceAll(/\s/gu, "");

/** A sentence a real answer may hold: a link, bold and code. */
const sentenceOf = (n: number) =>
  `See [the report ${n}](https://example.com/${n}), which says **point ${n}** holds, as \`run ${n}\` shows. `;

/** Park and Miller's numbers below `below`, the same on every run. */
const randomFrom = (start: number) => {
  let seed = start;
  return (below: number) => {
    seed = (seed * 16_807) % 2_147_483_647;
    return Math.floor((seed / 2_147_483_647) * below);
  };
};

describe("a paragraph longer than any answer's", () => {
  // The parser's work on one paragraph grows as its square when it is full of escapes, code, tags,
  // references or marks: a paragraph of 100 KB took seconds, of 500 KB a minute. A paragraph
  // past the bound is not read for marks, so each takes time in step with its length: 80 KB against
  // 10 KB, both past the bound. Eight times the text: in step is 8, the square is 64; 24 is near
  // their midpoint as a factor (three times the one, a third of the other).
  test.each([
    ["brackets", (n: number) => `${"[".repeat(n / 5)}a${"](b)".repeat(n / 5)}`],
    ["stars", filled("*a")],
    ["stray ends", filled("](")],
    ["closing stars", filled("a* ")],
    [
      "a bracket left open before words",
      (n: number) => `[${filled("word ")(n)}`,
    ],
    ["pictures left open", filled("![a")],
    ["references left open", filled("[x][")],
    ["comments left open", filled("a <!-- ")],
    ["instructions left open", filled("a <? ")],
    ["declarations left open", filled("a <!x ")],
    ["escapes", filled("a \\* ")],
    ["code", filled("a `b` ")],
    ["comments closed", filled("a <!-- x --> ")],
    ["references to characters", filled("a &amp; ")],
  ])(
    "%s takes time in step with its length",
    (_, make) => {
      const eighth = make(10_000);
      const whole = make(80_000);
      const growth = growthOf(
        () => boundedTree(eighth),
        () => boundedTree(whole)
      );
      expect(growth).toBeLessThan(24);
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
    expect(
      countOf(node ?? { type: "none" }, ["link", "strong", "inlineCode"])
    ).toStrictEqual({ link: 55, strong: 55, inlineCode: 55 });
  });

  // Each paragraph just under the bound costs its most, emphasis in emphasis half a second for one
  // of them: 64,000 characters of those, which were read for their marks whatever they held, took
  // 3.5 s. Now a paragraph with more than 128 marks spends its marks squared from a budget that
  // half a second's reading spends, and those after it are plain text. One run of each, timed.
  test.each([
    ["closing stars", "a* ".repeat(2667)],
    [
      "emphasis in emphasis, with words between",
      `${"*aaaa ".repeat(666)}${"bbbb* ".repeat(666)}`,
    ],
  ])(
    "400 KB of the costliest paragraphs just under the bound, of %s, is read within the budget",
    (_, paragraph) => {
      const source = filled(`${paragraph.slice(0, 7999)}\n\n`)(400_000);
      const start = now();
      boundedTree(source);
      // Half a second on a laptop: several times that is allowed a slow machine.
      expect(now() - start).toBeLessThan(3000);
    },
    SLOW_TEST
  );

  test("a paragraph dense with marks is read for them while the budget lasts, and a paragraph of few marks after it too", () => {
    // 2,000 marks: its square is two thirds of the budget.
    const dense = "*a* ".repeat(1000).trim();
    const short = "Some **bold** and [a link](https://example.com).";
    const tree = parseMarkdown([dense, dense, short, dense].join("\n\n"));
    expect(tree.children.map((node) => hasMarks(node))).toStrictEqual([
      true,
      false,
      true,
      false,
    ]);
    expect(shapeOf(tree.children[2] ?? { type: "none" })).toBe(
      "paragraph(text,strong(text),text,link(text),text)"
    );
    expect(wordsOf(tree.children[1] ?? { type: "none" })).toBe(dense);
  });

  // Text made at random in every place a paragraph can stand, each past the bound: whatever its
  // characters (marks, escapes, tags, tabs, two-unit characters, the character that stands in for
  // them while the blocks are read), it is drawn in its place, every character, in order.
  test(
    "a long one loses no character, wherever it stands and whatever it holds",
    () => {
      const random = randomFrom(7);
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
        "§",
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
        {
          first: "[^n]: ",
          next: "    ",
          shape: "footnoteDefinition(paragraph",
        },
      ];
      for (let round = 0; round < 10; round += 1) {
        const place = places[round % places.length] ?? places[0];
        const lines = contentOf(false);
        const ending = round % 2 === 0 ? "\n" : "\r\n";
        const source = lines
          .map(
            (line, index) => (index === 0 ? place?.first : place?.next) + line
          )
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
    },
    SLOW_TEST
  );
});

/** The tree of `source` as the parser reads it whole, with no bounds. */
const wholeTree = (source: string) =>
  fromMarkdown(source, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });

/** `count` lines, one after the other. */
const lines = (count: number, line: (at: number) => string) =>
  Array.from({ length: count }, (_, at) => line(at)).join("");

/** The marks a report holds, by the node each is read as. */
const MARKS = [
  "link",
  "linkReference",
  "footnoteReference",
  "strong",
  "emphasis",
  "inlineCode",
  "delete",
];

/**
 * A report of `length` characters at least, as a model writes one: paragraphs with links, bold,
 * code, notes and bare addresses, lists in lists, tasks, tables, code, quotes and headings, and at
 * its end the notes and the links it refers to. With it, how many of each mark it holds.
 */
const reportOf = (length: number) => {
  const random = randomFrom(11);
  const marks = Object.fromEntries(MARKS.map((mark) => [mark, 0]));
  const marked = (text: string, ...made: string[]) => {
    for (const mark of made) {
      marks[mark] = (marks[mark] ?? 0) + 1;
    }
    return text;
  };
  const nouns = ["revenue", "churn", "the pipeline", "support load", "latency"];
  const noun = () => nouns[random(nouns.length)] ?? "";
  const sentences = [
    (n: number) =>
      `In the third quarter ${noun()} rose by ${n % 17} percent, while ${noun()} held steady. `,
    (n: number) =>
      marked(
        `See [the report on ${noun()}](https://example.com/reports/${n}), which says **${noun()} matters** most. `,
        "link",
        "strong"
      ),
    (n: number) =>
      marked(
        `Running \`sync --team ${n}\` shows that *${noun()}* is still behind ${noun()}. `,
        "inlineCode",
        "emphasis"
      ),
    (n: number) =>
      marked(
        `That is what the note says[^n${n % 40}], and [the wiki][wiki${n % 20}] agrees with it. `,
        "footnoteReference",
        "linkReference"
      ),
    (n: number) =>
      marked(
        `More at https://example.com/${n} and ~~the old page~~ on ${noun()} and ${noun()}. `,
        "link",
        "delete"
      ),
  ];
  const sentence = (n: number) =>
    sentences[random(sentences.length)]?.(n) ?? "";
  const under = () =>
    marked(
      `  - under it, ${noun()}\n    1. deeper, **${noun()}**\n    2. deeper still\n`,
      "strong"
    );
  const blocks = [
    (n: number) =>
      `${"#".repeat(1 + random(4))} On ${noun()}, section ${n}\n\n`,
    (n: number) =>
      `${lines(3 + random(8), (at) => `- ${sentence(n + at)}\n${at % 3 === 0 ? under() : ""}`)}\n`,
    (n: number) =>
      `${lines(3 + random(6), (at) => `${at + 1}. ${sentence(n + at)}\n`)}\n`,
    (n: number) =>
      `| Team | Open | Note |\n| --- | ---: | :-- |\n${lines(3 + random(12), (at) => marked(`| ${noun()} | ${n + at} | **${noun()}** and [a link](https://example.com/${at}) |\n`, "strong", "link"))}\n`,
    (n: number) =>
      `\`\`\`ts\n${lines(4 + random(20), (at) => `const value${at} = compute(${n}); // - not a list, **not bold**\n${at % 4 === 0 ? "\n" : ""}`)}\`\`\`\n\n`,
    (n: number) => `> ${sentence(n)}\n> ${sentence(n + 1)}\n\n`,
    () => `- [x] ${noun()} checked\n- [ ] ${noun()} open\n\n`,
    (n: number) => `${lines(2 + random(9), (at) => sentence(n + at))}\n\n`,
    (n: number) => `${lines(2 + random(9), (at) => sentence(n + at))}\n\n`,
    (n: number) => `${lines(2 + random(9), (at) => sentence(n + at))}\n\n`,
  ];
  const parts: string[] = [];
  for (let n = 0, size = 0; size < length; n += 1) {
    const part = blocks[random(blocks.length)]?.(n) ?? "";
    parts.push(part);
    size += part.length;
  }
  parts.push(
    lines(40, (n) => `[^n${n}]: Note ${n} on ${noun()}.\n\n`),
    lines(20, (n) => `[wiki${n}]: https://wiki.example.com/${n} "Wiki ${n}"\n`)
  );
  return { source: parts.join(""), marks };
};

describe("a long answer of ordinary blocks", () => {
  // Marks were read for the first 64,000 characters of an answer only, so a long report was plain
  // text from there on. An ordinary block costs time in step with its length, so all of them are
  // read for their marks: the tree is the one the parser reads whole, every place the same.
  test(
    "a report of 150 KB is read as the parser reads it whole: every mark, every place",
    () => {
      const { source } = reportOf(150_000);
      expect(parseMarkdown(source).children).toStrictEqual(
        wholeTree(source).children
      );
    },
    SLOW_TEST
  );

  test(
    "a report of 1 MB keeps every mark, and takes time in step with its length",
    () => {
      const eighth = reportOf(125_000).source;
      const { source, marks } = reportOf(1_000_000);
      expect(source.length).toBeGreaterThan(1_000_000);
      let tree: Tree = { type: "root" };
      const growth = growthOf(
        () => parseMarkdown(eighth),
        () => {
          tree = parseMarkdown(source);
        }
      );
      expect(growth).toBeLessThan(24);
      expect(countOf(tree, MARKS)).toStrictEqual(marks);
    },
    SLOW_TEST
  );

  test("a link or a note defined in another piece of it is still one", () => {
    const source = `Start [the wiki][wiki] and a note[^1].\n\n${"Words.\n\n".repeat(200)}Later [the wiki][wiki], [wiki] and a note[^1], but [not defined].\n\n> [quoted]: https://example.com/quoted\n\n${"Words.\n\n".repeat(200)}End [quoted] and [the wiki][wiki].\n\n\`\`\`\n[code]: https://example.com/not-defined\n\`\`\`\n\nAnd [code] is words.\n\n[wiki]: https://example.com/wiki\n[^1]: The note.\n`;
    expect(parseMarkdown(source).children).toStrictEqual(
      wholeTree(source).children
    );
  });
});

/** `unit` again and again from 0 up, `count` times. */
const counted = (unit: (at: number) => string) => (count: number) =>
  lines(count, unit);

/** A list `deep` deep: each item two spaces further in than the one it is under. */
const stairs = (deep: number) =>
  lines(deep, (depth) => `${"  ".repeat(depth)}- item ${depth}\n`);

describe("a block of more lines than any answer's", () => {
  // The parser's work on a list grows faster than its items (a tight list of 400 KB took 19 s,
  // one of items with no words 77 s), and so it does on a paragraph's lines, on lines given to a
  // quote or a list item with no mark of theirs (60 s), and on underlined headings (40 s). An
  // answer is read in pieces, so each takes time in step with its lines: eight times the lines, in
  // step is 8, the square is 64. The first eight are weighed at as many lines as that growth shows
  // at without the pieces; the kinds after them grow too slowly there to show in less than
  // seconds, and are weighed so that no work of the pieces' own grows with them.
  test.each([
    ["a list of items with no words", counted(() => "-\n"), 16_000],
    ["lists in lists", counted(() => "- a\n  - b\n    - c\n"), 2400],
    [
      "a list item of many items under it",
      (n: number) => `- a\n${"  - b\n".repeat(n)}`,
      4000,
    ],
    ["a list a space in from the margin", counted(() => " - a\n"), 4000],
    [
      "a list item carried on by lines with no indent",
      (n: number) => `- a\n${"b\n".repeat(n)}`,
      4000,
    ],
    [
      "a quote carried on by lines with no mark",
      (n: number) => `> a\n${"b\n".repeat(n)}`,
      4000,
    ],
    ["underlined headings", counted(() => "a\n===\n\n"), 5000],
    ["a quote of many lines", counted(() => "> a\n"), 4000],
    ["a tight list", counted(() => "- a\n"), 4000],
    ["an ordered list", counted(() => "1. a\n"), 2000],
    ["a list of tasks", counted(() => "- [x] a\n"), 2000],
    [
      "a list with blank lines between its items",
      counted(() => "- a\n\n"),
      2000,
    ],
    ["a list in a quote", counted(() => "> - a\n"), 2000],
    [
      "a table of many rows",
      (n: number) => `| a | b |\n| - | - |\n${"| c | d |\n".repeat(n)}`,
      2000,
    ],
    ["headings", counted(() => "# a\n\n"), 2000],
    ["a paragraph of many lines", counted(() => "a\n"), 4000],
    ["notes", counted((at) => `a[^${at}]\n\n[^${at}]: b\n\n`), 800],
    [
      "links defined apart",
      counted((at) => `[a${at}]\n\n[a${at}]: https://example.com\n\n`),
      800,
    ],
    ["a line with no spaces", (n: number) => "a".repeat(n), 160_000],
    ["blank lines", counted(() => "\n"), 16_000],
    [
      "blank lines in a list",
      (n: number) => `- a\n${"\n".repeat(n)}- b\n`,
      16_000,
    ],
    [
      "blank lines in indented code",
      (n: number) => `    a\n${"\n".repeat(n)}    b\n`,
      16_000,
    ],
    [
      "code of many lines",
      (n: number) => `\`\`\`\n${"a\n".repeat(n)}\`\`\`\n`,
      16_000,
    ],
    [
      "code of many lines in a list item",
      (n: number) => `- a\n\n  \`\`\`\n${"  a\n".repeat(n)}  \`\`\`\n`,
      8000,
    ],
    // What looks to open code or a comment and does not: the list after it is read in pieces too.
    [
      "a fence in HTML, then a list",
      (n: number) => `<div>\n\`\`\`\n\n${"- a\n".repeat(n)}`,
      2000,
    ],
    [
      "a comment in HTML, then a list",
      (n: number) => `<div>\n<!--\n\n${"- a\n".repeat(n)}`,
      2000,
    ],
  ])(
    "%s takes time in step with its length",
    (_, make, count) => {
      const eighth = make(count / 8);
      const whole = make(count);
      const growth = growthOf(
        () => boundedTree(eighth),
        () => boundedTree(whole)
      );
      expect(growth).toBeLessThan(24);
    },
    SLOW_TEST
  );

  // A tight list's growth is the slowest to show: eight times the items took some twenty times as
  // long. So it is weighed over a longer step, sixty-four times the items, where in step is 64 at
  // most and the square 4,096: 16,000 items took 170 times as long as 250, and now take 26 times.
  test(
    "a tight list of 16,000 items takes time in step with its length",
    () => {
      const few = "- a\n".repeat(250);
      const many = "- a\n".repeat(16_000);
      const growth = growthOf(
        () => boundedTree(few),
        () => boundedTree(many),
        96
      );
      expect(growth).toBeLessThan(96);
    },
    SLOW_TEST
  );

  // Read in pieces, each is the tree the parser reads whole: one list, one quote, one table, one
  // paragraph, one piece of code, with every item, row and line, and every place the source's.
  test.each([
    [
      "a tight list",
      counted(
        (at) => `- item ${at} with [a link](https://example.com/${at})\n`
      ),
    ],
    ["an ordered list from 7 on", counted((at) => `${at + 7}. item ${at}\n`)],
    [
      "an ordered list with brackets",
      counted((at) => `${at + 1}) item ${at}\n`),
    ],
    [
      "a list of tasks",
      counted((at) => `- [${at % 2 === 0 ? "x" : " "}] task ${at}\n`),
    ],
    [
      "lists in lists",
      counted((at) => `- item ${at}\n  - under ${at}\n    1. deep ${at}\n`),
    ],
    [
      "a list with blank lines between its items",
      counted((at) => `- item ${at}\n\n`),
    ],
    [
      "a list with blank lines between some items",
      counted((at) => `- item ${at}\n${at % 50 === 0 ? "\n" : ""}`),
    ],
    [
      "a list of items of two paragraphs",
      counted((at) => `- item ${at}\n\n  more of ${at}\n`),
    ],
    ["a list of items with no words", counted(() => "-\n")],
    [
      "lists of other marks, one after the other",
      counted((at) => `${at % 200 < 100 ? "-" : "*"} item ${at}\n`),
    ],
    ["a list a space in from the margin", counted((at) => ` - item ${at}\n`)],
    ["a list in a quote", counted((at) => `> - item ${at}\n`)],
    ["a list 40 deep, four times", () => stairs(40).repeat(4)],
    [
      "a list item of many items under it",
      (n: number) => `- a\n${counted((at) => `  - under ${at}\n`)(n)}- b\n`,
    ],
    [
      "a list item of many items two under it",
      (n: number) =>
        `- a\n  - b\n${counted((at) => `    - under ${at}\n`)(n)}  - c\n- d\n`,
    ],
    [
      "a list item of many paragraphs",
      (n: number) =>
        `1. a\n\n${counted((at) => `   paragraph ${at}\n\n`)(n)}2. b\n`,
    ],
    [
      "a list item of many lines",
      (n: number) => `- a\n${counted((at) => `  line ${at}\n`)(n)}`,
    ],
    [
      "a list item carried on by lines with no indent",
      (n: number) => `- a\n${counted((at) => `line ${at}\n`)(n)}`,
    ],
    ["a quote of many lines", counted((at) => `> line ${at} of **it**\n`)],
    [
      "a quote carried on by lines with no mark",
      (n: number) => `> a\n${counted((at) => `line ${at}\n`)(n)}`,
    ],
    ["a quote of many paragraphs", counted((at) => `> paragraph ${at}\n>\n`)],
    [
      "a table of many rows",
      (n: number) =>
        `| a | b |\n| :- | -: |\n${counted((at) => `| cell ${at} | **other** ${at} |\n`)(n)}`,
    ],
    [
      "a table whose rows start with no pipe",
      (n: number) =>
        `a | b\n- | -\n${counted((at) => `cell ${at} | ${at}\n`)(n)}`,
    ],
    [
      "a table in a list item",
      (n: number) =>
        `- a\n\n  | a | b |\n  | - | - |\n${counted((at) => `  | cell ${at} | ${at} |\n`)(n)}`,
    ],
    ["a paragraph of many lines", counted((at) => `line ${at} of *it*\n`)],
    ["lines that end in a break", counted((at) => `line ${at}  \n`)],
    ["lines that end in a backslash", counted((at) => `line ${at}\\\n`)],
    [
      "a paragraph that a line under it makes a heading",
      (n: number) => `${counted((at) => `line ${at}\n`)(n)}===\n\nAfter.\n`,
    ],
    ["headings", counted((at) => `## Heading ${at}\n\n`)],
    ["underlined headings", counted((at) => `Heading ${at}\n===\n\n`)],
    [
      "code of many lines, some blank, some like Markdown",
      (n: number) =>
        `Before.\n\n\`\`\`md\n${counted((at) => `- item ${at}\n\n# heading ${at}\n> quote\n`)(n)}\`\`\`\n\nAfter **it**.\n`,
    ],
    [
      "code never closed",
      (n: number) =>
        `Before.\n\n~~~\n${counted((at) => `- item ${at}\n\n`)(n)}`,
    ],
    [
      "code of many lines in a list item",
      (n: number) =>
        `1. Write it:\n\n   \`\`\`ts\n${counted((at) => `   const a${at} = ${at};\n${at % 5 === 0 ? "\n" : ""}`)(n)}   \`\`\`\n\n   Then **run** it.\n2. Next.\n`,
    ],
    [
      "code of many lines in a quote",
      (n: number) =>
        `> Read:\n>\n> \`\`\`\n${counted((at) => `> - line ${at}\n${at % 5 === 0 ? ">\n" : ""}`)(n)}> \`\`\`\n>\n> And **then**.\n`,
    ],
    [
      "indented code",
      (n: number) =>
        `Before.\n\n${counted((at) => `    line ${at}\n${at % 9 === 0 ? "\n" : ""}`)(n)}`,
    ],
    [
      "a comment of many paragraphs",
      (n: number) =>
        `Before.\n\n<!--\n${counted((at) => `- item ${at}\n\n`)(n)}-->\n\nAfter **it**.\n`,
    ],
    [
      "a comment of many paragraphs in a list item",
      (n: number) =>
        `- a\n\n  <!--\n${counted((at) => `  line ${at}\n\n`)(n)}  -->\n\n  After **it**.\n`,
    ],
    [
      "raw text of many paragraphs",
      (n: number) =>
        `Before.\n\n<pre>\n${counted((at) => `line ${at}\n\n`)(n)}</pre>\n\nAfter **it**.\n`,
    ],
    [
      "HTML of many lines",
      (n: number) =>
        `<table>\n${counted((at) => `<tr><td>${at}</td></tr>\nwords *not* read\n`)(n)}</table>\n\nAfter **it**.\n`,
    ],
    [
      "blank lines in a list",
      (n: number) => `- a\n${"\n".repeat(n)}- b\n\n  More of b.\n`,
    ],
    [
      "blank lines in indented code",
      (n: number) => `    a\n${"\n".repeat(n)}    b\n\nAfter.\n`,
    ],
    [
      "HTML that holds lines of a quote's mark alone",
      (n: number) =>
        `<div>\n${counted((at) => `>\nline ${at}\n`)(n)}\nAfter **it**.\n`,
    ],
    [
      "a quote of paragraphs parted by lines of its mark alone",
      counted((at) => `> paragraph ${at}\n>\n>\n`),
    ],
    ["notes", counted((at) => `Words[^${at}].\n\n[^${at}]: Note ${at}.\n\n`)],
    [
      "a note of many paragraphs",
      (n: number) =>
        `Words[^n].\n\n[^n]: Note.\n${counted((at) => `    More ${at}.\n\n`)(n)}\nAfter.\n`,
    ],
  ])(
    "%s is read as the parser reads it whole",
    (_, make) => {
      const source = bounded(make(500));
      expect(parseMarkdown(source).children).toStrictEqual(
        wholeTree(source).children
      );
    },
    SLOW_TEST
  );

  test("a list of 2,000 items is one list, every item with its words", () => {
    const source = counted((at) => `- item ${at} is **here**\n`)(2000);
    const [list, ...rest] = parseMarkdown(source).children;
    const items = list?.type === "list" ? list.children : [];
    expect(rest).toHaveLength(0);
    expect(items).toHaveLength(2000);
    expect(shapeOf(items.at(-1) ?? { type: "none" })).toBe(
      "listItem(paragraph(text,strong(text)))"
    );
    expect(wordsOf(items.at(-1) ?? { type: "none" })).toBe("item 1999 is here");
  });

  test("a list 500 deep keeps every item's words, in lists as deep as a real answer's", () => {
    const tree = boundedTree(stairs(500));
    const words = wordsOf(tree);
    expect(
      Array.from({ length: 500 }, (_, depth) => `item ${depth}`).filter(
        (item) => !words.includes(item)
      )
    ).toStrictEqual([]);
    expect(countOf(tree, ["list"]).list).toBe(32);
  });

  // Lines made at random of every kind of block, some answers of few kinds with no blank line
  // between them, so the pieces end in the middle of anything: every line's word is drawn, in order.
  test(
    "an answer of lines of any kind loses no word",
    () => {
      const random = randomFrom(5);
      const kinds: ((word: string) => string)[] = [
        (word) => word,
        (word) => word,
        () => "",
        (word) => `- ${word}`,
        (word) => `* ${word}`,
        (word) => `  - ${word}`,
        (word) => `    - ${word}`,
        (word) => `  ${word}`,
        (word) => `    ${word}`,
        (word) => `\t${word}`,
        (word) => `1. ${word}`,
        (word) => `${2 + random(40)}. ${word}`,
        (word) => `- [ ] ${word}`,
        (word) => `> ${word}`,
        (word) => `> - ${word}`,
        (word) => `> > ${word}`,
        () => ">",
        (word) => `# ${word}`,
        () => "===",
        () => "---",
        () => "```",
        () => "~~~",
        () => "    ```",
        (word) => `| ${word} | b |`,
        () => "| - | - |",
        (word) => `${word} | b`,
        (word) => `[^n]: ${word}`,
        () => "[r]: https://example.com/r",
        () => "<div>",
        () => "</div>",
        () => "<!--",
        () => "-->",
        () => "<pre>",
        () => "</pre>",
        (word) => `${word}  `,
        (word) => `${word}\\`,
        (word) => `*${word}`,
        (word) => `[${word}`,
        (word) => `${word}](x)`,
        (word) => `**${word}**`,
        (word) => `[${word}][r]`,
        (word) => `${word}[^n]`,
        (word) => `<span>${word}</span>`,
        (word) => `\`${word}`,
      ];
      for (let round = 0; round < 45; round += 1) {
        const few = Array.from(
          { length: 2 + random(4) },
          () => kinds[random(kinds.length)] ?? kinds[0]
        );
        const used = round % 3 === 0 ? few : kinds;
        const answer: string[] = [];
        const words: string[] = [];
        let [kind] = used;
        for (let at = 0; at < 150 + random(400); at += 1) {
          // Some answers change kind on every line, some keep one for a while.
          kind =
            round % 2 === 0 || random(8) === 0
              ? used[random(used.length)]
              : kind;
          const word = `w${at}q`;
          const line = kind?.(word) ?? "";
          answer.push(line);
          if (line.includes(word)) {
            words.push(word);
          }
        }
        const drawn = wordsOf(
          boundedTree(answer.join(round % 5 === 0 ? "\r\n" : "\n"))
        );
        let from = 0;
        const missing = words.filter((word) => {
          const at = drawn.indexOf(word, from);
          from = at === -1 ? from : at;
          return at === -1;
        });
        expect(missing).toStrictEqual([]);
      }
    },
    SLOW_TEST
  );
});

/**
 * What is drawn of `source` as it is written, `step` characters at a time: for each step, the blocks,
 * read as Markdown reads them while an answer streams.
 */
const written = (source: string, step: number) => {
  const steps: Tree[][] = [];
  let kept = NOTHING;
  for (let end = step; end < source.length + step; end += step) {
    const read = readBlocks(repair(bounded(source.slice(0, end))).text, kept);
    ({ kept } = read);
    steps.push(read.blocks.map(({ node }) => node));
  }
  return steps;
};

/** How often what `states` holds changes from one step to the next. */
const changes = (states: boolean[]) =>
  states.filter((state, at) => at > 0 && state !== states[at - 1]).length;

/** A line a real answer may hold, of 90 characters or so. */
const lineOf = (n: number) =>
  `See [the report ${n}](https://example.com/${n}), which says **point ${n}** holds for now.\n`;

describe("while a long block is written", () => {
  // A block that turned plain text, then back, then plain again as more of it came would jump
  // each time. It turns once, when it crosses a bound, and what is written after that is plain too:
  // past 8,000 characters (a paragraph of 150 lines passes that, and then the lines of one piece),
  // or past the budget of marks.
  test.each([
    [
      "a paragraph that grows past 8,000 characters",
      lines(110, (n) => sentenceOf(n)),
    ],
    ["a paragraph of 150 lines", lines(150, lineOf)],
    ["a list item carried on by 150 lines", `- ${lines(150, lineOf)}`],
    ["a quote of 150 lines", lines(150, (n) => `> ${lineOf(n)}`)],
    ["a paragraph that grows past the budget of marks", "*a* ".repeat(1900)],
  ])(
    "%s turns plain text once, and stays",
    (_, source) => {
      const states = written(source, 487).map((blocks) => {
        expect(blocks).toHaveLength(1);
        return hasMarks(blocks[0] ?? { type: "none" });
      });
      expect(states[0]).toBeTruthy();
      expect(states.at(-1)).toBeFalsy();
      expect(changes(states)).toBe(1);
    },
    SLOW_TEST
  );

  test("a paragraph of 400 short lines never turns: each of its parts is read for its marks", () => {
    const source = lines(400, (n) => `Line ${n} with **bold**.\n`);
    for (const blocks of written(source, 997)) {
      expect(blocks).toHaveLength(1);
      expect(
        countOf(blocks[0] ?? { type: "none" }, ["strong"]).strong
      ).toBeGreaterThanOrEqual(
        wordsOf(blocks[0] ?? { type: "none" }).split("\n").length - 1
      );
    }
  });

  test(
    "a list of 300 items is one list at every step, each item read for its marks",
    () => {
      const source = counted(
        (at) => `- item ${at} with [a link](https://example.com/${at})\n`
      )(300);
      let before = 0;
      for (const blocks of written(source, 2503)) {
        const [list] = blocks;
        const items = list?.children ?? [];
        expect(blocks).toHaveLength(1);
        expect(items.length).toBeGreaterThanOrEqual(before);
        // Every item but the one being written is its words and its link.
        expect(
          items
            .slice(0, -1)
            .map((item) => shapeOf(item))
            .filter((shape) => shape !== "listItem(paragraph(text,link(text)))")
        ).toStrictEqual([]);
        before = items.length;
      }
      expect(before).toBe(300);
    },
    SLOW_TEST
  );
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
