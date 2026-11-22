import { DatePicker } from "@grasp-os/ui/components/date-picker";

export default function DatePickerRange() {
  return (
    <DatePicker
      aria-label="Trip"
      mode="range"
      numberOfMonths={2}
      name="trip"
      defaultValue={["2026-11-23", "2026-11-27"]}
    />
  );
}
