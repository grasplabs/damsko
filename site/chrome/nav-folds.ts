// The sidebar's folded runs (site/chrome/DocsShell.tsx), kept in localStorage under navStorageKey
// as `{ [run id]: folded }`, so what a reader opens or folds stays across pages and tabs. The
// layout writes the run holding the page as open before the first paint (site/layouts/Docs.astro).
// On the server, and while the page wakes, nothing is kept: the run holding the page is open and
// every other folded, as the server drew them.
import { useSyncExternalStore } from "react";

import { navStorageKey } from "../system/name";

export type Folds = Readonly<Record<string, boolean>>;

const none: Folds = {};
let cached: { raw: string | null; folds: Folds } = { raw: null, folds: none };
const listeners = new Set<() => void>();

const parse = (raw: string | null): Folds => {
  if (raw === null) {
    return none;
  }
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) {
      return none;
    }
    return Object.fromEntries(
      Object.entries(value).filter(
        (entry): entry is [string, boolean] => typeof entry[1] === "boolean"
      )
    );
  } catch {
    return none;
  }
};

/** The kept folds, the same object while storage holds the same words. */
const read = (): Folds => {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(navStorageKey);
  } catch {
    // Storage refused: nothing is kept.
  }
  if (raw !== cached.raw) {
    cached = { raw, folds: parse(raw) };
  }
  return cached.folds;
};

const watch = (change: () => void) => {
  listeners.add(change);
  window.addEventListener("storage", change);
  return () => {
    listeners.delete(change);
    window.removeEventListener("storage", change);
  };
};

const keep = (id: string, folded: boolean) => {
  try {
    localStorage.setItem(
      navStorageKey,
      JSON.stringify({ ...read(), [id]: folded })
    );
  } catch {
    // Storage refused: the fold lasts the page.
  }
  for (const listener of listeners) {
    listener();
  }
};

/** The kept folds, and the call that folds or opens a run and keeps it. */
export const useFolds = (): [Folds, (id: string, folded: boolean) => void] => [
  useSyncExternalStore(watch, read, () => none),
  keep,
];
