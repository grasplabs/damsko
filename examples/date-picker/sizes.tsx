import { DatePicker } from "@grasp-os/ui/components/date-picker";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: { display: "grid", gap: space[3], width: "100%", maxWidth: 280 },
});

export default function DatePickerSizes() {
  return (
    <div {...stylex.props(layout.column)}>
      <DatePicker
        aria-label="Start date, small"
        size="sm"
        defaultValue="2026-11-20"
      />
      <DatePicker aria-label="Start date" defaultValue="2026-11-20" />
      <DatePicker
        aria-label="Start date, large"
        size="lg"
        defaultValue="2026-11-20"
      />
    </div>
  );
}
