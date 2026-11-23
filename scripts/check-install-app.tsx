// The second app scripts/check-install.ts opens in a browser. The first is the page's own (Get
// started's blocks, carried out as written: one button). Once that has built and drawn, this file
// takes the place of its src/App.tsx, and nothing else changes: no package, no setting. It holds
// one thing for each further claim the docs make to a product: text in each of the three font
// families (with a letter only the full Latin file has), an element with no style of its own for
// the base, a choice of mode that is kept, and the components' words from a translation library
// in miniature, built while rendering. Never run here.
/* oxlint-disable shadcn/no-inline-styles -- the page's app has no StyleX of its own and this file adds no package to it, so its three styles are inline */
import { Button } from "@grasp-os/ui/components/button";
import { I18nProvider, useI18n } from "@grasp-os/ui/lib/i18n";
import type { I18nCatalog } from "@grasp-os/ui/lib/i18n";
import { useState, useSyncExternalStore } from "react";

// A runtime catalogue: the words exist once a language is active, and its readers are told when
// the language changes.
const messages = {
  en: { asks: "Needs your yes", error: "Failed", loading: "Working" },
  nl: { asks: "Vraagt je ja", error: "Mislukt", loading: "Bezig" },
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

/** A component's word, and how many different catalogue objects the readers have seen. */
const Words = () => {
  const words = useI18n();
  given.add(words);
  return (
    <>
      <output aria-label="Word">{words.action.loading}</output>
      <output aria-label="Catalogues">{given.size}</output>
    </>
  );
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
        action: {
          agentAsks: words.asks,
          // A word that is a function, built anew at every draw.
          agentPresses: (pressed) => `${words.asks}: ${pressed}`,
          error: words.error,
          loading: words.loading,
          success: words.loading,
        },
      }}
    >
      {/* A flex column, so the paragraph is a flex item: only a reset lets it shrink below its words. */}
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <h1 style={{ fontFamily: "var(--damsko-font-serif)" }}>Café Zoë</h1>
        <p>A plain paragraph: señor, façade.</p>
        <code style={{ fontFamily: "var(--damsko-font-mono)" }}>
          const naïve = 1;
        </code>
        <Button variant="default">Save changes</Button>
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
        <Words />
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
