// How Terminal reads a program's output (src/components/terminal-ansi.ts): SGR colours and marks
// become runs with a look, every other escape sequence is taken out, and a hostile text costs no
// more than a long one.
import { describe, expect, test } from "vitest";

import { parseAnsi, plainText } from "../src/components/terminal-ansi.ts";

const ESC = "\u001B";

/** The runs as text and the look's key, to read at a glance. */
const runs = (input: string) =>
  parseAnsi(input).map((span) => [span.text, span.key]);

describe("colours and marks", () => {
  test("plain text is one plain run", () => {
    expect(runs("hello world")).toStrictEqual([["hello world", ""]]);
  });

  test("the 16 foreground and background colours", () => {
    expect(runs(`${ESC}[31mred${ESC}[92mlime${ESC}[0m`)).toStrictEqual([
      ["red", "fg-red"],
      ["lime", "fg-brightGreen"],
    ]);
    expect(runs(`${ESC}[44mon blue${ESC}[103mon yellow`)).toStrictEqual([
      ["on blue", "bg-blue"],
      ["on yellow", "bg-brightYellow"],
    ]);
  });

  test("bold, dim, italic and underline, and each turned off", () => {
    expect(
      runs(`${ESC}[1;3;4mall${ESC}[22mno weight${ESC}[23;24mnone`)
    ).toStrictEqual([
      ["all", "bold italic underline"],
      ["no weight", "italic underline"],
      ["none", ""],
    ]);
    expect(runs(`${ESC}[2mquiet`)).toStrictEqual([["quiet", "dim"]]);
  });

  test("a reset, written as 0 or as nothing, and the default colours", () => {
    expect(runs(`${ESC}[1;31ma${ESC}[mb`)).toStrictEqual([
      ["a", "fg-red bold"],
      ["b", ""],
    ]);
    expect(runs(`${ESC}[31;42ma${ESC}[39mb${ESC}[49mc`)).toStrictEqual([
      ["a", "fg-red bg-green"],
      ["b", "bg-green"],
      ["c", ""],
    ]);
  });

  test("256 colours come to the nearest of the 16", () => {
    expect(runs(`${ESC}[38;5;196mx`)).toStrictEqual([["x", "fg-brightRed"]]);
    expect(runs(`${ESC}[38;5;2mx`)).toStrictEqual([["x", "fg-green"]]);
    expect(runs(`${ESC}[48;5;231mx`)).toStrictEqual([["x", "bg-brightWhite"]]);
    expect(runs(`${ESC}[38;5;244mx`)).toStrictEqual([["x", "fg-brightBlack"]]);
  });

  test("truecolour and the colon forms come to the nearest of the 16", () => {
    expect(runs(`${ESC}[38;2;0;0;230mx`)).toStrictEqual([["x", "fg-blue"]]);
    expect(runs(`${ESC}[38:2::250:250:0mx`)).toStrictEqual([
      ["x", "fg-brightYellow"],
    ]);
    expect(runs(`${ESC}[38:5:6mx`)).toStrictEqual([["x", "fg-cyan"]]);
  });

  test("an extended colour cut short changes nothing and breaks nothing after it", () => {
    expect(runs(`${ESC}[38;5mx`)).toStrictEqual([["x", ""]]);
    expect(runs(`${ESC}[38;2;10mx`)).toStrictEqual([["x", ""]]);
  });

  test("runs of the same look are one run", () => {
    expect(runs(`${ESC}[31ma${ESC}[31mb`)).toStrictEqual([["ab", "fg-red"]]);
  });
});

