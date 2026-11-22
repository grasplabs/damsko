// The words of a Data table's date cell as the server draws them: what people say for a moment, in
// the reader's language, against the time the page is drawn at (never the time the server's
// process started).
//   pnpm test scripts/when.test.tsx
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { DataTableDateCell } from "../src/components/data-table/data-table.tsx";
import { I18nProvider } from "../src/lib/i18n.tsx";

// 18 November 2026, 15:00 in the machine's own time zone.
const now = new Date(2026, 10, 18, 15, 0);
const at = (...parts: [number, number, number, number, number, number?]) =>
  new Date(...parts);

/** The words a date cell says, drawn on the server in a locale. */
const wordsOf = (date: Date, locale: string) => {
  const html = renderToString(
    <I18nProvider locale={locale}>
      <DataTableDateCell date={date} />
    </I18nProvider>
  );
  return /<time[^>]*>(?<words>[^<]*)<\/time>/u.exec(html)?.groups?.words;
};

describe(DataTableDateCell, () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(now);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test.each([
    ["en-GB", at(2026, 10, 18, 14, 59, 30), "Now"],
    ["en-GB", at(2026, 10, 18, 14, 57), "3 minutes ago"],
    ["en-GB", at(2026, 10, 18, 12, 0), "3 hours ago"],
    ["en-GB", at(2026, 10, 18, 18, 0), "In 3 hours"],
    ["en-GB", at(2026, 10, 17, 23, 0), "Yesterday"],
    ["en-GB", at(2026, 10, 19, 9, 0), "Tomorrow"],
    ["en-GB", at(2026, 10, 9, 9, 0), "9 Nov"],
    ["en-GB", at(2025, 9, 15, 9, 0), "15 Oct 2025"],
    // Dutch, from the platform.
    ["nl-NL", at(2026, 10, 17, 23, 0), "Gisteren"],
    ["nl-NL", at(2026, 10, 18, 12, 0), "3 uur geleden"],
    ["nl-NL", at(2026, 10, 9, 9, 0), "9 nov"],
  ])("in %s, %s is %j", (locale, date, words) => {
    expect(wordsOf(date, locale)).toBe(words);
  });

  test("a server that has run for hours says the time it draws at", () => {
    expect(wordsOf(now, "en-GB")).toBe("Now");
    const later = new Date(now.getTime() + 5 * 60 * 60 * 1000);
    vi.setSystemTime(later);
    expect(wordsOf(later, "en-GB")).toBe("Now");
  });
});
