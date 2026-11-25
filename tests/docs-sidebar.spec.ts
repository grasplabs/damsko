// The docs site's sidebar keeps what the reader set. The runs they opened stay open, and the
// sidebar stays where it was scrolled, through a page change by a link and by Back; the runs stay
// open through a reload too. Astro's router swaps in the next page's sidebar as the server drew it,
// and the head script draws the kept runs anew right after the swap (site/system/head-scripts.ts,
// sidebarInit), so the state is read as the swap leaves it and in the first frame after it. On a
// reload the head script draws the kept runs, and a sidebar folded away, as the page is read; the
// page bar's trigger is drawn from that state (site/chrome/DocsShell.tsx). So a reload is read with
// the page's scripts held back, before the shell can wake. Each is read again once it has woken.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { settled } from "./example.ts";

const OPENED = ["Text input", "Choice"];

interface SidebarState {
  sidebar: string | undefined;
  runs: { run: string; expanded: string | null; itemsShown: boolean }[];
  scroll: number;
  current: string | undefined;
}

/**
 * The sidebar as drawn: whether it is open, each of OPENED's fold and whether its rows show, its
 * scroll and the page it marks current. Given `go`, a click on the sidebar's link of that name or
 * Back, it is read twice: as the router's swap that `go` starts has left it (after the head
 * script's own handlers), and in the first frame after that swap.
 */
const drawn = async (page: Page, go?: { link: string } | "back") =>
  await page.evaluate(
    async ({ runs, action }) => {
      const read = (): SidebarState => {
        const nav = document.querySelector('nav[aria-label="Pages"]');
        const triggers = [
          ...(nav?.querySelectorAll("button[aria-expanded]") ?? []),
        ];
        return {
          sidebar: document.querySelector<HTMLElement>('[data-slot="sidebar"]')
            ?.dataset.state,
          runs: runs.map((run) => {
            const trigger = triggers.find((button) =>
              button.textContent.startsWith(run)
            );
            const rows = [
              ...(trigger
                ?.closest("[data-sidebar-fold]")
                ?.querySelectorAll('[data-slot="collapsible-content"] a') ??
                []),
            ];
            return {
              run,
              expanded: trigger?.getAttribute("aria-expanded") ?? null,
              itemsShown:
                rows.length > 0 && rows.every((row) => row.checkVisibility()),
            };
          }),
          scroll: nav?.scrollTop ?? -1,
          current: nav?.querySelector('a[aria-current="page"]')?.textContent,
        };
      };
      if (action === undefined) {
        return [read()];
      }
      // oxlint-disable-next-line promise/avoid-new -- the swap and the next frame have no promise of their own
      const first = new Promise<SidebarState[]>((resolve) => {
        document.addEventListener(
          "astro:after-swap",
          () => {
            const swapped = read();
            requestAnimationFrame(() => {
              resolve([swapped, read()]);
            });
          },
          { once: true }
        );
      });
      if (action === "back") {
        history.back();
      } else {
        const link = [
          ...document.querySelectorAll<HTMLAnchorElement>(
            'nav[aria-label="Pages"] a'
          ),
        ].find((anchor) => anchor.textContent === action.link);
        link?.click();
      }
      return await first;
    },
    { runs: OPENED, action: go }
  );

/** The shell has woken on the page shown, and the router's crossfade and the sidebar stand still. */
const shellAwake = async (page: Page) => {
  await page.waitForFunction(() => {
    const shell = document
      .querySelector('[data-slot="sidebar-wrapper"]')
      ?.closest("astro-island");
    const moving = document.getAnimations().some(({ effect }) => {
      if (!(effect instanceof KeyframeEffect)) {
        return false;
      }
      return (
        effect.pseudoElement?.startsWith("::view-transition") === true ||
        (effect.target?.closest('[data-slot="sidebar"]') ?? null) !== null
      );
    });
    return (
      shell !== null &&
      shell !== undefined &&
      !shell.hasAttribute("ssr") &&
      !moving
    );
  });
  await settled(page);
};

