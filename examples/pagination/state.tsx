import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationPage,
  PaginationNext,
} from "@grasp-os/ui/components/pagination";

// One pagination in one state. The docs draw it once per state; hover, keyboard focus and pressed
// are forced from its own CSS on both steps. In a product the page and `loading` come from the list.
export default function PaginationState({
  page = 2,
  total = 50,
  loading = false,
}: {
  page?: number;
  total?: number;
  loading?: boolean;
}) {
  return (
    <Pagination
      total={total}
      pageSize={10}
      page={page}
      loading={loading}
      aria-label="Projects"
    >
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
