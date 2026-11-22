import { Button } from "@grasp-os/ui/components/button";
import { DataTable } from "@grasp-os/ui/components/data-table";

import { reports } from "./reports";

// Nothing matches, the pattern's way: the table hands `noMatch` what was asked, so the words name
// the search, the picture says "nothing found", and one press clears it. Type in the search.
export default function DataTableNoMatch() {
  return (
    <DataTable
      aria-label="Reports"
      caption="Type a word no report holds, such as invoices."
      rows={reports}
      getRowId={(report) => report.id}
      searchable
      pageSize={5}
      unit={{ one: "report", other: "reports" }}
      columns={[
        { id: "name", header: "Report", value: (report) => report.name },
        { id: "owner", header: "Owner", value: (report) => report.owner },
        {
          id: "pages",
          header: "Pages",
          value: (report) => report.pages,
          align: "end",
        },
      ]}
      noResults={(asked) => ({
        picture: "search",
        title:
          asked.query === ""
            ? "No reports meet the filter"
            : `No reports match “${asked.query}”`,
        description: `Check the spelling or try a shorter word. All ${reports.length} reports are still here.`,
        action: (
          <Button variant="outline" size="sm" onClick={asked.clear}>
            {asked.query === "" ? "Clear the filter" : "Clear the search"}
          </Button>
        ),
      })}
    />
  );
}
