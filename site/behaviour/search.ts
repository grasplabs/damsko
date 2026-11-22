// The header's search: a modal dialog over an index of every page's sections
// (site/search-index.ts, served as `virtual:damsko-search`, loaded the first time search opens).
// It finds the words of a page, not only its title, and a result goes to its section: the page's
// address with the section's hash, where the heading is marked for a moment.
//
//   site:search (an event)      opens it too, for a script that cannot reach the hook
//   ⌘K / Ctrl+K                 opens it from anywhere
//   dialog[data-search-dialog]  the dialog; Escape and a click outside close it
//
// The input is a combobox: arrow keys choose a result (shown with a fill and a mint line, and
// scrolled into view), Enter follows it, hovering chooses too.
//
// Results come in groups, each under a small heading that is not a stop: Components and Docs (the
// pages, each with its one-sentence description), Sections (a page's headings, "Dialog · Long
// body", with a sentence of its prose) and API (a part, by name). The arrow keys go in the order
// they are drawn. A page whose title is the query, or starts with it, comes first.
import { durations } from "@grasp-os/ui/lib/tokens.values";

import { frameFocus } from "./quiet-focus";
import { scrollBarClass } from "./search-scroll";

interface Section {
  kind: "page" | "section" | "api";
  route: string;
  page: string;
  heading: string;
  slug: string;
  text: string;
}

let index: Section[] | null = null;
let loading: Promise<Section[]> | null = null;
let opener: HTMLElement | null = null;
let arrivedAt: string | null = null;

// In a build, by its fixed name (site/system/vite.ts, searchIndexFile), so site.js never names a hash
// that changes with every page's words.
const indexModule = (): Promise<{ default: unknown }> =>
  import.meta.env.DEV
    ? import("virtual:damsko-search")
    : import(
        /* @vite-ignore */ new URL("/_astro/search-index.js", location.origin)
          .href
      );

const load = () => {
  loading ??= indexModule().then((module) => {
    index = module.default as Section[];
    return index;
  });
  return loading;
};

const dialog = () =>
  document.querySelector<HTMLDialogElement>("dialog[data-search-dialog]");

const escape = (text: string) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const terms = (query: string) =>
  query
    .toLowerCase()
    .split(/\s+/u)
    .filter((term) => term.length > 0);

const mark = (piece: string, words: string[]) => {
  let marked = escape(piece);
  for (const word of words) {
    marked = marked.replaceAll(
      new RegExp(
        `(${escape(word).replaceAll(/[.*+?^${}()|[\]\\]/gu, "\\$&")})`,
        "giu"
      ),
      "<mark>$1</mark>"
    );
  }
  return marked;
};

/** The sentence of the section's prose that holds the first match, else its first sentence. */
const excerpt = (text: string, words: string[]) => {
  if (!text) {
    return "";
  }
  const sentences = text.split(/(?<=[.!?])\s+/u);
  const found =
    sentences.find((one) =>
      words.some((word) => one.toLowerCase().includes(word))
    ) ??
    sentences[0] ??
    "";
  const short =
    found.length > 160
      ? `${found.slice(0, found.lastIndexOf(" ", 158))}…`
      : found;
  return mark(short, words);
};

type Hit = Section & { excerpt: string; group: Group };
type Group = "Components" | "Docs" | "Sections" | "API";
/** How many of each a search shows at most. */
const room: Record<Group, number> = {
  Components: 5,
  Docs: 4,
  Sections: 6,
  API: 4,
};

const groupOf = (section: Section): Group =>
  section.kind === "api"
    ? "API"
    : section.kind === "section"
      ? "Sections"
      : section.route === "/components" ||
          section.route.startsWith("/components/")
        ? "Components"
        : "Docs";

/** Foundations and guidelines: the pages a single word is most often looking for. */
const isGuide = (section: Section) =>
  section.route.startsWith("/foundations/") ||
  section.route.startsWith("/guidelines/");

