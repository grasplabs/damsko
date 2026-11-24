// @vitest-environment happy-dom
// Markdown streamed in the browser with its pace and its fade on (pace.ts, reveal.tsx): the words a
// frame lets out are a prefix of what has arrived, drawn as the answer will be, their words fading
// in, and only the block being written drawn again. That adds what the server test cannot see:
// state kept from frame to frame. The answers of every form an address takes
// (scripts/markdown-addresses.ts) are streamed into one Markdown a character a frame and then
// ended: no part is ever handed an address the finished answer does not have, no link leads where
// it does not, and nothing shown is taken back. And its ends: the last words fade in to their end
// after the stream has, a stream stopped part way ends tidied, and an answer taken off the page
// part way leaves no frame or timer behind.
//
//   pnpm exec vp test scripts/markdown-paced.test.tsx
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, test, vi } from "vitest";

import { Markdown } from "../src/components/markdown/index.ts";
import type { MarkdownLinkRenderer } from "../src/components/markdown/index.ts";
import { addressAnswers, isWithin } from "./markdown-addresses.ts";
import { frames, onFakeFrames, settle } from "./markdown-frames.ts";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

onFakeFrames();

/** Where every link drawn leads. */
const linksIn = (container: Element) =>
  [...container.querySelectorAll("a")].map((link) => link.getAttribute("href"));

/**
 * `answer` streamed a character a frame, then ended: what the host was handed, where the links led
 * and the words shown at each frame, and how many words faded in as spans.
 */
const streamed = (answer: string) => {
  const container = document.createElement("div");
  const root = createRoot(container);
  const handed = new Set<string>();
  // One renderer for the whole stream, as a page has: the finished blocks are drawn once.
  const hand: MarkdownLinkRenderer = (link) => {
    handed.add(`${link.type} ${link.href}`);
  };
  const seen: { text: string; links: (string | null)[] }[] = [];
  let spans = 0;
  const look = () => {
    spans += container.querySelectorAll("[data-at]").length;
    seen.push({
      text: container.textContent ?? "",
      links: linksIn(container),
    });
  };
  for (let at = 1; at <= answer.length; at += 1) {
    act(() => {
      root.render(
        <Markdown streaming renderLink={hand}>
          {answer.slice(0, at)}
        </Markdown>
      );
    });
    look();
    frames();
    look();
  }
  act(() => {
    root.render(<Markdown renderLink={hand}>{answer}</Markdown>);
  });
  look();
  settle(container);
  look();
  act(() => {
    root.unmount();
  });
  return { handed, seen, spans };
};

/** `answer` drawn whole: what the host is handed and where the links lead. */
const whole = (answer: string) => {
  const container = document.createElement("div");
  const root = createRoot(container);
  const handed = new Set<string>();
  act(() => {
    root.render(
      <Markdown
        renderLink={(link) => {
          handed.add(`${link.type} ${link.href}`);
        }}
      >
        {answer}
      </Markdown>
    );
  });
  const links = linksIn(container);
  act(() => {
    root.unmount();
  });
  return { handed, links };
};

describe("streamed with the pace and the fade on", () => {
  test("every address handed on is one the finished answer has, and what was shown stays", () => {
    const answers = addressAnswers();
    expect(answers.size).toBe(706);
    const found: string[] = [];
    let spans = 0;
    for (const answer of answers) {
      const end = whole(answer);
      const stream = streamed(answer);
      spans += stream.spans;
      const where = JSON.stringify(answer);
      for (const handed of stream.handed) {
        if (!end.handed.has(handed)) {
          found.push(`${where} handed ${handed}`);
        }
      }
      for (const [index, { text, links }] of stream.seen.entries()) {
        for (const link of links) {
          if (!end.links.includes(link)) {
            found.push(`${where} leads to ${String(link)}`);
          }
        }
        const before = stream.seen[index - 1];
        if (
          before !== undefined &&
          (!isWithin(before.text.trimEnd(), text) ||
            before.links.some((link, at) => links[at] !== link))
        ) {
          found.push(`${where} took back ${before.text}`);
        }
      }
      expect(stream.seen.at(-1)?.links).toStrictEqual(end.links);
    }
    expect(found).toStrictEqual([]);
    // The words came at the pace, fading in: spans were drawn.
    expect(spans).toBeGreaterThan(answers.size);
  }, 600_000);
});

