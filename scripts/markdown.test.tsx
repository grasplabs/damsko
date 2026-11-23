// Markdown and untrusted text, drawn on the server (react-dom/server, StyleX compiled by its
// plugin): every link and picture in an answer as the host's renderLink sees it, and as Markdown
// draws it without one. An answer's links can come from prompt-injected text (a web page, a
// document, a tool result), so:
//   - renderLink sees every link, any scheme, its address as written, before Markdown's filter;
//   - a link the host drew gets no anchor from Markdown;
//   - without renderLink only http, https and mailto lead anywhere; javascript:, data:, vbscript:,
//     file: and relative paths are words, in any case and with tabs or spaces in the scheme;
//   - raw HTML is text (no element is made from it), and a picture is never loaded;
//   - the same holds for every prefix of a hostile answer while it is still being written, and
//     when it is cut off there (`truncated`).
//
//   pnpm exec vp test scripts/markdown.test.tsx
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import {
  Markdown,
  MarkdownLinkProvider,
} from "../src/components/markdown/index.ts";
import type {
  MarkdownLink,
  MarkdownLinkRenderer,
  MarkdownProps,
} from "../src/components/markdown/index.ts";

const draw = (
  source: string,
  props: Omit<MarkdownProps, "children"> = {}
): string => renderToStaticMarkup(<Markdown {...props}>{source}</Markdown>);

/**
 * How long a test that draws an answer many times over may run, in milliseconds. It takes a second
 * of this process's time on the processor at most; on a machine busy with others that can be many
 * times as long by the clock, which a test's default five seconds go by.
 */
const SLOW_TEST = 120_000;

/** The words a node holds, for comparing what renderLink was handed. */
const wordsOf = (node: ReactNode) =>
  renderToStaticMarkup(<span>{node}</span>).replaceAll(/<[^>]+>/gu, "");

/** Every <a …> and the href it carries. */
const anchors = (html: string) =>
  [...html.matchAll(/<a\b(?<attributes>[^>]*)>/gu)].map(
    (match) =>
      /\bhref="(?<href>[^"]*)"/u.exec(match.groups?.attributes ?? "")?.groups
        ?.href ?? null
  );

/** Elements made that must never be: a picture, a script, a frame, an inline handler. */
const madeFromHtml = (html: string) =>
  [
    ...html.matchAll(
      /<(?:img|script|iframe|object|embed|style|b)\b|\son\w+="/gu
    ),
  ].map((match) => match[0]);

// A script link's scheme, written so no lint takes the test's own strings for one.
const JS = ["java", "script"].join("");

/** What a reader sees of drawn HTML: its text, the tags gone. */
const textOf = (html: string) =>
  html.replaceAll(/<[^>]+>/gu, "").replaceAll("&quot;", '"');

/** The level of every heading drawn, in order. */
const levels = (html: string) =>
  [...html.matchAll(/<h(?<level>\d)\b/gu)].map((match) =>
    Number(match.groups?.level)
  );

/** The page's own renderer in the test of who is asked first: it draws citations. */
const pageRenderer: MarkdownLinkRenderer = (link) =>
  link.scheme === "cite" ? <b data-by="page">{link.children}</b> : undefined;

/** The provider's: web links and citations. */
const providedRenderer: MarkdownLinkRenderer = (link) =>
  link.scheme === "https" || link.scheme === "cite" ? (
    <i data-by="provider">{link.children}</i>
  ) : undefined;

