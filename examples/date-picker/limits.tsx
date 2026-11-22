import { DatePicker } from "@grasp-os/ui/components/date-picker";

// Only weekdays from today on can be chosen: the rest are struck through or out of use.
export default function DatePickerLimits() {
  return (
    <DatePicker
      aria-label="Delivery day"
      name="delivery"
      min="2026-11-13"
      max="2027-02-28"
      unavailable={{ weekday: [0, 6] }}
      defaultValue="2026-11-18"
    />
  );
}
