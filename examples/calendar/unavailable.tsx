import { Calendar } from "@grasp-os/ui/components/calendar";

// Weekends, and two days already booked, cannot be chosen.
export default function CalendarUnavailable() {
  return (
    <Calendar
      defaultMonth="2026-11"
      min="2026-11-02"
      unavailable={[{ weekday: [0, 6] }, "2026-11-12", "2026-11-13"]}
    />
  );
}
