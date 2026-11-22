import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@grasp-os/ui/components/pagination";

export default function PaginationArrows() {
  return (
    <Pagination total={50} pageSize={10} defaultPage={2} aria-label="Comments">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
