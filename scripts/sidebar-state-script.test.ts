// Sidebar's head script, run against a page of its own: it draws the kept state, ignores what it
// does not know, cannot be broken out of by its key, and, run once the page is read (a client router
// running it again), sets the sidebars once and watches nothing.
//
//   pnpm test scripts/sidebar-state-script.test.ts
import { runInNewContext } from "node:vm";

import { describe, expect, test } from "vitest";

import { sidebarStateScript } from "../src/components/sidebar.tsx";

/** Runs the script on a pretend page, with what is kept and how far the page is read. */
const run = (kept: string | null, readyState: string) => {
  const sidebar = { dataset: { state: "expanded" } };
  const asked: string[] = [];
  let watching = 0;
  const page = {
    readyState,
    querySelectorAll: (query: string) => {
      asked.push(query);
      return [sidebar];
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
    localStorage: { getItem: () => kept },
    document: page,
    MutationObserver,
    addEventListener: () => {},
  });
  return { state: sidebar.dataset.state, asked, watching };
};

describe(sidebarStateScript, () => {
  test("while the page is read it watches for the sidebars, to set them as they come", () => {
    expect(run("false", "loading")).toMatchObject({ watching: 1 });
  });

  test("once the page is read it sets them once, and watches nothing", () => {
    expect(run("false", "complete")).toStrictEqual({
      state: "collapsed",
      asked: ['[data-sidebar-key="app"] [data-slot=sidebar]'],
      watching: 0,
    });
  });

  test("a value it does not know, or none, leaves the sidebars alone", () => {
    expect(run("folded", "complete").state).toBe("expanded");
    expect(run(null, "complete").state).toBe("expanded");
  });

  test("a key cannot close the script tag", () => {
    expect(sidebarStateScript("</script><script>alert(1)")).not.toContain("<");
  });
});
