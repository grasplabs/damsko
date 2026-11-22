import { Button } from "@grasp-os/ui/components/button";
import { CopyButton } from "@grasp-os/ui/components/copy-button";
import { I18nProvider } from "@grasp-os/ui/lib/i18n";
import * as stylex from "@stylexjs/stylex";
import { useSyncExternalStore } from "react";

import { writing } from "./writing-fixtures";

// A translation library in miniature, the shape Lingui, i18next and FormatJS share: the words
// exist once a language is active, and its readers are told when the language changes.
const messages = {
  en: {
    copied: "Copied",
    copy: "Copy",
    copyError: "Not copied",
    other: "Nederlands",
  },
  nl: {
    copied: "Gekopieerd",
    copy: "Kopiëren",
    copyError: "Niet gekopieerd",
    other: "English",
  },
};
type Language = keyof typeof messages;

let active: Language = "en";
const listeners = new Set<() => void>();
const library = {
  activate: (language: Language) => {
    active = language;
    for (const listener of listeners) {
      listener();
    }
  },
  language: () => active,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

/** The active language and its words, as the library's own hook gives them. */
const useTranslations = () => {
  const language = useSyncExternalStore(
    library.subscribe,
    library.language,
    () => "en" as const
  );
  return {
    language,
    t: (key: keyof typeof messages.en) => messages[language][key],
  };
};

// The components' words from a runtime catalogue: the object is built here, while rendering, from
// the library's words, and the provider keeps it until the language or a word changes.
export default function WritingRuntimeWords() {
  const { language, t } = useTranslations();
  return (
    <I18nProvider
      locale={language === "nl" ? "nl-NL" : "en-GB"}
      catalog={{
        copyButton: {
          copied: t("copied"),
          copy: t("copy"),
          copyError: t("copyError"),
        },
      }}
    >
      <div lang={language} {...stylex.props(writing.row)}>
        <CopyButton value="https://example.com/reports/q3" />
        <Button
          variant="outline"
          size="sm"
          lang={language === "nl" ? "en" : "nl"}
          onClick={() => {
            library.activate(language === "nl" ? "en" : "nl");
          }}
        >
          {t("other")}
        </Button>
      </div>
    </I18nProvider>
  );
}
