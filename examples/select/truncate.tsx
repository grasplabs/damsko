import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@grasp-os/ui/components/select";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: space[4],
  },
  narrow: { width: "12rem" },
});

const reports = [
  {
    value: "planning",
    label: "Notes from the quarterly planning meeting with the whole team",
  },
  { value: "churn", label: "Churn by region" },
];

// A long value in a narrow place: on its own it wraps; with truncate it stays on one line and ends
// in an ellipsis. The list shows it whole either way.
export default function SelectTruncate() {
  return (
    <div {...stylex.props(styles.row)}>
      <Select items={reports} defaultValue="planning">
        <SelectTrigger
          size="sm"
          aria-label="Report, wrapping"
          style={styles.narrow}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent />
      </Select>
      <Select items={reports} defaultValue="planning">
        <SelectTrigger
          size="sm"
          truncate
          aria-label="Report, on one line"
          style={styles.narrow}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent />
      </Select>
    </div>
  );
}
