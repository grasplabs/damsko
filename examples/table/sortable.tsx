import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@grasp-os/ui/components/table";
import type { TableSortDirection } from "@grasp-os/ui/components/table";
import { useState } from "react";

const reports = [
  { name: "Quarterly summary", owner: "Amara Okafor", pages: 14 },
  { name: "Supplier list for the spring", owner: "Jonas Weber", pages: 6 },
  { name: "Team survey results", owner: "Lena Ruiz", pages: 22 },
  { name: "Office move plan", owner: "Sam Patel", pages: 9 },
];

type Key = "name" | "owner" | "pages";

export default function TableSortable() {
  const [by, setBy] = useState<Key>("name");
  const [order, setOrder] = useState<"ascending" | "descending">("ascending");
  const sortBy = (key: Key) => {
    setOrder(key === by && order === "ascending" ? "descending" : "ascending");
    setBy(key);
  };
  const sortOf = (key: Key): TableSortDirection =>
    key === by ? order : "none";
  const rows = [...reports].sort((a, b) => {
    const result =
      by === "pages" ? a.pages - b.pages : a[by].localeCompare(b[by]);
    return order === "ascending" ? result : -result;
  });
  return (
    <Table caption="Reports, sorted by the column you choose.">
      <TableHeader>
        <TableRow>
          <TableHead
            sortDirection={sortOf("name")}
            onSort={() => {
              sortBy("name");
            }}
          >
            Report
          </TableHead>
          <TableHead
            sortDirection={sortOf("owner")}
            onSort={() => {
              sortBy("owner");
            }}
          >
            Owner
          </TableHead>
          <TableHead
            align="end"
            sortDirection={sortOf("pages")}
            onSort={() => {
              sortBy("pages");
            }}
          >
            Pages
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((report) => (
          <TableRow key={report.name}>
            <TableCell rowHeader>{report.name}</TableCell>
            <TableCell>{report.owner}</TableCell>
            <TableCell align="end">{report.pages}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
