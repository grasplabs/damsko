import { Calendar } from "@grasp-os/ui/components/calendar";

// Every state a day can be in, in one month: today (the 9th), a range from the 16th to the 21st, a
// booked day struck through (the 12th), days before the earliest that can be chosen at half
// strength, and the days of the months round it, quieter.
export default function CalendarDays() {
  return (
    <Calendar
      mode="range"
      defaultMonth="2026-11"
      today="2026-11-09"
      min="2026-11-04"
      unavailable={["2026-11-12"]}
      defaultValue={["2026-11-16", "2026-11-21"]}
    />
  );
}
