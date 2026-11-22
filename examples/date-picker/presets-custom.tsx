import { DatePicker } from "@grasp-os/ui/components/date-picker";

// Ranges a team reports on: the quarters of the year.
const quarters = [
  {
    label: "First quarter",
    value: ["2026-01-01", "2026-03-31"] as [string, string],
  },
  {
    label: "Second quarter",
    value: ["2026-04-01", "2026-06-30"] as [string, string],
  },
  {
    label: "Third quarter",
    value: ["2026-07-01", "2026-09-30"] as [string, string],
  },
  {
    label: "Fourth quarter",
    value: ["2026-10-01", "2026-12-31"] as [string, string],
  },
];

export default function DatePickerPresetsCustom() {
  return (
    <DatePicker
      mode="range"
      numberOfMonths={2}
      presets={quarters}
      aria-label="Reporting period"
      name="quarter"
      defaultValue={quarters[3]!.value}
    />
  );
}
