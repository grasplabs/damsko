import { DatePicker } from "@grasp-os/ui/components/date-picker";

// A stay of two to fourteen nights, from today on: no presets, the calendar alone.
export default function DatePickerRangeLimits() {
  return (
    <DatePicker
      mode="range"
      numberOfMonths={2}
      aria-label="Stay"
      startName="from"
      endName="to"
      min="2026-11-13"
      minDays={3}
      maxDays={15}
    />
  );
}
