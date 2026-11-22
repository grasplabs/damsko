import { DatePicker } from "@grasp-os/ui/components/date-picker";
import { I18nProvider } from "@grasp-os/ui/lib/i18n";
import type { I18nCatalog } from "@grasp-os/ui/lib/i18n";

// The words in Dutch, through the I18nProvider round the page; the dates in the locale's own order.
const dutch: Partial<I18nCatalog> = {
  calendar: {
    previous: "Vorige maand",
    next: "Volgende maand",
  },
  datePicker: {
    last30: "Laatste 30 dagen",
    last7: "Laatste 7 dagen",
    presets: "Voorinstellingen",
    rangeEnd: (field) => `${field}, einde`,
    rangeStart: (field) => `${field}, begin`,
    rangeTrigger: "Kies datums",
    select: "Kies datum",
    triggerWith: (trigger, chosen) => `${trigger}, ${chosen}`,
    thisMonth: "Deze maand",
    today: "Vandaag",
  },
};

export default function DatePickerRangeLocale() {
  return (
    <I18nProvider catalog={dutch} locale="nl-NL">
      <DatePicker
        mode="range"
        numberOfMonths={2}
        presets
        aria-label="Periode"
        name="periode"
        today="2026-11-13"
      />
    </I18nProvider>
  );
}
