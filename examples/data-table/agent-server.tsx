"use client";

import {
  DataTable,
  searchParamsLocation,
} from "@grasp-os/ui/components/data-table";
import type { DataTableSort } from "@grasp-os/ui/components/data-table";
import { useState } from "react";

import { pageAgent } from "../../site/behaviour/agent";
import { reports } from "./reports";

// The server agent fixture: not shown on the page, used by tests/data-table.spec.ts. A table paged
// by a server (here, slices of the reports) on the page's agent bridge, with its view in the
// address: an agent pages it by the server's count, and the table asks the server again only when
// its view really changes, which the line under it counts.
pageAgent();

const pageSize = 5;

export default function DataTableAgentServer() {
  const [location] = useState(() => searchParamsLocation("server"));
  const [sort, setSort] = useState<DataTableSort[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [asked, setAsked] = useState(0);
  const ask = () => {
    setAsked((now) => now + 1);
  };
  return (
    <>
      <DataTable
        aria-label="Reports"
        rows={reports.slice((page - 1) * pageSize, page * pageSize)}
        getRowId={(report) => report.id}
        rowCount={reports.length}
        location={location}
        sort={sort}
        onSortChange={(next) => {
          ask();
          setSort(next);
        }}
        query={query}
        onQueryChange={(next) => {
          ask();
          setQuery(next);
        }}
        page={page}
        onPageChange={(next) => {
          ask();
          setPage(next);
        }}
        pageSize={pageSize}
        unit={{ one: "report", other: "reports" }}
        columns={[
          { id: "name", header: "Report", value: (report) => report.name },
          { id: "owner", header: "Owner", value: (report) => report.owner },
        ]}
      />
      <p>{`Asked the server: ${String(asked)}`}</p>
    </>
  );
}
