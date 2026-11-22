import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationPage,
  PaginationNext,
} from "@grasp-os/ui/components/pagination";

export default function PaginationPageCount() {
  return (
    <Pagination total={50} pageSize={10} aria-label="Results">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious />
        </PaginationItem>
        <PaginationPage />
        <PaginationItem>
          <PaginationNext />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
