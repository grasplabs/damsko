"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationRange,
} from "@grasp-os/ui/components/pagination";
import { I18nProvider } from "@grasp-os/ui/lib/i18n";
import type { I18nCatalog } from "@grasp-os/ui/lib/i18n";
import { useEffect, useState } from "react";

// What the items are called, so the range says "results", not "items": the product gives its
// words once, through the I18nProvider round its root.
const results: Partial<I18nCatalog> = {
  pagination: {
    loading: "Loading the page",
    name: "Pagination",
    next: "Next page",
    none: (unit: string) => `No ${unit}`,
    page: (current: string, count: string) => `Page ${current} of ${count}`,
    previous: "Previous page",
    range: (first: string, last: string, total: string, unit: string) =>
      `Showing ${first} – ${last} of ${total} ${unit}`,
    unit: { one: "result", other: "results" },
  },
};

// Pages of results are addresses: each step is a link, so back, a reload and a new tab all open
// the page it pointed to.
const fromAddress = () =>
  Number(/^#results-(\d+)$/u.exec(window.location.hash)?.[1] ?? 1);

export default function NavigationPages() {
  const [page, setPage] = useState(1);
  useEffect(() => {
    const read = () => {
      setPage(fromAddress());
    };
    read();
    // A router can change the address with no hashchange, so back is heard as popstate too.
    window.addEventListener("hashchange", read);
    window.addEventListener("popstate", read);
    return () => {
      window.removeEventListener("hashchange", read);
      window.removeEventListener("popstate", read);
    };
  }, []);
  return (
    <I18nProvider locale="en-GB" catalog={results}>
      <Pagination
        total={86}
        pageSize={10}
        page={page}
        // A press moves the page at once; the link still writes the address.
        onPageChange={setPage}
        getPageUrl={(next) => `#results-${next}`}
        aria-label="Search results"
      >
        <PaginationRange />
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </I18nProvider>
  );
}