const rank = (sections: Section[], query: string): Hit[] => {
  const words = terms(query);
  if (words.length === 0) {
    return [];
  }
  const whole = words.join(" ");
  const scored = sections
    .map((section, order) => {
      const heading = section.heading.toLowerCase();
      const page = section.page.toLowerCase();
      const text = section.text.toLowerCase();
      let score = 0;
      let missing = 0;
      let named = false;
      for (const word of words) {
        if (heading.startsWith(word)) {
          score += 8;
        } else if (heading.includes(word)) {
          score += 6;
        } else if (page.includes(word)) {
          score += 3;
        } else if (text.includes(word)) {
          score += 1;
        } else {
          missing += 1;
          continue;
        }
        if (heading.includes(word)) {
          named = true;
        }
      }
      // Every word must be found, except on a foundation or guideline whose heading names one of
      // them: "focus ring" still finds Accessibility · Focus, below what holds every word.
      if (
        missing > 0 &&
        !(isGuide(section) && named && missing < words.length)
      ) {
        return null;
      }
      score -= missing * 4;
      // A page whose title is the query (or its plural: Icons, Themes), or starts with it, on top.
      if (
        section.kind === "page" &&
        (heading === whole || heading === `${whole}s`)
      ) {
        score += 100;
      } else if (section.kind === "page" && heading.startsWith(whole)) {
        score += 50;
      }
      // Within a group, the parts of a page that matched by its title come after the page itself.
      if (section.kind !== "page" && page.startsWith(whole)) {
        score += 4;
      }
      // Foundations and guidelines outrank a component that only mentions the word.
      if (isGuide(section)) {
        score += 3;
      }
      return { order, score, section };
    })
    .filter(
      (hit): hit is { order: number; score: number; section: Section } =>
        hit !== null
    )
    // Equal scores: of two pages the shorter title first (Button before Button group); sections and
    // parts in the order of their page.
    .sort(
      (a, b) =>
        b.score - a.score ||
        (a.section.kind === "page" && b.section.kind === "page"
          ? a.section.heading.length - b.section.heading.length
          : 0) ||
        a.order - b.order
    );
  // Pages before sections and parts; of Components and Docs, the one holding the best page first.
  const best = (group: Group) =>
    scored.find((hit) => groupOf(hit.section) === group)?.score ?? -Infinity;
  const order: Group[] = [
    ...(best("Docs") > best("Components")
      ? (["Docs", "Components"] as const)
      : (["Components", "Docs"] as const)),
    "Sections",
    "API",
  ];
  const hits: Hit[] = [];
  for (const group of order) {
    hits.push(
      ...scored
        .filter((hit) => groupOf(hit.section) === group)
        .slice(0, room[group])
        .map((hit) => ({
          ...hit.section,
          excerpt: excerpt(hit.section.text, words),
          group,
        }))
    );
  }
  return hits;
};

/**
 * The list scrolls inside the dialog. At rest it ends on a whole row with the fade's room under it,
 * so the row that does not fit shows only its top, fading out, never sliced by the count line. The
 * edges fade while there is more beyond them ([data-more] start, end or both).
 */
const edges = (list: HTMLElement) => {
  const top = list.scrollTop > 1;
  const bottom = list.scrollTop + list.clientHeight < list.scrollHeight - 1;
  const more = top && bottom ? "both" : top ? "start" : bottom ? "end" : "";
  if (more) {
    list.dataset.more = more;
  } else {
    delete list.dataset.more;
  }
};

const fit = (list: HTMLElement) => {
  for (const name of scrollBarClass.split(" ")) {
    if (name) list.classList.add(name);
  }
  list.style.maxHeight = "";
  list.scrollTop = 0;
  const room = list.clientHeight;
  if (list.scrollHeight > room) {
    const fade =
      Number.parseFloat(
        getComputedStyle(list).getPropertyValue("--site-search-fade")
      ) || 0;
    const pad = Number.parseFloat(getComputedStyle(list).paddingTop) || 0;
    let end = 0;
    for (const row of list.querySelectorAll<HTMLElement>('[role="option"]')) {
      const bottom = row.offsetTop + row.offsetHeight;
      if (bottom + fade > room) {
        break;
      }
      end = bottom;
    }
    if (end > 0) {
      list.style.maxHeight = `${end + Math.max(fade, pad)}px`;
    }
  }
  edges(list);
};

document.addEventListener(
  "scroll",
  (event) => {
    const list = event.target as HTMLElement;
    if (list instanceof HTMLElement && list.matches("[data-search-results]")) {
      edges(list);
    }
  },
  true
);

const hrefOf = (section: Section) =>
  `${import.meta.env.BASE_URL.replace(/\/$/u, "")}${section.route}${section.slug ? `#${section.slug}` : ""}`;

const choose = (input: HTMLInputElement, option: HTMLElement | null) => {
  const list = document.getElementById(
    input.getAttribute("aria-controls") ?? ""
  );
  for (const other of list?.querySelectorAll<HTMLElement>('[role="option"]') ??
    []) {
    other.setAttribute("aria-selected", String(other === option));
  }
  if (option) {
    input.setAttribute("aria-activedescendant", option.id);
    option.scrollIntoView({ block: "nearest" });
  } else {
    input.removeAttribute("aria-activedescendant");
  }
};