describe("what is taken out", () => {
  test("cursor moves, clearing and other CSI sequences", () => {
    expect(plainText(`a${ESC}[2Jb${ESC}[10;20Hc${ESC}[?25ld`)).toBe("abcd");
  });

  test("a title and an OSC 8 hyperlink, keeping the link's words", () => {
    expect(plainText(`${ESC}]0;my title\u0007ready`)).toBe("ready");
    expect(
      plainText(
        `see ${ESC}]8;;https://example.com${ESC}\\the docs${ESC}]8;;${ESC}\\ now`
      )
    ).toBe("see the docs now");
  });

  test("DCS and APC strings, a charset switch and a lone escape", () => {
    expect(plainText(`a${ESC}Pq#0;1${ESC}\\b${ESC}_hidden${ESC}\\c`)).toBe(
      "abc"
    );
    expect(plainText(`a${ESC}(Bb${ESC}7c${ESC}`)).toBe("abc");
  });

  test("the bell, a backspace and other control characters; a tab and a newline stay", () => {
    expect(plainText("a\u0007b\u0008c\u0000d\te\nf")).toBe("abcd\te\nf");
  });

  test("C1 forms of CSI and OSC", () => {
    expect(runs("\u009B31mred")).toStrictEqual([["red", "fg-red"]]);
    expect(plainText("a\u009D0;title\u0007b")).toBe("ab");
  });

  test("an unterminated sequence is taken out, never shown", () => {
    expect(plainText(`done${ESC}[31`)).toBe("done");
    expect(plainText(`done${ESC}]8;;https://example.com`)).toBe("done");
  });

  test("a string sequence never ended hides only the rest of its line, and at most 4,096 characters", () => {
    expect(plainText(`a${ESC}]0;title\nthe output after it`)).toBe(
      "a\nthe output after it"
    );
    expect(plainText(`a\u009D0;title\nb`)).toBe("a\nb");
    expect(plainText(`a${ESC}]0;title${ESC}[31mred`)).toBe("ared");
    const long = "x".repeat(5000);
    // The body, "0;" and the 5,000: the first 4,096 characters of it are the sequence's.
    expect(plainText(`${ESC}]0;${long}`)).toBe("x".repeat(5002 - 4096));
  });

  test("a CSI broken by a character that cannot be in it ends there, and the rest is text", () => {
    expect(plainText(`${ESC}[31\nnext`)).toBe("\nnext");
  });

  test("HTML in the output is text, as written", () => {
    expect(plainText("<img src=x onerror=alert(1)>")).toBe(
      "<img src=x onerror=alert(1)>"
    );
  });
});

describe("lines", () => {
  test("a carriage return starts its line again once new words come", () => {
    expect(plainText("10%\r50%\r100%\ndone")).toBe("100%\ndone");
    expect(plainText("first\nworking\r")).toBe("first\nworking");
    expect(plainText("a\r\nb")).toBe("a\nb");
  });

  test("a redrawn line keeps the lines before it and their looks", () => {
    expect(runs(`${ESC}[32mok${ESC}[0m\n${ESC}[33m1/3\r2/3`)).toStrictEqual([
      ["ok", "fg-green"],
      ["\n", ""],
      ["2/3", "fg-yellow"],
    ]);
  });
});

/** Runs `run` and holds it to `budget` milliseconds. */
const within = (budget: number, run: () => void) => {
  const start = performance.now();
  run();
  expect(performance.now() - start).toBeLessThan(budget);
};

describe("hostile input", () => {
  test("a very long line is read in one pass", () => {
    const line = `${ESC}[31m${"x".repeat(2_000_000)}`;
    within(500, () => {
      expect(plainText(line)).toHaveLength(2_000_000);
    });
  });

  test("thousands of escapes, open sequences and changes of look", () => {
    within(1000, () => {
      expect(plainText(`${ESC}[`.repeat(200_000))).toBe("");
    });
    within(1000, () => {
      expect(plainText(`${ESC}]8;;`.repeat(200_000))).toBe("");
    });
    within(1000, () => {
      expect(parseAnsi(`${ESC}[31ma${ESC}[32mb`.repeat(100_000))).toHaveLength(
        200_000
      );
    });
    within(1000, () => {
      expect(plainText(`${ESC}[${"1;".repeat(500_000)}m`)).toBe("");
    });
  });

  test("a sequence of a thousand numbers reads only its first ones", () => {
    expect(runs(`${ESC}[${"0;".repeat(40)}31mx`)).toStrictEqual([["x", ""]]);
  });

  test("carriage returns by the thousand", () => {
    within(1000, () => {
      expect(plainText("x\r".repeat(500_000))).toBe("x");
    });
  });
});
