import { Calendar } from "@grasp-os/ui/components/calendar";

// The month's and the weekdays' names in Dutch, and the week starting on Monday, as the locale has
// it. A product sets `locale` once on its I18nProvider; a single calendar may set its own.
export default function CalendarLocale() {
  return <Calendar locale="nl-NL" defaultValue="2026-11-16" />;
}