// With nothing typed the dialog is never an empty band: it offers the pages
// last visited (kept in this browser, site/behaviour/recent.ts writes them) and four starting
// points, as Linear and Raycast do. They need no index, so they show at once.
const starts = [
  { title: "Components", route: "/components" },
  { title: "Get started", route: "/get-started" },
  { title: "Colour", route: "/foundations/colour" },
  { title: "Choosing", route: "/guidelines/choosing" },
];
const recentKey = "damsko-docs-recent";
const recent = (): { title: string; route: string }[] => {
  try {
    const kept: unknown = JSON.parse(localStorage.getItem(recentKey) ?? "[]");
    return Array.isArray(kept)
      ? kept.filter(
          (item): item is { title: string; route: string } =>
            typeof item?.title === "string" && typeof item?.route === "string"
        )
      : [];
  } catch {
    return [];
  }
};
const base = import.meta.env.BASE_URL.replace(/\/$/u, "");
const idle = (list: HTMLElement) => {
  const here = location.pathname.replace(base, "").replace(/\/$/u, "") || "/";
  const last = recent()
    .filter((page) => page.route !== here)
    .slice(0, 4);
  const routes = new Set(last.map((page) => page.route));
  const groups = [
    { name: "Recent", pages: last },
    {
      name: "Start here",
      pages: starts.filter(
        (page) => !routes.has(page.route) && page.route !== here
      ),
    },
  ].filter((group) => group.pages.length > 0);
  let at = 0;
  list.innerHTML = groups
    .map((group) => {
      const id = `site-search-group-${group.name.toLowerCase().replaceAll(/\s+/gu, "-")}`;
      return (
        `<div role="group" aria-labelledby="${id}" class="site-search-group">` +
        `<div class="site-search-group-name" id="${id}" role="presentation">${group.name}</div>${group.pages
          .map(
            (page) =>
              `<a role="option" id="site-search-${at++}" aria-selected="false" href="${escape(base + page.route)}"><span class="site-search-place">${escape(page.title)}</span></a>`
          )
          .join("")}</div>`
      );
    })
    .join("");
  return at;
};

const render = (input: HTMLInputElement) => {
  const box = input.closest<HTMLElement>("dialog");
  const list = box?.querySelector<HTMLElement>("[data-search-results]");
  const status = box?.querySelector<HTMLElement>("[data-search-status]");
  if (!(list && status)) {
    return;
  }
  const query = input.value.trim();
  if (!query) {
    const shown = idle(list);
    fit(list);
    input.setAttribute("aria-expanded", String(shown > 0));
    status.textContent = "";
    choose(input, list.querySelector<HTMLElement>('[role="option"]'));
    return;
  }
  if (!index) {
    status.textContent = query ? "Loading the index…" : "";
    void load().then(() => {
      render(input);
    });
    return;
  }
  const hits = rank(index, query);
  let at = 0;
  list.innerHTML = [...new Set(hits.map((hit) => hit.group))]
    .map((group) => {
      const inGroup = hits.filter((hit) => hit.group === group);
      if (inGroup.length === 0) {
        return "";
      }
      const id = `site-search-group-${group.toLowerCase()}`;
      return (
        `<div role="group" aria-labelledby="${id}" class="site-search-group">` +
        `<div class="site-search-group-name" id="${id}" role="presentation">${group}</div>${inGroup
          .map((hit) => {
            const place =
              hit.kind === "page"
                ? escape(hit.page)
                : `${escape(hit.page)}<span aria-hidden="true"> · </span>${escape(hit.heading)}`;
            const words = hit.excerpt
              ? `<span class="site-search-words">${hit.excerpt}</span>`
              : "";
            return `<a role="option" id="site-search-${at++}" aria-selected="false" href="${escape(hrefOf(hit))}"><span class="site-search-place">${place}</span>${words}</a>`;
          })
          .join("")}</div>`
      );
    })
    .join("");
  fit(list);
  input.setAttribute("aria-expanded", String(hits.length > 0));
  status.textContent =
    hits.length === 0
      ? `Nothing found for “${query}”.`
      : `${hits.length} ${hits.length === 1 ? "result" : "results"}`;
  choose(input, list.querySelector<HTMLElement>('[role="option"]'));
};

const open = (from: HTMLElement | null) => {
  const box = dialog();
  if (!box || box.open) {
    return;
  }
  opener = from;
  void load();
  box.showModal();
  const input = box.querySelector<HTMLInputElement>("[data-search-input]");
  if (input) {
    input.select();
    render(input);
  }
};

