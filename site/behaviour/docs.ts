// The behaviour of the docs' own controls, one script for the whole site (loaded by the header).
// Everything is delegated from the document, so it keeps working across the Astro router's
// client-side page swaps without being bound again.
//
//   [data-force]                     a States cell: its part's hover, focus or press, forced
//
// A stage's own controls (tabs, ground, variant switch, previews that never leave the page) are
// in site/blocks/blocks.ts, loaded here with the rest. The site's one copy behaviour is in ./copy.ts, the frame's (theme, phone menu, sidebar line, rail)
// in ./chrome.ts and ./theme.ts, search in ./search.ts; all loaded from here.
import "./copy";
import "./chrome";
import "./search";
import "../blocks/blocks.ts";
import { forceStates } from "./force-states";

forceStates();

// The page's one agent bridge (./agent.ts), only on a page with a live stage, and fetched only then.
const wakeAgent = () => {
  if (document.querySelector("[data-stage][data-live]")) {
    void import("./agent").then(({ pageAgent }) => pageAgent());
  }
};
wakeAgent();
document.addEventListener("astro:page-load", wakeAgent);