const answer =
  "## Results\n\nSupport closed **58 requests** and Sales closed 33, so the queue is the shortest since March. See [the report](https://example.com/r) for the rest.";

/** A Markdown in a page of its own, `answer` streamed into it 24 characters a frame up to `upTo`. */
const writtenUpTo = (upTo: number) => {
  const container = document.createElement("div");
  const root = createRoot(container);
  for (let at = 24; at < upTo; at += 24) {
    act(() => {
      root.render(<Markdown streaming>{answer.slice(0, at)}</Markdown>);
    });
    frames();
  }
  act(() => {
    root.render(<Markdown streaming>{answer.slice(0, upTo)}</Markdown>);
  });
  frames();
  return { container, root };
};

/**
 * An element's HTML without its classes: an answer written here keeps the look it had as it came
 * (its lines break where they fill), and only that differs by design.
 */
const unclassed = (container: Element) =>
  container.innerHTML.replaceAll(/ class="[^"]*"/gu, "");

/** What `answer` up to `upTo` draws at once, as a page opened again draws it. */
const drawnWhole = (upTo: number, truncated = false) => {
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() => {
    root.render(
      <Markdown animated={false} truncated={truncated}>
        {answer.slice(0, upTo)}
      </Markdown>
    );
  });
  const html = unclassed(container);
  act(() => {
    root.unmount();
  });
  return html;
};

describe("the ends of a stream, with the pace and the fade on", () => {
  test("the last words are still fading in when the answer is whole, then it is text", () => {
    const { container, root } = writtenUpTo(answer.length);
    act(() => {
      root.render(<Markdown>{answer}</Markdown>);
    });
    // Let the rest run out, frame by frame, to the frame the answer is whole.
    let count = 0;
    while (container.querySelector("[aria-busy=true]") !== null && count < 60) {
      frames();
      count += 1;
    }
    expect(container.querySelector("[aria-busy=true]")).toBeNull();
    expect(container.querySelectorAll("[data-at]").length).toBeGreaterThan(0);
    settle(container);
    expect(container.querySelectorAll("[data-at]")).toHaveLength(0);
    expect(unclassed(container)).toBe(drawnWhole(answer.length));
    act(() => {
      root.unmount();
    });
  });

  test("stopped part way, what had come runs out and the answer ends tidied, with nothing left running", () => {
    // Cut inside the bold, which a stopped answer closes.
    const upTo = answer.indexOf("requests") + 3;
    const { container, root } = writtenUpTo(upTo);
    act(() => {
      root.render(<Markdown truncated>{answer.slice(0, upTo)}</Markdown>);
    });
    settle(container);
    expect(unclassed(container)).toBe(drawnWhole(upTo, true));
    expect(vi.getTimerCount()).toBe(0);
    act(() => {
      root.unmount();
    });
  });

  test("a stream turned on with its first words, in one render, lets them fade in; what was there already stays", () => {
    const container = document.createElement("div");
    const root = createRoot(container);
    const first = "Support closed **58 requests** and Sales closed 33. ";
    act(() => {
      root.render(<Markdown>{first.slice(0, 0)}</Markdown>);
    });
    // As a chat's status turns to streaming with the first chunk it brings.
    act(() => {
      root.render(<Markdown streaming>{first}</Markdown>);
    });
    expect(container.textContent).not.toContain("Sales closed 33");
    frames(4);
    expect(container.querySelectorAll("[data-at]").length).toBeGreaterThan(0);
    act(() => {
      root.render(<Markdown>{first}</Markdown>);
    });
    settle(container);
    expect(container.textContent).toBe(
      "Support closed 58 requests and Sales closed 33."
    );
    // Given first and turned on after, the words are no news.
    act(() => {
      root.render(<Markdown>{`${first}More.`}</Markdown>);
    });
    act(() => {
      root.render(<Markdown streaming>{`${first}More.`}</Markdown>);
    });
    expect(container.textContent).toContain("More.");
    expect(container.querySelectorAll("[data-at]")).toHaveLength(0);
    act(() => {
      root.unmount();
    });
  });

  test("taken off the page while its words fade in, it leaves no frame or timer", () => {
    const { container, root } = writtenUpTo(80);
    expect(container.querySelectorAll("[data-at]").length).toBeGreaterThan(0);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    act(() => {
      root.unmount();
    });
    expect(vi.getTimerCount()).toBe(0);
  });
});