const close = () => {
  const box = dialog();
  if (box?.open) {
    box.close();
  }
};

/** Marks the section a result led to, for duration-hold, once the page is there. */
const markArrival = () => {
  if (!arrivedAt || location.hash !== arrivedAt) {
    return;
  }
  arrivedAt = null;
  const target = document.getElementById(
    decodeURIComponent(location.hash.slice(1))
  );
  if (!target) {
    return;
  }
  // The router scrolls before the new page has settled (its fonts, its blocks' sizes), which
  // can leave the section lower down; once it has, put the heading under the header again.
  void document.fonts.ready.then(() =>
    requestAnimationFrame(() => {
      target.scrollIntoView({ block: "start", behavior: "instant" });
    })
  );
  target.dataset.searchArrived = "";
  setTimeout(() => delete target.dataset.searchArrived, durations.hold);
};

const follow = (option: HTMLAnchorElement) => {
  const url = new URL(option.href);
  arrivedAt = url.hash || null;
  close();
  if (url.pathname === location.pathname) {
    // The same page: go to the section here, as a new entry in the history.
    history.pushState(history.state, "", url.hash || url.pathname);
    const target = url.hash
      ? document.getElementById(decodeURIComponent(url.hash.slice(1)))
      : null;
    if (target) {
      target.scrollIntoView({ block: "start" });
    } else {
      scrollTo({ top: 0 });
    }
    markArrival();
    return true;
  }
  return false;
};

document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement | null;
  const trigger = target?.closest<HTMLElement>("[data-site-search]");
  if (trigger) {
    open(trigger);
    return;
  }
  const box = target?.closest<HTMLDialogElement>("dialog[data-search-dialog]");
  if (!box) {
    return;
  }
  // The dialog element itself is only hit outside its panel: the backdrop.
  if (target === box) {
    close();
    return;
  }
  const option = target?.closest<HTMLAnchorElement>('[role="option"]');
  if (option && follow(option)) {
    event.preventDefault();
  }
});

// The docs shell's sidebar search button (site/chrome/DocsShell.tsx) asks by an event, so the
// island never imports this file, which runs in the browser only.
document.addEventListener("site:search", () => {
  open(
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
  );
});

document.addEventListener("input", (event) => {
  const input = (event.target as HTMLElement | null)?.closest<HTMLInputElement>(
    "[data-search-input]"
  );
  if (input) {
    render(input);
  }
});

document.addEventListener("pointermove", (event) => {
  const option = (event.target as HTMLElement | null)?.closest<HTMLElement>(
    "dialog[data-search-dialog] [role='option']"
  );
  const input = dialog()?.querySelector<HTMLInputElement>(
    "[data-search-input]"
  );
  if (option && input && option.getAttribute("aria-selected") !== "true") {
    choose(input, option);
  }
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    // A held key repeats: only the first press counts, or the search opens and shuts as it is held.
    if (event.repeat) {
      return;
    }
    if (dialog()?.open) {
      close();
    } else {
      open(
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null
      );
    }
    return;
  }
  const input = (event.target as HTMLElement | null)?.closest<HTMLInputElement>(
    "[data-search-input]"
  );
  if (!input) {
    return;
  }
  const options = [
    ...(input
      .closest("dialog")
      ?.querySelectorAll<HTMLAnchorElement>('[role="option"]') ?? []),
  ];
  const current = options.findIndex(
    (option) => option.getAttribute("aria-selected") === "true"
  );
  if (event.key === "Escape") {
    // Esc closes, as the hint in the field says: a search field would first only clear its words.
    // The words stay for the next time it opens (it opens with them selected).
    event.preventDefault();
    close();
  } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    if (options.length === 0) {
      return;
    }
    const step = event.key === "ArrowDown" ? 1 : -1;
    choose(
      input,
      options[(current + step + options.length) % options.length] ?? null
    );
  } else if (event.key === "Enter") {
    const option = options[current];
    if (!option) {
      return;
    }
    event.preventDefault();
    if (!follow(option)) {
      option.click();
    }
  }
});

document.addEventListener(
  "close",
  (event) => {
    if (
      !(event.target as HTMLElement).matches?.("dialog[data-search-dialog]")
    ) {
      return;
    }
    // Focus goes back to what opened search, unless a result took the reader somewhere else.
    if (opener?.isConnected && !arrivedAt) {
      frameFocus(opener);
    }
    opener = null;
  },
  true
);

document.addEventListener("astro:page-load", markArrival);
