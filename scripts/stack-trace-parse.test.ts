// How StackTrace reads an error's stack (src/components/stack-trace-parse.ts): the type, the
// message and the frames from V8's form and from Firefox's and Safari's, and a hostile stack costs
// no more than a long one.
import { describe, expect, test } from "vitest";

import { parseStackTrace } from "../src/components/stack-trace-parse.ts";

/** Each frame as its function, file, line and column, to read at a glance. */
const partsOf = (trace: string) =>
  parseStackTrace(trace).frames.map((frame) => [
    frame.functionName,
    frame.filePath,
    frame.lineNumber,
    frame.columnNumber,
  ]);

/** Runs `run` and holds it to `budget` milliseconds. */
const within = (budget: number, run: () => void) => {
  const start = performance.now();
  run();
  expect(performance.now() - start).toBeLessThan(budget);
};

describe("the error", () => {
  test("its type and its message", () => {
    const parsed = parseStackTrace(
      "TypeError: Cannot read properties of undefined (reading 'map')\n    at run (src/app.ts:3:9)"
    );
    expect(parsed.errorType).toBe("TypeError");
    expect(parsed.errorMessage).toBe(
      "Cannot read properties of undefined (reading 'map')"
    );
  });

  test("a namespaced type, a code in brackets and an uncaught error", () => {
    expect(parseStackTrace("DOMException: aborted").errorType).toBe(
      "DOMException"
    );
    expect(
      parseStackTrace("Error [ERR_ASSERTION]: values differ").errorType
    ).toBe("Error");
    expect(parseStackTrace("Uncaught RangeError: too deep").errorType).toBe(
      "RangeError"
    );
    expect(parseStackTrace("Prisma.ValidationError: bad").errorType).toBe(
      "Prisma.ValidationError"
    );
  });

  test("a message over several lines, up to the first frame", () => {
    const parsed = parseStackTrace(
      "AssertionError: expected 1 to be 2\n\n- expected\n+ received\n    at test (a.test.ts:4:5)"
    );
    expect(parsed.errorMessage).toBe(
      "expected 1 to be 2\n- expected\n+ received"
    );
  });

  test("a first line that names no type is all message", () => {
    const parsed = parseStackTrace("Something broke: the disk is full");
    expect(parsed.errorType).toBeNull();
    expect(parsed.errorMessage).toBe("Something broke: the disk is full");
    expect(parsed.frames).toStrictEqual([]);
  });

  test("an empty stack, and one of frames only", () => {
    expect(parseStackTrace("")).toStrictEqual({
      errorType: null,
      errorMessage: "",
      frames: [],
    });
    expect(parseStackTrace("run@src/app.js:3:9").errorMessage).toBe("");
  });
});

describe("V8's frames", () => {
  test("a function and its place, and a place alone", () => {
    expect(
      partsOf(
        "Error: x\n    at UserList (app/components/user-list.tsx:15:23)\n    at app/main.ts:4:1"
      )
    ).toStrictEqual([
      ["UserList", "app/components/user-list.tsx", 15, 23],
      [null, "app/main.ts", 4, 1],
    ]);
  });

  test("new, async, a method on Object, a URL and a Windows path", () => {
    expect(
      partsOf(
        [
          "Error: x",
          "    at new Store (src/store.ts:8:11)",
          "    at async Promise.all (index 0)",
          "    at Object.<anonymous> (src/a.test.ts:31:18)",
          "    at load (https://example.com/assets/app.js:1:2048)",
          String.raw`    at run (C:\work\app\src\run.ts:2:3)`,
        ].join("\n")
      )
    ).toStrictEqual([
      ["new Store", "src/store.ts", 8, 11],
      ["async Promise.all", "index 0", null, null],
      ["Object.<anonymous>", "src/a.test.ts", 31, 18],
      ["load", "https://example.com/assets/app.js", 1, 2048],
      ["run", String.raw`C:\work\app\src\run.ts`, 2, 3],
    ]);
  });

  test("an eval's frame names its function and no file to open", () => {
    expect(
      partsOf(
        "Error: x\n    at eval (eval at compile (src/c.ts:1:2), <anonymous>:1:1)"
      )
    ).toStrictEqual([["eval", null, null, null]]);
  });

  test("dependencies and the runtime are internal; the product's code is not", () => {
    const { frames } = parseStackTrace(
      [
        "Error: x",
        "    at seedUsers (prisma/seed.ts:27:34)",
        "    at Module._compile (node:internal/modules/cjs/loader:1554:14)",
        "    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:14985:18)",
      ].join("\n")
    );
    expect(frames.map((frame) => frame.isInternal)).toStrictEqual([
      false,
      true,
      true,
    ]);
  });

  test("lines after the frames that are not frames are left out", () => {
    expect(
      partsOf(
        "Error: x\n    at a (a.ts:1:1)\n    ... 4 more\n    at b (b.ts:2:2)"
      )
    ).toStrictEqual([
      ["a", "a.ts", 1, 1],
      ["b", "b.ts", 2, 2],
    ]);
  });
});

describe("Firefox's and Safari's frames", () => {
  test("a function at its place, an anonymous one, and native code", () => {
    expect(
      partsOf(
        [
          "formatInvoice@https://example.com/app.js:42:31",
          "InvoiceRow/<@https://example.com/app.js:18:12",
          "@https://example.com/app.js:1:1",
          "forEach@[native code]",
          "[native code]",
        ].join("\n")
      )
    ).toStrictEqual([
      ["formatInvoice", "https://example.com/app.js", 42, 31],
      ["InvoiceRow/<", "https://example.com/app.js", 18, 12],
      [null, "https://example.com/app.js", 1, 1],
      ["forEach", "[native code]", null, null],
      [null, null, null, null],
    ]);
  });

  test("an email in the message is not a frame", () => {
    const parsed = parseStackTrace(
      "Error: no account for ada@example.com\n    at find (src/users.ts:9:2)"
    );
    expect(parsed.errorMessage).toBe("no account for ada@example.com");
    expect(parsed.frames).toHaveLength(1);
  });
});

describe("hostile input", () => {
  test("a stack of a million frames keeps the first ones, quickly", () => {
    const stack = `Error: x\n${"    at f (a.ts:1:1)\n".repeat(1_000_000)}`;
    within(500, () => {
      expect(parseStackTrace(stack).frames).toHaveLength(200);
    });
  });

  test("a line of a million characters is read in one pass", () => {
    within(500, () => {
      const { frames } = parseStackTrace(
        `Error: x\n    at ${"(".repeat(1_000_000)}`
      );
      expect(frames.length).toBeLessThanOrEqual(1);
    });
    within(500, () => {
      expect(
        parseStackTrace(`${"A".repeat(1_000_000)}Error: x`).errorType
      ).toBeNull();
    });
  });

  test("colons and digits by the thousand", () => {
    within(500, () => {
      expect(
        parseStackTrace(`Error: x\n    at f (${":1".repeat(900)}x)`).frames
      ).toHaveLength(1);
      expect(parseStackTrace(`f@${"1:".repeat(900)}`).frames).toHaveLength(0);
    });
  });

  test("HTML in a stack is text, as written", () => {
    expect(
      parseStackTrace("Error: <img src=x onerror=alert(1)>").errorMessage
    ).toBe("<img src=x onerror=alert(1)>");
  });
});
