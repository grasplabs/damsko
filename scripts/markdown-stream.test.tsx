// @vitest-environment happy-dom
// Markdown while it streams, in a DOM: an answer streamed into one Markdown a chunk at a time, then
// ended, draws what the whole answer draws (classes aside: what was written here keeps its look),
// and once it is gone mid-stream nothing is left running.
//
//   pnpm exec vp test scripts/markdown-stream.test.tsx
import { setTimeout as sleep } from "node:timers/promises";

import { act } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, test, vi } from "vitest";

import { Markdown } from "../src/components/markdown/index.ts";
import { Message, MessageResponse } from "../src/components/message.tsx";
import { isRecord, readJson } from "./json.ts";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const fixture = readJson(
  `${import.meta.dirname}/fixtures/markdown-answers.json`
);
const list =
  isRecord(fixture) && Array.isArray(fixture.answers) ? fixture.answers : [];
const answers = list.flatMap((item: unknown) =>
  isRecord(item) && Array.isArray(item.lines)
    ? [{ name: String(item.name), text: item.lines.join("\n") }]
    : []
);

/** An element as a string, its attributes in name order (React's ids as `ID`), its classes left out. */
const shapeOf = (node: Node): string => {
  if (!(node instanceof Element)) {
    return node.textContent ?? "";
  }
  const attributes = [...node.attributes]
    .filter((attribute) => attribute.name !== "class")
    .map(
      ({ name, value }) => `${name}="${value.replaceAll(/_r_\w+_/gu, "ID")}"`
    )
    .toSorted();
  const children = [...node.childNodes].map(shapeOf).join("");
  return `<${[node.localName, ...attributes].join(" ")}>${children}</${node.localName}>`;
};

/** The last words shown, code left out. */
const wordsEnd = (box: Element) => {
  const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
  let words = "";
  for (let text = walker.nextNode(); text; text = walker.nextNode()) {
    words += text.parentElement?.closest("code")
      ? " "
      : (text.textContent ?? "");
  }
  return words.trimEnd().slice(-20);
};

