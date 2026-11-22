import { Checkbox } from "@grasp-os/ui/components/checkbox";
import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import {
  InputGroup,
  InputGroupClear,
  InputGroupInput,
  InputGroupAddon,
} from "@grasp-os/ui/components/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@grasp-os/ui/components/table";
import { Icon, SearchIcon } from "@grasp-os/ui/lib/icons";
import { colors, font, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

// One part of a data table, in one state: a row with its checkbox, the search, or the row that
// says nothing matched. The docs draw it once per state; hover and keyboard focus are forced from
// the parts' own CSS. A DataTable draws these from its `rows`, `selectable` and `searchable`.
const layout = stylex.create({
  search: { width: "100%", maxWidth: 220 },
  pick: {
    display: "block",
    width: size.checkboxBox,
    height: font.textSmLine,
  },
  // Inside it, the Checkbox stands 44px wide, spilling over the next cell, so its reach is 44px.
  reach: { display: "block", width: size.tapTarget },
  // The words are hidden but keep a width, so the Checkbox's own reach (its box, its gap and its
  // words, 44px tall on a touch screen) is 44px wide too, spilling into the next cell.
  words: {
    display: "inline-block",
    width: `calc(${size.tapTarget} - ${size.checkboxBox} - ${space["3"]})`,
    height: 1,
    overflow: "hidden",
    whiteSpace: "nowrap",
    color: "transparent",
  },
  lift: { marginBlock: `calc((${font.textSmLine} - ${size.tapTarget}) / 2)` },
  empty: { color: colors.mutedForeground },
});

export default function DataTableState({
  part = "row",
  chosen = false,
  query = "",
}: {
  part?: "row" | "search" | "empty";
  chosen?: boolean;
  query?: string;
}) {
  if (part === "search") {
    return (
      <div {...stylex.props(layout.search)}>
        <InputGroup>
          <InputGroupAddon>
            <Icon icon={SearchIcon} />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            aria-label="Search reports"
            placeholder="Search reports"
            defaultValue={query}
          />
          <InputGroupClear aria-label="Clear search" />
        </InputGroup>
      </div>
    );
  }
  return (
    <Table aria-label="Reports">
      <TableBody>
        {part === "empty" ? (
          <TableRow>
            <TableCell>
              <span {...stylex.props(layout.empty)}>
                No reports match “zebra”.
              </span>
            </TableCell>
          </TableRow>
        ) : (
          <TableRow selected={chosen}>
            <TableCell>
              <span {...stylex.props(layout.pick)}>
                <span {...stylex.props(layout.reach)}>
                  <Field orientation="horizontal" style={layout.lift}>
                    <Checkbox checked={chosen} />
                    <FieldLabel>
                      <span {...stylex.props(layout.words)}>
                        Choose Quarterly summary
                      </span>
                    </FieldLabel>
                  </Field>
                </span>
              </span>
            </TableCell>
            <TableCell rowHeader>Quarterly summary</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
