// The foundation's logic (src/lib, src/hooks), through its own interface. What needs a browser (the
// live region, focus given back, the focus watcher) is left to the components' specs.
//   pnpm test scripts/lib.test.tsx
import { createRef, isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";

import { useAction } from "../src/hooks/use-action";
import { useCopy } from "../src/hooks/use-copy";
import { I18nProvider, useI18n, useLocale } from "../src/lib/i18n";
import { durations } from "../src/lib/tokens.values";
import {
  assignRef,
  citedSource,
  isBlank,
  isInvalid,
  ownValue,
  safeHref,
  safeMediaSrc,
  slotProps,
  slotWords,
} from "../src/lib/utils";

// A script link's scheme, written so no lint takes the test's own strings for one.
const JS = ["java", "script"].join("");

describe(safeHref, () => {
  test("http, https and mailto lead where they say", () => {
    expect(safeHref("https://example.com/a?b=1")).toBe(
      "https://example.com/a?b=1"
    );
    expect(safeHref("HTTP://Example.com")).toBe("http://example.com/");
    expect(safeHref("mailto:noor@example.com")).toBe("mailto:noor@example.com");
  });

  test("every other scheme, a relative path or nothing leads nowhere", () => {
    const led = [
      `${JS}:alert(1)`,
      `${JS.toUpperCase()}:alert(1)`,
      " javascript:alert(1)",
      "\u0001javascript:alert(1)",
      "java\tscript:alert(1)",
      "data:text/html,<b>x</b>",
      "data:image/png;base64,iVBORw0KGgo=",
      "vbscript:msgbox",
      "file:///etc/passwd",
      "blob:https://example.com/1",
      "/settings",
      "../up",
      "#section",
      "",
      undefined,
    ].filter((url) => safeHref(url) !== null);
    expect(led).toStrictEqual([]);
  });
});

describe("safeHref, relative", () => {
  test("a path on the same site leads there as written", () => {
    expect(safeHref("/files/churn-q3", { relative: true })).toBe(
      "/files/churn-q3"
    );
    expect(safeHref("report.pdf#p2", { relative: true })).toBe("report.pdf#p2");
  });

  test("an address that leaves the site, or by another scheme, leads nowhere", () => {
    const led = [
      `${JS}:alert(1)`,
      "java\tscript:alert(1)",
      "data:text/html,<b>x</b>",
      "vbscript:msgbox",
      "//elsewhere.example",
      " //elsewhere.example",
      "/\\elsewhere.example",
      "\\\\elsewhere.example",
    ].filter((url) => safeHref(url, { relative: true }) !== null);
    expect(led).toStrictEqual([]);
  });
});

describe(citedSource, () => {
  test("a web address shows its host, without www", () => {
    expect(citedSource("https://www.example.com/guide?page=2")).toStrictEqual({
      href: "https://www.example.com/guide?page=2",
      host: "example.com",
    });
    expect(citedSource("http://docs.example.org")).toStrictEqual({
      href: "http://docs.example.org/",
      host: "docs.example.org",
    });
  });

  test("a mail address shows the address", () => {
    expect(citedSource("mailto:team@example.com")).toStrictEqual({
      href: "mailto:team@example.com",
      host: "team@example.com",
    });
  });

  test.each([
    ["a script, a tab inside its scheme", "java\tscript:alert(1)"],
    ["data", "data:text/html,<b>hi</b>"],
    ["a path", "/docs/guide"],
    ["another site's path", "//elsewhere.example"],
    ["words", "not an address"],
    ["nothing", ""],
    ["no address", undefined],
  ])("%s leads nowhere", (_, url) => {
    expect(citedSource(url)).toBeNull();
  });

  test("a look-alike host is shown as the browser reads it", () => {
    expect(citedSource("https://example.com@evil.example/")?.host).toBe(
      "evil.example"
    );
  });
});

describe(safeMediaSrc, () => {
  test("media written into the address, a file the page made and a path on this site load", () => {
    const loads = [
      "data:image/png;base64,iVBORw0KGgo=",
      "data:image/jpeg;base64,/9j/4AAQ",
      "data:image/webp;base64,UklGR",
      "data:image/avif;base64,AAAA",
      "data:image/gif;base64,R0lGOD",
      "data:audio/mpeg;base64,AAAA",
      "data:video/mp4;base64,AAAA",
      "blob:https://app.example.com/5c1e2d3a",
      "/media/chart.png",
      "chart.png",
    ];
    expect(loads.map((url) => safeMediaSrc(url))).toStrictEqual(loads);
  });

  test("a remote address loads only when the caller allows it", () => {
    expect(safeMediaSrc("https://images.example.com/chart.png")).toBeNull();
    expect(safeMediaSrc("http://images.example.com/chart.png")).toBeNull();
    expect(
      safeMediaSrc("https://images.example.com/chart.png", { remote: true })
    ).toBe("https://images.example.com/chart.png");
  });

  test("SVG, another type, script, another site's path or nothing loads nothing, even when remote is allowed", () => {
    const loaded = [
      "data:image/svg+xml;base64,PHN2Zz4=",
      "data:image/svg+xml,<svg></svg>",
      "data:text/html;base64,PHNjcmlwdD4=",
      "data:application/octet-stream;base64,AAAA",
      `${JS}:alert(1)`,
      "java\tscript:alert(1)",
      "//images.example.com/chart.png",
      "/\\images.example.com/chart.png",
      "file:///etc/passwd",
      "",
      undefined,
    ].filter((url) => safeMediaSrc(url, { remote: true }) !== null);
    expect(loaded).toStrictEqual([]);
  });
});

describe(ownValue, () => {
  test("reads only what the table holds as its own", () => {
    const table: Record<string, string> = { ts: "TypeScript" };
    expect(ownValue(table, "ts")).toBe("TypeScript");
    for (const key of [
      "__proto__",
      "constructor",
      "toString",
      "hasOwnProperty",
    ]) {
      expect(ownValue(table, key)).toBeUndefined();
    }
  });
});

describe(slotProps, () => {
  test("with asChild, the one child element is what the part renders", () => {
    const child = <a href="/docs">Docs</a>;
    const props = slotProps(true, child);
    expect(props.render).toBe(child);
    expect(props.children).toBeUndefined();
  });

  test("without asChild, or with no element to stand in, the children stay the part's", () => {
    const child = <a href="/docs">Docs</a>;
    expect(slotProps(false, child)).toStrictEqual({ children: child });
    expect(slotProps(true, "Docs")).toStrictEqual({ children: "Docs" });
    expect(isValidElement(slotProps(undefined, child).children)).toBeTruthy();
  });
});

describe(slotWords, () => {
  test("with asChild, the element is drawn without its words, which come back apart", () => {
    const parts = slotWords(true, <a href="/docs">Docs</a>);
    expect(parts.children).toBe("Docs");
    expect(renderToStaticMarkup(parts.render)).toBe('<a href="/docs"></a>');
  });

  test("without asChild, the children stay the part's", () => {
    expect(slotWords(false, "Docs")).toStrictEqual({ children: "Docs" });
  });
});

describe(isBlank, () => {
  test.each([
    [undefined, true],
    [null, true],
    [false, true],
    ["", true],
    [[null, "", [false]], true],
    [0, false],
    ["0", false],
    [[null, "Done"], false],
  ])("%j draws nothing: %j", (children, blank) => {
    expect(isBlank(children)).toBe(blank);
  });
});

describe(isInvalid, () => {
  test.each([
    [true, true],
    ["true", true],
    [false, false],
    ["false", false],
    [undefined, false],
    ["grammar", false],
  ])("aria-invalid %j is wrong: %j", (value, wrong) => {
    expect(isInvalid(value)).toBe(wrong);
  });
});

describe(assignRef, () => {
  test("sets an object ref and calls a function ref", () => {
    const node = { id: "box" };
    const object = createRef<typeof node>();
    const calls: (typeof node | null)[] = [];
    assignRef(object, node);
    assignRef((value: typeof node | null) => {
      calls.push(value);
    }, node);
    assignRef(undefined, node);
    expect(object.current).toBe(node);
    expect(calls).toStrictEqual([node]);
  });
});

const DialogClose = () => useI18n().dialog.close;
const SheetClose = () => useI18n().sheet.close;
const HoldToDelete = () => useI18n().holdButton.holdTo("verwijderen");
const Locale = () => useLocale() ?? "none";

describe(useI18n, () => {
  test("with no provider every word is English", () => {
    expect(renderToStaticMarkup(<DialogClose />)).toBe("Close");
  });

  test("a part the catalogue gives speaks its language; a part it leaves out stays English", () => {
    const html = renderToStaticMarkup(
      <I18nProvider locale="nl-NL" catalog={{ dialog: { close: "Sluiten" } }}>
        <DialogClose /> <SheetClose />
      </I18nProvider>
    );
    expect(html).toBe("Sluiten Close");
  });

  test("a word built from others is a function the catalogue gives too", () => {
    const html = renderToStaticMarkup(
      <I18nProvider
        locale="nl-NL"
        catalog={{
          holdButton: {
            ask: (action) => `${action}?`,
            cancel: "Annuleren",
            confirm: "Bevestigen",
            holdTo: (action) => `Houd vast om te ${action}`,
          },
        }}
      >
        <HoldToDelete />
      </I18nProvider>
    );
    expect(html).toBe("Houd vast om te verwijderen");
  });
});

describe(useLocale, () => {
  test("is the provider's language, and undefined with none", () => {
    expect(renderToStaticMarkup(<Locale />)).toBe("none");
    expect(
      renderToStaticMarkup(
        <I18nProvider locale="nl-NL">
          <Locale />
        </I18nProvider>
      )
    ).toBe("nl-NL");
  });
});

/** What a hook returns on a component's first draw, rendered on the server. */
const first = <Value,>(useHook: () => Value): Value => {
  const held: Value[] = [];
  const Holder = () => {
    held.push(useHook());
    return null;
  };
  renderToStaticMarkup(<Holder />);
  const [value] = held;
  if (value === undefined) {
    throw new Error("The holder did not render.");
  }
  return value;
};

const problem = new Error("offline");
const errors: unknown[] = [];

/** Work that takes a moment, as work does. */
const moment = async () => {
  await Promise.resolve();
};
const save = async () => {
  await moment();
  return "saved";
};
const saveNamed = async (name: string) => {
  await moment();
  return `saved ${name}`;
};
const failToSave = async (): Promise<string> => {
  await moment();
  throw problem;
};

const useSave = () => useAction(save);
const useSaveNamed = () => useAction(saveNamed);
const useFailingSave = () =>
  useAction(failToSave, {
    errorLabel: "Could not save",
    onError: (error) => {
      errors.push(error);
    },
  });
const useCopyCommand = () => useCopy("npm i damsko");

describe(useAction, () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("at rest it says nothing", () => {
    const action = first(useSave);
    expect(action.status).toBe("idle");
    expect(action.label).toBeUndefined();
  });

  test("a run resolves with the work's value", async () => {
    vi.useFakeTimers();
    await expect(first(useSaveNamed).run("draft")).resolves.toStrictEqual({
      ok: true,
      value: "saved draft",
    });
  });

  test("a press while it works or shows its result does nothing", async () => {
    vi.useFakeTimers();
    const action = first(useSave);
    const running = action.run();
    await expect(action.run()).resolves.toStrictEqual({
      busy: true,
      ok: false,
    });
    await running;
    await expect(action.run()).resolves.toStrictEqual({
      busy: true,
      ok: false,
    });
    vi.advanceTimersByTime(durations.hold);
    await expect(action.run()).resolves.toMatchObject({ ok: true });
  });

  test("a failure hands back the error and tells onError", async () => {
    vi.useFakeTimers();
    const action = first(useFailingSave);
    await expect(action.run()).resolves.toStrictEqual({
      error: problem,
      ok: false,
    });
    expect(errors).toStrictEqual([problem]);
  });
});

describe(useCopy, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  test("writes the text to the clipboard", async () => {
    vi.useFakeTimers();
    const written: string[] = [];
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: async (text: string) => {
          written.push(text);
          await moment();
        },
      },
    });
    await expect(first(useCopyCommand).run()).resolves.toMatchObject({
      ok: true,
    });
    expect(written).toStrictEqual(["npm i damsko"]);
  });
});
