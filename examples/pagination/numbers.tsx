import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@grasp-os/ui/components/pagination";

// A link for each page near the current one and at the ends, with an ellipsis for each gap: the
// list's children as a function of the pages to show.
export default function PaginationNumbers() {
  return (
    <Pagination
      total={200}
      pageSize={10}
      defaultPage={6}
      aria-label="Search results"
    >
      <PaginationContent>
        {({ items }) => (
          <>
            <PaginationItem>
              <PaginationPrevious />
            </PaginationItem>
            {items.map((item) =>
              typeof item === "number" ? (
                <PaginationItem key={item}>
                  <PaginationLink page={item} />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationEllipsis />
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext />
            </PaginationItem>
          </>
        )}
      </PaginationContent>
    </Pagination>
  );
}
