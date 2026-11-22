"use client";

import { DataTable } from "@grasp-os/ui/components/data-table";
import type { DataTableSort } from "@grasp-os/ui/components/data-table";
import { useEffect, useState } from "react";

import { reports } from "./reports";
import type { Report } from "./reports";

const pageSize = 4;
const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));

// A pretend server: sorts, searches and pages, and answers after a moment.
async function fetchPage(
  sort: readonly DataTableSort[],
  query: string,
  page: number
) {
  await wait(600);
  const words = query.trim().toLowerCase();
  const found = reports.filter(
    (report) =>
      !words || `${report.name} ${report.owner}`.toLowerCase().includes(words)
  );
  const [by] = sort;
  if (by) {
    const key = by.key as keyof Report;
    found.sort(
      (a, b) =>
        String(a[key]).localeCompare(String(b[key]), undefined, {
          numeric: true,
        }) * (by.order === "ascending" ? 1 : -1)
    );
  }
  return {
    rows: found.slice((page - 1) * pageSize, page * pageSize),
    total: found.length,
  };
}

// Sorted, searched and paged by a server: the table keeps nothing but what it is given, shows
// placeholders while the page is on its way, and fades the rows in where they stood.
export default function DataTableServer() {
  const [sort, setSort] = useState<DataTableSort[]>([
    { key: "name", order: "ascending" },
  ]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [answer, setAnswer] = useState<{ rows: Report[]; total: number }>({
    rows: [],
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let current = true;
    const load = async () => {
      setLoading(true);
      const next = await fetchPage(sort, query, page);
      if (current) {
        setAnswer(next);
        setLoading(false);
      }
    };
    void load();
    return () => {
      current = false;
    };
  }, [sort, query, page]);
  return (
    <DataTable
      aria-label="Reports"
      rows={answer.rows}
      getRowId={(report) => report.id}
      rowCount={answer.total}
      loading={loading}
      sort={sort}
      onSortChange={setSort}
      query={query}
      onQueryChange={setQuery}
      page={page}
      onPageChange={setPage}
      pageSize={pageSize}
      searchable
      unit={{ one: "report", other: "reports" }}
      columns={[
        {
          id: "name",
          header: "Report",
          value: (report) => report.name,
          sortable: true,
        },
        {
          id: "owner",
          header: "Owner",
          value: (report) => report.owner,
          sortable: true,
        },
        {
          id: "pages",
          header: "Pages",
          value: (report) => report.pages,
          align: "end",
          sortable: true,
        },
      ]}
    />
  );
}
