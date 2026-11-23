import {
  Pagination,
  PaginationRange,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@grasp-os/ui/components/pagination";
import { I18nProvider } from "@grasp-os/ui/lib/i18n";
import type { I18nCatalog } from "@grasp-os/ui/lib/i18n";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 24, width: "100%", maxWidth: 560 },
});

// What the items are called, so the range says "projects", not "items": the product gives its words
// once, through the I18nProvider round its root.
const projects: Partial<I18nCatalog> = {
  pagination: {
    loading: "Loading the page",
    name: "Pagination",
    next: "Next page",
    none: (unit: string) => `No ${unit}`,
    page: (current: string, count: string) => `Page ${current} of ${count}`,
    previous: "Previous page",
    range: (first: string, last: string, total: string, unit: string) =>
      `Showing ${first} – ${last} of ${total} ${unit}`,
    unit: { one: "project", other: "projects" },
  },
};

export default function PaginationStates() {
  return (
    <I18nProvider locale="en-GB" catalog={projects}>
      <div {...stylex.props(layout.stack)}>
        <Pagination
          total={100}
          pageSize={10}
          defaultPage={2}
          loading
          aria-label="Projects"
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
        <Pagination total={0} pageSize={10} aria-label="Archived projects">
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
      </div>
    </I18nProvider>
  );
}
