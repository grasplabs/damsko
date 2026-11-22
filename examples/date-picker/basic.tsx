import { DatePicker } from "@grasp-os/ui/components/date-picker";

export default function DatePickerBasic() {
  return (
    <DatePicker aria-label="Due date" name="due" defaultValue="2026-11-20" />
  );
}
