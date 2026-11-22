import { KeyValueList } from "@grasp-os/ui/components/key-value";
import { I18nProvider } from "@grasp-os/ui/lib/i18n";
import type { I18nCatalog } from "@grasp-os/ui/lib/i18n";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 400 },
});

// The words the list says itself, in another language, from the page's I18nProvider: the copy
// button's name, from the fact's, and what it says once pressed, and what a waiting value says.
const dutch: Partial<I18nCatalog> = {
  copyButton: {
    copy: "Kopieer",
    copied: "Gekopieerd",
    copyError: "Kopiëren lukte niet",
  },
  keyValue: {
    copy: (label) => `Kopieer ${label.toLocaleLowerCase()}`,
    loading: "De waarde wordt geladen",
  },
};

export default function KeyValueLabels() {
  return (
    <I18nProvider locale="nl-NL" catalog={dutch}>
      <KeyValueList
        divided
        style={layout.box}
        items={[
          { id: "naam", label: "Naam", value: "Anna de Vries" },
          {
            id: "gebruikers-id",
            label: "Gebruikers-ID",
            value: "usr_01J9X4F81C2QK7M3",
            mono: true,
            copyable: true,
          },
        ]}
      />
    </I18nProvider>
  );
}