// The start of a block's mark shown as words, the next characters still to decide it: a line of a
// paragraph or a heading, or a later line of an item or a cell; an empty heading.
const RAW = /(?:^|\n)[ \t]*(?:[-*+#=_<]+|\d{1,9}[.)]?|<\/?[a-z]*)$/u;
const RAW_LATER = /\n[ \t]*(?:[-*+#=_<]+|\d{1,9}[.)]?|<\/?[a-z]*)$/u;
/** Whether the last block of words drawn ends in the start of a block's mark, code left out. */
const rawStart = (box: Element) => {
  const blocks = [
    ...box.querySelectorAll("p, li, h1, h2, h3, h4, h5, h6, td, th"),
  ].filter((block) => block.closest("[data-slot=code-block]") === null);
  const last = blocks.at(-1);
  // Words in a mark of their own (`**1.**`) are words.
  const walker = document.createTreeWalker(last ?? box, NodeFilter.SHOW_TEXT);
  let end: Node | null = null;
  for (let text = walker.nextNode(); text; text = walker.nextNode()) {
    end = text;
  }
  if (end?.parentElement?.closest("strong, em, del, a, code, sup")) {
    return false;
  }
  const text = last?.textContent ?? "x";
  return (
    (last?.matches("li, td, th") === true ? RAW_LATER : RAW).test(text) ||
    (last?.matches("h1, h2, h3, h4, h5, h6") === true && text === "")
  );
};

/** Draws into a root of its own, and gives back the root's shape after each `step`. */
const live = () => {
  const box = document.createElement("div");
  const root = createRoot(box);
  return {
    box,
    root,
    render: (element: ReactNode) => {
      act(() => {
        root.render(element);
      });
      return shapeOf(box);
    },
  };
};

describe("a stream that ends draws what the whole answer draws, and no raw mark shows on the way", () => {
  test.each([1, 7, 64])(
    "every sample answer, in chunks of %i characters",
    (chunk) => {
      // A clock that stands still: every chunk is read as it comes (no read takes any time), so
      // what is drawn is what that chunk draws.
      vi.useFakeTimers({ toFake: ["performance"] });
      const marks: string[] = [];
      const differing = answers.filter(({ text }) => {
        const whole = live();
        const streamed = live();
        for (let at = chunk; at < text.length; at += chunk) {
          streamed.render(<Markdown streaming>{text.slice(0, at)}</Markdown>);
          const end = wordsEnd(streamed.box);
          // A bracket the source ends in, still to be a link, drawn as it is.
          const pair = /\[[^\]\n]*\]$/u.exec(text.slice(0, at))?.[0];
          const bracket = pair !== undefined && end.endsWith(pair);
          if (/[*_~`]$/u.test(end) || bracket || rawStart(streamed.box)) {
            marks.push(`${at}: …${end}`);
          }
        }
        const same =
          streamed.render(<Markdown>{text}</Markdown>) ===
          whole.render(<Markdown>{text}</Markdown>);
        act(() => {
          whole.root.unmount();
          streamed.root.unmount();
        });
        return !same;
      });
      expect(differing.map(({ name }) => name)).toStrictEqual([]);
      vi.useRealTimers();
      // While written, no mark of emphasis or code, and no start of a block's mark, shows at the end.
      expect(marks).toStrictEqual([]);
      expect(answers.length).toBeGreaterThan(50);
    },
    600_000
  );
});

/**
 * The words shown, block by block, marks left out (`[`, `]`, `^`, `*`, `_`, `~`, backticks, a
 * note's mark as written or as a number, a reference's name as written), and what is no word of the answer: CodeBlock's header and
 * footer (its language, "Writing"), and Link's "(opens in a new tab)".
 */
const wordsOf = (box: Element) => {
  const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
  let words = "";
  let last: Element | null = null;
  for (let text = walker.nextNode(); text; text = walker.nextNode()) {
    const inside = text.parentElement;
    const chrome =
      inside?.closest("[data-slot=code-block]") !== null &&
      inside?.closest("pre, code") === null;
    const block =
      inside?.closest("p, li, td, th, h1, h2, h3, h4, h5, h6, pre, summary") ??
      null;
    if (!chrome && !inside?.closest("sup")) {
      words += `${block === last ? "" : " "}${text.textContent ?? ""}`;
      last = block;
    }
  }
  return words
    .replaceAll(
      / ?\(opens in a new tab\)|\[\^[^\]\s]*\]|\]\[[^\]]*\]|[[\]^*_~`]/gu,
      ""
    )
    .split(/\s+/u)
    .filter((word) => word !== "");
};
/** The first of `before`'s words that `after` lacks, in order (a word may have grown). */
const lost = (before: string[], after: string[]) => {
  let at = 0;
  return before.find((word) => {
    while (at < after.length && !(after[at] ?? "").startsWith(word)) {
      at += 1;
    }
    at += 1;
    return at > after.length;
  });
};

// A link's words before its `](`, and a reference's before its name is whole.
const brackets = [
  {
    name: "brackets",
    text: "Start [link wordy](https://example.com/w) now.\n\nRead [the guide][g] and more.\n\n[g]: https://example.com/g\n\nThen more.",
  },
];

describe("while written, words once shown stay shown", () => {
  test.each([1, 7])(
    "every sample answer, in chunks of %i characters: each chunk shows the words of the one before, in order",
    (chunk) => {
      vi.useFakeTimers({ toFake: ["performance"] });
      const wrong: string[] = [];
      for (const { name, text } of [...answers, ...brackets]) {
        const { box, root, render } = live();
        let before: string[] = [];
        for (let at = chunk; at < text.length; at += chunk) {
          render(<Markdown streaming>{text.slice(0, at)}</Markdown>);
          const now = wordsOf(box);
          const word = lost(before, now);
          if (word !== undefined) {
            wrong.push(`${name} @${at}: ${word} | …${text.slice(at - 30, at)}`);
          }
          before = now;
        }
        act(() => {
          root.unmount();
        });
      }
      vi.useRealTimers();
      expect(wrong).toStrictEqual([]);
    },
    600_000
  );
});

// A paragraph, list items, a table's cells and fenced code, no word in them longer than 32 characters.
const written = `What changed this week, team by team.

- Support closed the most requests.
- Sales has the fewest open.

| Team | Closed | Open |
| :-- | --: | --: |
| Support | 58 | 4 |
| Sales | 33 | 2 |

\`\`\`python
def closed(requests):
    return sum(1 for request in requests if request.closed_at)
\`\`\`

That is all.`;

describe("while written a character at a time, each word comes whole", () => {
  test("no word drawn in a paragraph, a list item, a table's cell or fenced code ever grows", () => {
    vi.useFakeTimers({ toFake: ["performance"] });
    const { box, root, render } = live();
    const seen = new Map<Element, string[]>();
    const grown: string[] = [];
    const places = new Set<string>();
    for (let at = 1; at < written.length; at += 1) {
      render(<Markdown streaming>{written.slice(0, at)}</Markdown>);
      for (const block of box.querySelectorAll(
        "p, li, td, [data-slot=code-block-line]"
      )) {
        const words = block.textContent.split(/\s+/u).filter(Boolean);
        const before = seen.get(block) ?? [];
        const changed = before.findIndex(
          (word, index) => words[index] !== word
        );
        if (changed !== -1) {
          grown.push(`${before[changed]} to ${words[changed]} @${at}`);
        }
        seen.set(block, words);
        if (words.length > 0) {
          places.add(block.localName);
        }
      }
    }
    act(() => {
      root.unmount();
    });
    vi.useRealTimers();
    expect(grown).toStrictEqual([]);
    expect([...places].toSorted()).toStrictEqual(["li", "p", "span", "td"]);
  });

  test("the word at the end shows once nothing more has come for a quarter second, and stays shown", () => {
    vi.useFakeTimers();
    const { box, root, render } = live();
    render(<Markdown streaming>Waiting on the supp</Markdown>);
    expect(box.textContent).toBe("Waiting on the");
    act(() => {
      vi.advanceTimersByTime(249);
    });
    expect(box.textContent).toBe("Waiting on the");
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(box.textContent).toBe("Waiting on the supp");
    // The rest of that word waits for its end in turn, so it grows once, not a letter at a time.
    render(<Markdown streaming>Waiting on the suppl</Markdown>);
    expect(box.textContent).toBe("Waiting on the supp");
    render(<Markdown streaming>Waiting on the supplier to</Markdown>);
    expect(box.textContent).toBe("Waiting on the supplier");
    act(() => {
      root.unmount();
    });
    vi.useRealTimers();
  });

  test("a run longer than 32 characters comes 32 at a time, past 256 as it comes, and nothing waits once it is written", () => {
    vi.useFakeTimers({ toFake: ["performance"] });
    const text = "a=1;b=2;".repeat(40);
    const { box, root, render } = live();
    const held: number[] = [];
    for (let at = 1; at <= text.length; at += 1) {
      render(<Markdown streaming>{text.slice(0, at)}</Markdown>);
      held.push(at - box.textContent.length);
    }
    render(<Markdown>{text}</Markdown>);
    expect(box.textContent).toBe(text);
    act(() => {
      root.unmount();
    });
    vi.useRealTimers();
    expect(Math.max(...held)).toBe(31);
    expect(held).toStrictEqual(
      held.map((_, at) => (at + 1 < 256 ? (at + 1) % 32 : 0))
    );
  });
});

describe("a block that takes long to read is read again as often as a fifth of the time allows", () => {
  test(
    "a small one at every chunk; a big one once four times its last read has passed, chunk or not",
    { timeout: 60_000 },
    async () => {
      const text = `${"words in a long line ".repeat(10)}\n`.repeat(1000);
      const { box, root, render } = live();
      const shown = (at: number) => {
        render(<Markdown streaming>{text.slice(0, at)}</Markdown>);
        return box.textContent.length;
      };
      expect(shown(100)).toBeLessThan(shown(140));
      shown(150_000);
      await act(async () => {
        await sleep(100);
      });
      const read = shown(150_040);
      expect(read).toBeGreaterThan(149_000);
      expect(shown(150_080)).toBe(read);
      // Without another chunk: once four times its read has passed, however long that read took.
      await vi.waitFor(
        async () => {
          await act(async () => {
            await sleep(50);
          });
          expect(box.textContent.length).toBeGreaterThan(read);
        },
        { timeout: 20_000, interval: 0 }
      );
      act(() => {
        root.unmount();
      });
    }
  );
});

describe("nothing runs on once it is gone", () => {
  test("unmounted mid-stream, every frame and timer it started comes to an end", () => {
    vi.useFakeTimers();
    const text = answers.map((answer) => answer.text).join("\n\n");
    const { root, render } = live();
    for (let at = 50; at < 4000; at += 50) {
      render(
        <>
          <Markdown streaming>{text.slice(0, at)}</Markdown>
          <Message aria-label="Assistant" status="streaming">
            <MessageResponse>{text.slice(0, at)}</MessageResponse>
          </Message>
        </>
      );
      act(() => {
        vi.advanceTimersByTime(16);
      });
    }
    act(() => {
      root.unmount();
    });
    // What it started comes to an end: the page's live region says what was left to say, a message
    // at a time, and CodeBlock's worker is stopped a second after the last block has gone.
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });
});
