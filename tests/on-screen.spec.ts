// A popup stays whole on the screen, a gutter from each edge, wherever its trigger stands. A
// submenu opens beside its parent when that side has room, on the other side when only that one
// has, and over its parent when neither has (a phone), and its items can still be pressed. Every
// menu with a submenu, at a phone's width and a desktop's, in both reading directions, with the
// trigger at the left, the centre and the right; and the top-level popups at a phone's width.
import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { openExample } from "./example.ts";

/** The space a popup keeps from the window's edges (popup.gutter). */
const gutter = 16;

const sizes = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
] as const;
const directions = ["ltr", "rtl"] as const;
const places = ["left", "centre", "right"] as const;
type Place = (typeof places)[number];

/** Where an element stands for each place: its left, its right and the shift that centres it. */
const standing = {
  left: { left: "16px", right: "auto", translate: "none" },
  centre: { left: "50%", right: "auto", translate: "-50% 0" },
  right: { left: "auto", right: "16px", translate: "none" },
} as const;

/** Stands an element at the top of the window, at one of its edges or its centre. */
const stand = async (element: Locator, place: Place): Promise<void> => {
  await element.evaluate((node: HTMLElement, at) => {
    Object.assign(node.style, {
      position: "fixed",
      top: "16px",
      margin: "0",
      ...at,
      // A field's control fills its field: here, the window less the gutters.
      maxWidth: "calc(100vw - 32px)",
    });
  }, standing[place]);
};

/** The point at the top of the window, at one of its edges or its centre. */
const pointAt = (page: Page, place: Place): { x: number; y: number } => {
  const width = page.viewportSize()?.width ?? 0;
  const x = { left: 24, centre: width / 2, right: width - 24 }[place];
  return { x, y: 24 };
};

/** How far a box reaches past the window less its gutter, on any side: 0 when it is inside. */
const pastEdge = async (popup: Locator): Promise<number> =>
  await popup.evaluate((node, room) => {
    const box = node.getBoundingClientRect();
    return Math.max(
      0,
      room - box.left,
      room - box.top,
      box.right - (window.innerWidth - room),
      box.bottom - (window.innerHeight - room)
    );
  }, gutter);

interface Menu {
  component: string;
  example: string;
  /** Stands the menu's trigger at a place and opens the top-level menu. */
  open: (page: Page, place: Place) => Promise<void>;
  sub: string;
  first: string;
}

const menus: Menu[] = [
  {
    component: "dropdown-menu",
    example: "submenu",
    open: async (page, place) => {
      const trigger = page.getByRole("button", { name: "Roadmap" });
      await stand(trigger, place);
      await trigger.click();
    },
    sub: "Share",
    first: "With the team",
  },
  {
    component: "context-menu",
    example: "submenu",
    open: async (page, place) => {
      // The area fills the window, so the menu opens at a point at the place.
      await page.getByLabel("Roadmap").evaluate((node: HTMLElement) => {
        Object.assign(node.style, { position: "fixed", inset: "0" });
      });
      const { x, y } = pointAt(page, place);
      await page.mouse.click(x, y, { button: "right" });
    },
    sub: "Share",
    first: "With the team",
  },
  {
    component: "menubar",
    example: "editor",
    open: async (page, place) => {
      await stand(page.getByRole("menubar", { name: "Editor" }), place);
      await page.getByRole("menuitem", { name: "File" }).click();
    },
    sub: "Export",
    first: "As PDF",
  },
];

for (const { component, example, open, sub, first } of menus) {
  for (const size of sizes) {
    for (const dir of directions) {
      for (const place of places) {
        test(`${component}: a submenu stays on screen at ${size.width}, ${dir}, trigger at the ${place}`, async ({
          page,
        }) => {
          await page.setViewportSize(size);
          await openExample(page, component, example);
          await page.evaluate((value) => {
            document.documentElement.dir = value;
          }, dir);
          await open(page, place);
          const trigger = page.getByRole("menuitem", { name: sub });
          await expect(trigger).toBeVisible();
          await trigger.focus();
          // The keys follow the reading direction wherever the submenu opened.
          const [into, out] =
            dir === "rtl"
              ? ["ArrowLeft", "ArrowRight"]
              : ["ArrowRight", "ArrowLeft"];
          await page.keyboard.press(into);
          const item = page.getByRole("menuitem", { name: first });
          await expect(item).toBeFocused();
          const submenu = page.getByRole("menu", { name: sub, exact: true });
          const parent = page.getByRole("menu").filter({ has: trigger });
          await expect.poll(async () => await pastEdge(submenu)).toBe(0);
          expect(await pastEdge(parent)).toBe(0);
          if (size.width === 1440) {
            // With room, it stands beside its parent, never over it.
            const [own, theirs] = await Promise.all([
              submenu.boundingBox(),
              parent.boundingBox(),
            ]);
            expect(
              own !== null &&
                theirs !== null &&
                (own.x >= theirs.x + theirs.width ||
                  own.x + own.width <= theirs.x)
            ).toBe(true);
          }
          await page.keyboard.press(out);
          await expect(item).toBeHidden();
          await expect(trigger).toBeFocused();
          await page.keyboard.press(into);
          await expect(item).toBeFocused();
          await item.click();
          await expect(trigger).toBeHidden();
        });
      }
    }
  }
}

/** A top-level popup: how to find its trigger and open it, and the popup it opens. */
interface Popup {
  component: string;
  example: string;
  trigger: (page: Page) => Locator;
  open: (trigger: Locator) => Promise<void>;
  popup: (page: Page) => Locator;
}

const click = async (trigger: Locator) => {
  await trigger.click();
};

const popups: Popup[] = [
  {
    component: "popover",
    example: "basic",
    trigger: (page) => page.getByRole("button", { name: "Publish report" }),
    open: click,
    popup: (page) => page.getByRole("dialog"),
  },
  {
    component: "select",
    example: "field",
    trigger: (page) => page.getByRole("combobox"),
    open: click,
    popup: (page) => page.getByRole("listbox"),
  },
  {
    component: "combobox",
    example: "field",
    trigger: (page) => page.getByRole("combobox"),
    open: async (trigger) => {
      await trigger.click();
      await trigger.press("ArrowDown");
    },
    popup: (page) => page.getByRole("listbox"),
  },
  {
    component: "date-picker",
    example: "basic",
    trigger: (page) => page.getByRole("button", { name: /November 20, 2026/u }),
    open: click,
    popup: (page) => page.getByRole("dialog"),
  },
  {
    component: "tooltip",
    example: "basic",
    trigger: (page) => page.getByRole("button", { name: "Publish" }),
    open: async (trigger) => {
      await trigger.hover();
    },
    popup: (page) => page.getByRole("tooltip"),
  },
  {
    component: "hover-card",
    example: "person",
    trigger: (page) => page.getByRole("link", { name: "Amara Okafor" }),
    open: async (trigger) => {
      await trigger.hover();
    },
    // The card has no role of its own: a hover card only shows more about its link.
    popup: (page) => page.locator('[data-slot="hover-card-content"]'),
  },
];

for (const { component, example, trigger, open, popup } of popups) {
  for (const dir of directions) {
    for (const place of places) {
      test(`${component}: the popup stays on screen at 390, ${dir}, trigger at the ${place}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await openExample(page, component, example);
        await page.evaluate((value) => {
          document.documentElement.dir = value;
        }, dir);
        await stand(trigger(page), place);
        await open(trigger(page));
        await expect(popup(page)).toBeVisible();
        await expect.poll(async () => await pastEdge(popup(page))).toBe(0);
      });
    }
  }
}
