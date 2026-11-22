import {
  Pagination,
  PaginationRange,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@grasp-os/ui/components/pagination";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: { width: "100%", maxWidth: 560 },
});

export default function PaginationBasic() {
  return (
    <Pagination
      total={100}
      pageSize={10}
      defaultPage={3}
      unit={{ one: "project", other: "projects" }}
      aria-label="Projects"
      style={layout.row}
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
  );
}
