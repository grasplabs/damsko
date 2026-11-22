// The app scripts/check-install.ts builds from an installed registry and opens in a browser: it is
// copied into the fresh project as src/App.tsx, and never runs here. It holds one thing for each
// claim the docs make to a product: a component with its fill, text in each of the three font
// families (with a letter only the full Latin file has), an element with no style of its own for
// the base, a choice of mode that is kept, and the components' words from a translation library
// in miniature, built while rendering.
import { Button } from "@grasp-os/ui/components/button";
import { CopyButton } from "@grasp-os/ui/components/copy-button";
import { I18nProvider, useI18n } from "@grasp-os/ui/lib/i18n";
import type { I18nCatalog } from "@grasp-os/ui/lib/i18n";
import { font } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState, useSyncExternalStore } from "react";

const styles = stylex.create({
  // A flex column, so the paragraph is a flex item: only the base lets it shrink below its words.
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  mono: { fontFamily: font.mono },
  serif: { fontFamily: font.serif },
});

// A runtime catalogue: the words exist once a language is active, and its readers are told when
// the language changes.
const messages = {
  en: { copied: "Copied", copy: "Copy", copyError: "Not copied" },
  nl: { copied: "Gekopieerd", copy: "Kopiëren", copyError: "Niet gekopieerd" },
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

/** Every catalogue object a reader was given: one for each language shown, however often drawn. */
const given = new Set<I18nCatalog>();

/** Says how many different catalogue objects the readers have seen. */
const Catalogues = () => {
  given.add(useI18n());
  return <output aria-label="Catalogues">{given.size}</output>;
};

const choose = (mode: "light" | "dark") => {
  document.documentElement.dataset.mode = mode;
  localStorage.setItem("mode", mode);
};

const App = () => {
  const language = useSyncExternalStore(library.subscribe, library.language);
  const [drawn, setDrawn] = useState(1);
  const words = messages[language];
  return (
    <I18nProvider
      locale={language === "nl" ? "nl-NL" : "en-GB"}
      catalog={{
        copyButton: {
          copied: words.copied,
          copy: words.copy,
          copyError: words.copyError,
        },
        holdButton: {
          ask: (action) => `${action}?`,
          cancel: "Cancel",
          confirm: "Confirm",
          holdTo: (action) => `Hold to ${action}`,
        },
      }}
    >
      <main {...stylex.props(styles.column)}>
        <h1 {...stylex.props(styles.serif)}>Café Zoë</h1>
        <p>A plain paragraph: señor, façade.</p>
        <code {...stylex.props(styles.mono)}>const naïve = 1;</code>
        <Button variant="default">Save changes</Button>
        <CopyButton value="https://example.com" />
        <Button
          variant="outline"
          onClick={() => {
            library.activate(language === "nl" ? "en" : "nl");
          }}
        >
          {language === "nl" ? "English" : "Nederlands"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setDrawn(drawn + 1);
          }}
        >
          Draw again
        </Button>
        <output aria-label="Drawn">{drawn}</output>
        <Catalogues />
        <Button
          variant="outline"
          onClick={() => {
            choose("dark");
          }}
        >
          Dark
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            choose("light");
          }}
        >
          Light
        </Button>
      </main>
    </I18nProvider>
  );
};

export default App;