/**
 * Every reading of the sidebar (drawn) shows it open, OPENED's runs open with their rows showing,
 * `current` marked as the page, and the scroll at `scroll` when given.
 */
const expectOpen = async (
  page: Page,
  current: string,
  { scroll, go }: { scroll?: number; go?: { link: string } | "back" } = {}
) => {
  for (const state of await drawn(page, go)) {
    expect(state).toEqual({
      sidebar: "expanded",
      runs: OPENED.map((run) => ({ run, expanded: "true", itemsShown: true })),
      scroll: scroll ?? expect.any(Number),
      current,
    });
  }
};

/** Reloads with the page's scripts held back, so the shell cannot wake until `whileHeld` is done. */
const reloadHeld = async (page: Page, whileHeld: () => Promise<void>) => {
  const held = Promise.withResolvers<null>();
  await page.route("**/*.{js,mjs}", async (route) => {
    await held.promise;
    await route.continue();
  });
  await page.reload({ waitUntil: "commit" });
  // Read past the sidebar, and its styles in: WebKit draws nothing, so shows no row, until then.
  await expect(page.locator('[data-slot="sidebar-inset"]')).toBeAttached();
  await page.waitForFunction(() =>
    [
      ...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
    ].every((link) => link.sheet !== null)
  );
  await whileHeld();
  held.resolve(null);
  await shellAwake(page);
};

test("the runs the reader opened stay open, and the sidebar's scroll stays, through a page change, Back and a reload", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(new URL("/components/button", process.env.BASE_URL).href);
  await shellAwake(page);
  const nav = page.getByRole("navigation", { name: "Pages" });
  const textInput = nav.getByRole("button", { name: /^Text input/u });
  const choice = nav.getByRole("button", { name: /^Choice/u });
  await textInput.click();
  await expect(textInput).toHaveAttribute("aria-expanded", "true");
  await choice.click();
  await expect(choice).toHaveAttribute("aria-expanded", "true");
  // Scrolled a little, with the link followed still in sight, so nothing brings it to the middle.
  await nav.evaluate((element) => {
    element.scrollTop = 40;
  });
  await shellAwake(page);
  const scroll = await nav.evaluate((element) => element.scrollTop);
  expect(scroll).toBeGreaterThan(0);
  await expectOpen(page, "Button", { scroll });

  await expectOpen(page, "Copy button", {
    scroll,
    go: { link: "Copy button" },
  });
  await expect(page).toHaveURL(/\/components\/copy-button$/u);
  await shellAwake(page);
  await expectOpen(page, "Copy button", { scroll });

  await expectOpen(page, "Button", { scroll, go: "back" });
  await expect(page).toHaveURL(/\/components\/button$/u);
  await shellAwake(page);
  await expectOpen(page, "Button", { scroll });

  // A reload starts the sidebar's scroll anew: only the runs are kept.
  await reloadHeld(page, async () => {
    await expectOpen(page, "Button");
  });
  await expectOpen(page, "Button");
});

test("loaded with the sidebar folded, it is drawn folded and the page bar's trigger shows, before the shell wakes too", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(new URL("/components/button", process.env.BASE_URL).href);
  await shellAwake(page);
  const sidebar = page.locator('[data-slot="sidebar"]');
  await page
    .getByRole("complementary", { name: "Sidebar" })
    .getByRole("button", { name: "Show or hide the sidebar" })
    .click();
  const bar = page
    .getByRole("main")
    .getByRole("button", { name: "Show or hide the sidebar" });
  await expect(bar).toBeVisible();
  await reloadHeld(page, async () => {
    await expect(sidebar).toHaveAttribute("data-state", "collapsed");
    await expect(bar).toBeVisible();
  });
  await expect(sidebar).toHaveAttribute("data-state", "collapsed");
  await expect(bar).toBeVisible();
});
