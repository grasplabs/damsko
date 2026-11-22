import { Calendar } from "@grasp-os/ui/components/calendar";

export default function CalendarMultiple() {
  return (
    <Calendar
      mode="multiple"
      defaultValue={["2026-11-03", "2026-11-10", "2026-11-17"]}
    />
  );
}
