import { Button } from "@grasp-os/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@grasp-os/ui/components/table";
import * as stylex from "@stylexjs/stylex";

import { Not, Pair, Write } from "./pair";
import { writing } from "./writing-fixtures";

const form = "Arbeidsongeschiktheidsverzekeringsaanvraagformulier";

// Dutch compounds, said in Dutch (`lang="nl"`), so a word too long for its box breaks where Dutch
// breaks it. A cell that cuts its words gives the whole text as its title. Wrong: a label
// shortened by hand, and a cut cell with no way to read the rest.
export default function WritingLongWords() {
  return (
    <Pair>
      <Write why="wraps, and the whole text is there">
        <div lang="nl" data-may-wrap="" {...stylex.props(writing.column)}>
          <div {...stylex.props(writing.row)}>
            <Button variant="default">
              Arbeidsongeschiktheidsverzekering aanvragen
            </Button>
          </div>
          <Table width={280} aria-label="Formulieren">
            <TableHeader>
              <TableRow>
                <TableHead width={180}>Formulier</TableHead>
                <TableHead width={100}>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell rowHeader truncate title={form}>
                  {form}
                </TableCell>
                <TableCell>Concept</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Write>
      <Not why="cut by hand, or cut for good">
        {/* data-may-wrap: the cut with no title is the fault shown, so the width check passes it by. */}
        <div lang="nl" data-may-wrap="" {...stylex.props(writing.column)}>
          <div {...stylex.props(writing.row)}>
            <Button variant="default">Arb.ong.verz. aanvr.</Button>
          </div>
          <Table width={280} aria-label="Formulieren">
            <TableHeader>
              <TableRow>
                <TableHead width={180}>Formulier</TableHead>
                <TableHead width={100}>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell rowHeader truncate>
                  {form}
                </TableCell>
                <TableCell>Concept</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Not>
    </Pair>
  );
}
