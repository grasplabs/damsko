import { Button } from "@grasp-os/ui/components/button";
import { Skeleton } from "@grasp-os/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@grasp-os/ui/components/table";
import { fadeIn } from "@grasp-os/ui/lib/styles";
import { size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

// Names that stay on one line in a third of a phone's width, so a loaded row is as tall as the
// skeleton row it replaces and nothing below jumps.
const reports = [
  { name: "Q3 summary", owner: "Amara Okafor", pages: 14 },
  { name: "Suppliers", owner: "Jonas Weber", pages: 6 },
  { name: "Team survey", owner: "Lena Ruiz", pages: 22 },
];

const layout = stylex.create({
  stack: { display: "grid", gap: space["3"], width: "100%", maxWidth: 560 },
  actions: { display: "flex", justifyContent: "flex-end" },
  // Each line as tall as the table's own line of words, so a row keeps its height as they arrive.
  name: { width: "70%", height: size.tableTextLine },
  short: { width: "50%", height: size.tableTextLine },
  number: { width: 24, height: size.tableTextLine, marginInlineStart: "auto" },
});

// The table keeps its shape while its rows load: a dot field where the words will be, so nothing
// moves when they arrive. Load again to watch it.
export default function LoadingSkeleton() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!loading) {
      return;
    }
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1600);
    return () => {
      clearTimeout(timer);
    };
  }, [loading]);
  return (
    <div aria-busy={loading} {...stylex.props(layout.stack)}>
      <div {...stylex.props(layout.actions)}>
        <Button
          variant="secondary"
          size="sm"
          focusableWhenDisabled
          disabled={loading}
          onClick={() => {
            setLoading(true);
          }}
        >
          Load again
        </Button>
      </div>
      {/* Arriving: the columns share the width evenly, so they stand still when the words come. */}
      <Table
        streaming
        caption={
          loading ? "Loading the reports." : "Reports shared with the team."
        }
      >
        <TableHeader>
          <TableRow>
            <TableHead>Report</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead align="end">Pages</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.name}>
              {loading ? (
                <>
                  <TableCell rowHeader>
                    <Skeleton style={layout.name} />
                  </TableCell>
                  <TableCell>
                    <Skeleton style={layout.short} />
                  </TableCell>
                  <TableCell align="end">
                    <Skeleton style={layout.number} />
                  </TableCell>
                </>
              ) : (
                <>
                  {/* The words fade in where the grey lines stood. */}
                  <TableCell rowHeader>
                    <span data-arrive="" {...stylex.props(fadeIn)}>
                      {report.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span {...stylex.props(fadeIn)}>{report.owner}</span>
                  </TableCell>
                  <TableCell align="end">
                    <span {...stylex.props(fadeIn)}>{report.pages}</span>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
