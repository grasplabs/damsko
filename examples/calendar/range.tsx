import { Calendar } from "@grasp-os/ui/components/calendar";

export default function CalendarRange() {
  return (
    <Calendar
      mode="range"
      numberOfMonths={2}
      defaultValue={["2026-11-10", "2026-11-14"]}
    />
  );
}
