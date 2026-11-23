// Sidebar's head script, run against a page of its own: it draws the kept state and each group's
// kept fold, ignores what it does not know, cannot be broken out of by its key, and, run once the
// page is read (a client router running it again), sets them once and watches nothing.
//
//   pnpm test scripts/sidebar-state-script.test.ts
import { runInNewContext } from "node:vm";

import { describe, expect, test } from "vitest";

import { sidebarStateScript } from "../src/components/sidebar.tsx";

const SIDEBARS = '[data-sidebar-key="app"] [data-slot=sidebar]';
const FOLDS = '[data-sidebar-key="app"] [data-sidebar-fold]';

/** A group's panel, as the server drew it: open, or hidden. */
const panelOf = (hidden: string | null) => {
  const panel = {
    hidden,
    setAttribute: (_name: string, value: string) => {
      panel.hidden = value;
    },
    removeAttribute: () => {
      panel.hidden = null;
    },
  };
  return panel;
};

/**
 * Runs the script on a pretend page, with what is kept (the sidebar's own under "app", a group's
 * fold under "app:name") and how far the page is read. The page holds one sidebar, and two groups
 * that fold: "projects" drawn open, "teams" drawn folded.
 */
const run = (kept: Record<string, string>, readyState: string) => {
  const sidebar = { dataset: { state: "expanded" } };
  const projects = panelOf(null);
  const teams = panelOf("");
  const folds = [
    { dataset: { sidebarFold: "projects" }, querySelector: () => projects },
    { dataset: { sidebarFold: "teams" }, querySelector: () => teams },
  ];
  const asked: string[] = [];
  let watching = 0;
  const page = {
    readyState,
    querySelectorAll: (query: string) => {
      asked.push(query);
      return query === FOLDS ? folds : [sidebar];
    },
  };
  // The watcher the script makes while the page is being read.
  const MutationObserver = function MutationObserver() {
    return {
      observe: () => {
        watching += 1;
      },
    };
  };
  runInNewContext(sidebarStateScript("app"), {
    localStorage: { getItem: (key: string) => kept[key] ?? null },
    document: page,
    MutationObserver,
    addEventListener: () => {},
  });
  return {
    state: sidebar.dataset.state,
    projects: projects.hidden,
    teams: teams.hidden,
    asked,
    watching,
  };
};

describe(sidebarStateScript, () => {
  test("while the page is read it watches for the sidebars, to set them as they come", () => {
    expect(run({ app: "false" }, "loading")).toMatchObject({ watching: 1 });
  });

  test("once the page is read it sets them once, and watches nothing", () => {
    expect(run({ app: "false" }, "complete")).toStrictEqual({
      state: "collapsed",
      projects: null,
      teams: "",
      asked: [SIDEBARS, FOLDS],
      watching: 0,
    });
  });

  test("a value it does not know, or none, leaves the sidebars alone", () => {
    expect(run({ app: "folded" }, "complete").state).toBe("expanded");
    expect(run({}, "complete").state).toBe("expanded");
  });

  test("a group's kept fold hides or shows its panel, whatever the sidebar's own state", () => {
    expect(
      run({ "app:projects": "false", "app:teams": "true" }, "complete")
    ).toMatchObject({
      state: "expanded",
      projects: "until-found",
      teams: null,
    });
    expect(
      run({ "app:projects": "open", "app:teams": "shut" }, "complete")
    ).toMatchObject({ projects: null, teams: "" });
  });

  test("a key cannot close the script tag", () => {
    expect(sidebarStateScript("</script><script>alert(1)")).not.toContain("<");
  });
});