const leadsSomewhereBad = (href: string | null) =>
  href !== null && !/^(?:https?:|mailto:|#)/iu.test(href);

const everyScheme = [
  '[web](https://example.com/a?b=1 "Web title")',
  "[mail](mailto:noor@example.com)",
  `[js](${JS}:alert(1))`,
  `[mixed](${JS.toUpperCase()}:alert(1))`,
  "[data](data:text/html,<b>x</b>)",
  "[vb](vbscript:msgbox)",
  "[file](file:///etc/passwd)",
  '[note](cite:42 "The quote it cites")',
  "[relative](./private/page)",
  "[here](#section)",
  "<https://auto.example.com>",
  "www.literal.example.com",
  '![a chart](https://img.example.com/c.png "Chart title")',
  "[ref][r] and ![pic][p]",
  "",
  '[r]: https://ref.example.com "Ref title"',
  '[p]: https://img.example.com/p.png "Pic title"',
].join("\n");

const hostile = [
  "[x](javascript:alert(1))",
  "[x](JaVaScRiPt:alert(1))",
  "[x](java\tscript:alert(1))",
  "[x]( javascript:alert(1))",
  "[x](\u0001javascript:alert(1))",
  "[x](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)",
  "[x](vbscript:msgbox(1))",
  "[x](file:///etc/passwd)",
  "[x](/relative/path) and [y](../up)",
  `<a href="${JS}:alert(1)">raw link</a>`,
  '<img src="https://evil.example.com/x.png" onerror="alert(1)">',
  "<script>alert(1)</script>",
  '<iframe src="https://evil.example.com"></iframe>',
  "![tracker](https://evil.example.com/pixel.gif?secret=1)",
  "[a [b](https://inner.example.com) c](https://outer.example.com)",
  "Visit https://autolinked.example.com/path now.",
];

/** Every prefix of the hostile answer, drawn so, that leads somewhere bad or makes an element. */
const badPrefixes = (props: Omit<MarkdownProps, "children">) => {
  const answer = hostile.join("\n\n");
  return Array.from({ length: answer.length }, (_, at) => {
    const html = draw(answer.slice(0, at + 1), props);
    return [
      ...anchors(html).filter(leadsSomewhereBad),
      ...madeFromHtml(html),
    ].map((made) => `at ${at + 1} characters: ${made}`);
  }).flat();
};

describe("renderLink", () => {
  test("sees every link and picture, any scheme, before the filter", () => {
    const seen: MarkdownLink[] = [];
    draw(everyScheme, {
      renderLink: (link) => {
        seen.push(link);
        return <button type="button">{link.children}</button>;
      },
    });
    expect(
      seen.map((link) => [
        link.href,
        link.scheme,
        link.type,
        link.title,
        wordsOf(link.children),
      ])
    ).toStrictEqual([
      ["https://example.com/a?b=1", "https", "link", "Web title", "web"],
      ["mailto:noor@example.com", "mailto", "link", undefined, "mail"],
      [`${JS}:alert(1)`, JS, "link", undefined, "js"],
      [`${JS.toUpperCase()}:alert(1)`, JS, "link", undefined, "mixed"],
      ["data:text/html,<b>x</b>", "data", "link", undefined, "data"],
      ["vbscript:msgbox", "vbscript", "link", undefined, "vb"],
      ["file:///etc/passwd", "file", "link", undefined, "file"],
      ["cite:42", "cite", "link", "The quote it cites", "note"],
      ["./private/page", "", "link", undefined, "relative"],
      ["#section", "", "link", undefined, "here"],
      [
        "https://auto.example.com",
        "https",
        "autolink",
        undefined,
        "https://auto.example.com",
      ],
      [
        "http://www.literal.example.com",
        "http",
        "autolink",
        undefined,
        "www.literal.example.com",
      ],
      [
        "https://img.example.com/c.png",
        "https",
        "image",
        "Chart title",
        "a chart",
      ],
      ["https://ref.example.com", "https", "link", "Ref title", "ref"],
      ["https://img.example.com/p.png", "https", "image", "Pic title", "pic"],
    ]);
  });

  test("a link the host drew gets no anchor; footnotes stay Markdown's own", () => {
    const html = draw(`${everyScheme}\n\nA note.[^1]\n\n[^1]: The note.`, {
      renderLink: (link) => (
        <button type="button" data-asked={link.href}>
          {link.children}
        </button>
      ),
    });
    const hrefs = anchors(html);
    expect(
      hrefs.filter((href) => href?.startsWith("#") !== true)
    ).toStrictEqual([]);
    expect(hrefs.filter((href) => href?.startsWith("#") === true)).toHaveLength(
      2
    );
    expect(html).toContain('data-asked="cite:42"');
  });

  test("undefined draws Markdown's own, as having none", () => {
    expect(draw(everyScheme, { renderLink: () => {} })).toBe(draw(everyScheme));
  });

  test("the page's own is asked first, then the provider around it", () => {
    const html = renderToStaticMarkup(
      <MarkdownLinkProvider renderLink={providedRenderer}>
        <Markdown renderLink={pageRenderer}>
          [a](cite:1) [b](https://example.com) [c](mailto:x@example.com)
        </Markdown>
      </MarkdownLinkProvider>
    );
    expect(html).toContain('<b data-by="page">a</b>');
    expect(html).toContain('<i data-by="provider">b</i>');
    expect(anchors(html)).toStrictEqual(["mailto:x@example.com"]);
  });
});

describe("Markdown's own links", () => {
  test("only http, https and mailto lead anywhere; a web link opens safely, a mail link in place", () => {
    const html = draw(everyScheme);
    const hrefs = anchors(html);
    expect(hrefs.filter(leadsSomewhereBad)).toStrictEqual([]);
    expect(hrefs).toStrictEqual([
      "https://example.com/a?b=1",
      "mailto:noor@example.com",
      "https://auto.example.com/",
      "http://www.literal.example.com/",
      "https://img.example.com/c.png",
      "https://ref.example.com/",
      "https://img.example.com/p.png",
    ]);
    expect(html).toMatch(
      /<a [^>]*href="https:\/\/example\.com\/a\?b=1"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/u
    );
    expect(html).not.toMatch(/<a [^>]*href="mailto:[^"]*"[^>]*target=/u);
  });

  test("script and data links are their words", () => {
    const html = draw(
      "A [script link](javascript:alert(1)) and a [data link](data:text/html,x)."
    );
    expect(anchors(html)).toStrictEqual([]);
    expect(html).toContain("A script link and a data link.");
  });
});

describe("untrusted text", () => {
  test("hostile links and raw HTML lead nowhere and make no element", () => {
    const bad = hostile.flatMap((source) => {
      const html = draw(source);
      return [
        ...anchors(html).filter(leadsSomewhereBad),
        ...madeFromHtml(html),
      ].map((made) => `${source}: ${made}`);
    });
    expect(bad).toStrictEqual([]);
  });

  test("raw HTML is shown as its own text", () => {
    expect(textOf(draw(`<a href="${JS}:alert(1)">raw link</a>`))).toBe(
      `&lt;a href="${JS}:alert(1)"&gt;raw link&lt;/a&gt;`
    );
    expect(textOf(draw('Words <b onmouseover="alert(1)">bold</b>.'))).toBe(
      'Words &lt;b onmouseover="alert(1)"&gt;bold&lt;/b&gt;.'
    );
  });

  test("never an anchor inside an anchor; a bare address links itself", () => {
    expect(
      draw("[a [b](https://inner.example.com) c](https://outer.example.com)")
    ).not.toMatch(/<a\b(?:(?!<\/a>).)*<a\b/su);
    expect(
      anchors(draw("Visit https://autolinked.example.com/path now."))
    ).toContain("https://autolinked.example.com/path");
  });

  test(
    "every prefix of a hostile answer, while it is written",
    () => {
      expect(badPrefixes({ streaming: true })).toStrictEqual([]);
    },
    SLOW_TEST
  );

  test(
    "every prefix of a hostile answer, cut off there",
    () => {
      expect(badPrefixes({ truncated: true })).toStrictEqual([]);
    },
    SLOW_TEST
  );
});

describe("code fences", () => {
  // A fence's tag is the writer's words: one that names what every object holds is plain code.
  test.each(["__proto__", "constructor", "toString", "hasOwnProperty"])(
    "tagged %s is plain code under its own tag",
    (tag) => {
      const html = draw(`\`\`\`${tag}\nconst a = 1;\n\`\`\``);
      expect(html).toContain(`data-language="${tag}"`);
      expect(textOf(html)).toContain(tag);
      expect(textOf(html)).toContain("const a = 1;");
      expect(html).not.toContain("function");
    }
  );
});

describe("pictures", () => {
  const sources = [
    "![tracker](https://evil.example.com/p.gif)",
    "![](https://evil.example.com/p.gif)",
    "![ref][t]\n\n[t]: https://evil.example.com/p.gif",
  ];

  test("are never loaded, before or after the host's answer", () => {
    for (const source of sources) {
      for (const html of [
        draw(source),
        draw(source, { renderLink: () => {} }),
        draw(source, { renderLink: (link) => <span>{link.children}</span> }),
      ]) {
        expect(html).not.toMatch(/<img|srcset=|<picture|<source|url\(/u);
      }
    }
  });

  test("are drawn only by the host's renderer, as it chooses", () => {
    const html = draw("![a chart](https://img.example.com/c.png)", {
      renderLink: (link) =>
        link.type === "image" ? (
          <span data-picture={link.href}>{link.children}</span>
        ) : undefined,
    });
    expect(html).toContain(
      '<span data-picture="https://img.example.com/c.png">a chart</span>'
    );
  });
});

describe("headings", () => {
  test("start at h1, the fifth and sixth as the fourth", () => {
    expect(
      levels(draw("# a\n\n## b\n\n### c\n\n#### d\n\n##### e\n\n###### f"))
    ).toStrictEqual([1, 2, 3, 4, 4, 4]);
  });

  test("start at the caller's level, never past h6", () => {
    expect(
      levels(draw("# a\n\n## b\n\n### c\n\n#### d", { headingLevel: 3 }))
    ).toStrictEqual([3, 4, 5, 6]);
    expect(levels(draw("# a\n\n#### d", { headingLevel: 5 }))).toStrictEqual([
      5, 6,
    ]);
  });
});

describe("while written", () => {
  test("an open fence is a CodeBlock being written, its marks never words", () => {
    const html = draw("Run:\n\n```python\ndef closed(", { streaming: true });
    expect(html).toContain('data-streaming="true"');
    expect(html).not.toContain("```");
  });

  test("a half link is its words, leading nowhere until its address is whole", () => {
    const link = draw("See [the weekly report](https://exa", {
      streaming: true,
    });
    expect(anchors(link)).toStrictEqual([]);
    expect(link).not.toMatch(/[[\]]/u);
    expect(link).toContain("the weekly report");
    expect(
      anchors(
        draw("See [the weekly report](https://example.com/weekly) and", {
          streaming: true,
        })
      )
    ).toStrictEqual(["https://example.com/weekly"]);
  });

  test("a half table is a table, its half row waiting", () => {
    const table = draw("| Team | Open |\n| :-- | --: |\n| Sup", {
      streaming: true,
    });
    expect(table).toContain("<table");
    expect(table).not.toContain("|");
  });

  test("a half link whose address holds an underscore, a parenthesis or a title is its words", () => {
    for (const source of [
      "See [the spec](https://example.com/a_b",
      "See [Foo](https://en.wikipedia.org/wiki/Foo_(bar",
      'See [text](https://example.com "A title"',
      `See [x](${JS}:alert(1`,
    ]) {
      const html = draw(source, { streaming: true });
      expect(anchors(html)).toStrictEqual([]);
      expect(textOf(html)).toMatch(/^See \w+/u);
      expect(textOf(html)).not.toMatch(/[[\]()_"]/u);
    }
  });

  // Two answers with links whose addresses hold underscores and parentheses, and links with titles,
  // read as they arrive, a character at a time.
  const linked = [
    [
      'The export runs nightly. See [the export spec](https://example.com/docs/export_v2 "Export, version 2") for its fields, and [Comma-separated values](https://en.wikipedia.org/wiki/Comma-separated_values_(format)) for the format.',
      "",
      "It follows **[RFC 4180](https://www.rfc-editor.org/rfc/rfc4180 'Common Format')**, as most tools do, and writes `snake_case` headers.",
    ].join("\n"),
    [
      'Your quota is 40 requests a minute [1](cite:1 "Quota policy, section 4"). Bursts above it are queued, as [the rate_limit docs](https://api.example.com/docs/rate_limit_(burst)) explain.',
      "",
      "- Raise it with [a request](https://example.com/forms/quota_increase?team=core_data).",
      '- See *[the changelog](https://example.com/_changelog/2026 "What changed")* for when it last moved.',
    ].join("\n"),
  ];

  test.each(linked)(
    "no prefix shows a link's marks, and nothing shown is taken back: %#",
    (answer) => {
      const found: string[] = [];
      let before = "";
      for (let at = 1; at <= answer.length; at += 1) {
        const text = textOf(draw(answer.slice(0, at), { streaming: true }));
        if (/\]\(|\[[^\]]*\]$/u.test(text)) {
          found.push(`raw marks at ${at}: ${text}`);
        }
        if (!text.startsWith(before.trimEnd())) {
          found.push(`taken back at ${at}: ${before} -> ${text}`);
        }
        before = text;
      }
      expect(found).toStrictEqual([]);
    },
    SLOW_TEST
  );

  test("bold is bold from its first letter", () => {
    expect(draw("It is **bo", { streaming: true })).toMatch(
      /<strong[^>]*>bo<\/strong>/u
    );
  });
});

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

describe("answers no real answer looks like", () => {
  test("nesting thousands deep is drawn, as words past the depth a real answer has", () => {
    for (const source of [`${"- ".repeat(3000)}a`, `${">".repeat(20_000)} a`]) {
      const html = draw(source);
      expect(textOf(html)).toContain("a");
      expect(html.match(/<(?:ul|blockquote)\b/gu)?.length).toBeLessThan(40);
    }
  });

  test("sections nest as deep as quotes and lists do, and deeper is words", () => {
    const source = `${"<details>\n<summary>s</summary>\n\n".repeat(40)}x\n\n${"</details>\n\n".repeat(40)}`;
    const html = draw(source);
    expect(html.match(/data-slot="markdown-section"/gu)).toHaveLength(32);
    expect(textOf(html)).toContain("&lt;details&gt;");
    expect(textOf(html)).toContain("x");
  });

  test("a list ten deep is still a list ten deep", () => {
    const source = Array.from(
      { length: 10 },
      (_, depth) => `${"  ".repeat(depth)}- level ${depth + 1}`
    ).join("\n");
    const html = draw(source);
    expect(html.match(/<ul\b/gu)).toHaveLength(10);
    expect(textOf(html)).toContain("level 10");
  });

  test("a short comment and a declaration stay words where they are", () => {
    const html = draw(
      "Before <!-- a note --> after.\n\n<!DOCTYPE html>\n\nEnd."
    );
    expect(textOf(html)).toContain("Before &lt;!-- a note --&gt; after.");
    expect(textOf(html)).toContain("&lt;!DOCTYPE html&gt;");
  });

  // Each took seconds before the bounds (brackets of 100 KB took 25). Time as the machine is busy
  // is not steady, so what is held is the growth: an eighth of the size takes about an eighth of
  // the time, where the parser's work had grown as its square. The paragraphs are 80 KB against
  // 10 KB, both past the bound; scripts/markdown-parse.test.ts weighs every kind of paragraph and
  // of block as it is read, and these the kinds whose drawing or whose repair while written had
  // work of its own.
  test.each([
    ["brackets", (n: number) => `${"[".repeat(n)}a${"](b)".repeat(n)}`, 16_000],
    ["stars", (n: number) => "*a".repeat(n), 40_000],
    [
      "a bracket left open before words",
      (n: number) => `[${"word ".repeat(n)}`,
      16_000,
    ],
    ["comments left open", (n: number) => "a <!-- ".repeat(n), 11_200],
    [
      "sections left open, 1,600 deep",
      (n: number) => "<details>\n<summary>s</summary>\n\nx\n\n".repeat(n),
      1600,
    ],
    [
      "sections closed, 1,600 deep",
      (n: number) =>
        `${"<details>\n<summary>s</summary>\n\n".repeat(n)}${"</details>\n\n".repeat(n)}`,
      1600,
    ],
    // Both past the budget of lines: the list's first 2,828 items are drawn as one, the rest as lines.
    ["a list of 24,000 items", (n: number) => "- a\n".repeat(n), 24_000],
    [
      "lists of fifty items, a paragraph between",
      (n: number) => `${"- a\n".repeat(50)}\nBetween.\n\n`.repeat(n),
      160,
    ],
  ])(
    "%s takes time in step with its length, written and while written",
    (_, make, size) => {
      for (const streaming of [false, true]) {
        const eighth = make(size / 8);
        const whole = make(size);
        const growth = growthOf(
          () => draw(eighth, { streaming }),
          () => draw(whole, { streaming })
        );
        // Eight times the text: in step is 8, the square is 64. 24 is near their midpoint as a
        // factor (three times the one, a third of the other).
        expect(growth).toBeLessThan(24);
      }
    },
    SLOW_TEST
  );
});

describe("an answer longer than one piece", () => {
  test("a list of 2,000 items is one list, and an ordered one counts on from its start", () => {
    const items = Array.from({ length: 2000 }, (_, at) => `item ${at}`);
    const bullets = draw(items.map((item) => `- ${item}`).join("\n"));
    expect(bullets.match(/<ul\b/gu)).toHaveLength(1);
    expect(bullets.match(/<li\b/gu)).toHaveLength(2000);
    const numbered = draw(
      items.map((item, at) => `${at + 5}. ${item}`).join("\n")
    );
    expect(numbered.match(/<ol\b[^>]*>/gu)).toStrictEqual([
      expect.stringContaining('start="5"'),
    ]);
    expect(numbered.match(/<li\b/gu)).toHaveLength(2000);
    expect(textOf(numbered)).toContain("item 1999");
  });

  test("its marks are read to its end, and a link defined at its end leads there from its start", () => {
    const paragraphs = Array.from(
      { length: 2500 },
      (_, at) =>
        `Paragraph ${at} of **the report**, with words enough to fill its line.`
    );
    const html = draw(
      [
        "See [the source][source] first.",
        ...paragraphs,
        "And [the last link](https://example.com/last).",
        "[source]: https://example.com/source",
      ].join("\n\n")
    );
    expect(html.length).toBeGreaterThan(150_000);
    expect(anchors(html)).toStrictEqual([
      "https://example.com/source",
      "https://example.com/last",
    ]);
    expect(html.match(/<strong\b/gu)).toHaveLength(2500);
  });
});

describe("footnotes", () => {
  test("each reference has its own id, and the note leads back to the first", () => {
    const html = draw("One[^1] and two[^1].\n\n- three[^1]\n\n[^1]: The note.");
    const ids = [...html.matchAll(/id="(?<id>[^"]*-ref-[^"]*)"/gu)].map(
      (match) => match.groups?.id
    );
    expect(ids.map((id) => id?.replace(/^.*-ref-/u, ""))).toStrictEqual([
      "1-1",
      "1-2",
      "1-3",
    ]);
    expect(html).toContain(`href="#${ids[0] ?? ""}"`);
  });
});
