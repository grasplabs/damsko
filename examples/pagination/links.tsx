"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationPage,
  PaginationNext,
} from "@grasp-os/ui/components/pagination";
import { useEffect, useState } from "react";

// Each step is a link to its page's address; the page is read back from the address, so a new
// tab or a reload opens where the link pointed.
const fromAddress = () =>
  Number(/^#page-(\d+)$/u.exec(window.location.hash)?.[1] ?? 1);

export default function PaginationLinks() {
  const [page, setPage] = useState(1);
  useEffect(() => {
    const read = () => {
      setPage(fromAddress());
    };
    read();
    window.addEventListener("hashchange", read);
    return () => {
      window.removeEventListener("hashchange", read);
    };
  }, []);
  return (
    <Pagination
      total={100}
      pageSize={10}
      aria-label="Search results"
      page={page}
      getPageUrl={(next) => `#page-${next}`}
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
