// A popup stays whole on the screen, a gutter from each edge, wherever its trigger stands. A
// submenu opens beside its parent when that side has room, on the other side when only that one
// has, and over its parent when neither has (a phone), and its items can still be pressed. Every
// menu with a submenu, on phones from 320 wide, in a short window, on a desktop and at 200% zoom,
// in both reading directions, with the trigger at the left, the centre and the right, at the top
// and at the bottom, and a submenu's submenu; a submenu beside a narrow, an ordinary and a wide
// parent takes the room beside it; from a submenu over its parent a press goes back one level;
// and the top-level popups at a phone's width.
import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { openExample } from "./example.ts";

/** The space a popup keeps from the window's edges (popup.gutter). */
const gutter = 16;
/** The widest a popup grows for its words (popup.width, 20rem). */
const popupWidth = 320;

const phone = { width: 390, height: 844 };
const desktop = { width: 1440, height: 900 };
const windows = [
  phone,
  { width: 320, height: 640 },
  // A short window: a phone held sideways, or the keyboard up.
  { width: 390, height: 400 },
  desktop,
] as const;
const directions = ["ltr", "rtl"] as const;
type Direction = (typeof directions)[number];
const places = ["left", "centre", "right"] as const;
type Place = (typeof places)[number];
type Row = "top" | "bottom";

/** Where an element stands for each place: its left, its right and the shift that centres it. */
const standing = {
  left: { left: "16px", right: "auto", translate: "none" },
  centre: { left: "50%", right: "auto", translate: "-50% 0" },
  right: { left: "auto", right: "16px", translate: "none" },
} as const;

/** Stands an element at the top or the bottom of the window, at one of its edges or its centre. */
const stand = async (
  element: Locator,
  place: Place,
  row: Row = "top"
): Promise<void> => {
  await element.evaluate(
    (node: HTMLElement, { at, top }) => {
      Object.assign(node.style, {
        position: "fixed",
        top: top ? "16px" : "auto",
        bottom: top ? "auto" : "16px",
        margin: "0",
        ...at,
        // A field's control fills its field: here, the window less the gutters.
        maxWidth: "calc(100vw - 32px)",
      });
    },
    { at: standing[place], top: row === "top" }
  );
};

/** The point at the top or the bottom of the window, at one of its edges or its centre. */
const pointAt = (
  page: Page,
  place: Place,
  row: Row
): { x: number; y: number } => {
  const { width = 0, height = 0 } = page.viewportSize() ?? {};
  const x = { left: 24, centre: width / 2, right: width - 24 }[place];
  return { x, y: row === "top" ? 24 : height - 24 };
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

/** Whether two boxes stand side by side, neither over the other. */
const beside = async (one: Locator, other: Locator): Promise<boolean> => {
  const [a, b] = await Promise.all([one.boundingBox(), other.boundingBox()]);
  return (
    a !== null && b !== null && (a.x >= b.x + b.width || a.x + a.width <= b.x)
  );
};

/** The arrow that opens a submenu and the one that closes it, in a reading direction. */
const arrows = (dir: Direction): [string, string] =>
  dir === "rtl" ? ["ArrowLeft", "ArrowRight"] : ["ArrowRight", "ArrowLeft"];

const setDirection = async (page: Page, dir: Direction): Promise<void> => {
  await page.evaluate((value) => {
    document.documentElement.dir = value;
  }, dir);
};

interface Menu {
  component: string;
  example: string;
  /** Stands the menu's trigger at a place and opens the top-level menu. */
  open: (page: Page, place: Place, row?: Row) => Promise<void>;
  sub: string;
  first: string;
  /** Two of the top-level menu's plain items: its first, and another. */
  items: [string, string];
}

const menus: Menu[] = [
  {
    component: "dropdown-menu",
    example: "submenu",
    open: async (page, place, row) => {
      const trigger = page.getByRole("button", { name: "Roadmap" });
      await stand(trigger, place, row);
      await trigger.click();
    },
    sub: "Share",
    first: "With the team",
    items: ["Open", "Rename"],
  },
  {
    component: "context-menu",
    example: "submenu",
    open: async (page, place, row = "top") => {
      // The area fills the window, so the menu opens at a point at the place.
      await page.getByLabel("Roadmap").evaluate((node: HTMLElement) => {
        Object.assign(node.style, { position: "fixed", inset: "0" });
      });
      const { x, y } = pointAt(page, place, row);
      await page.mouse.click(x, y, { button: "right" });
    },
    sub: "Share",
    first: "With the team",
    items: ["Open", "Rename"],
  },
  {
    component: "menubar",
    example: "editor",
    open: async (page, place, row) => {
      await stand(page.getByRole("menubar", { name: "Editor" }), place, row);
      await page.getByRole("menuitem", { name: "File" }).click();
    },
    sub: "Export",
    first: "As PDF",
    items: ["New document", "Duplicate"],
  },
];

/**
 * Opens a menu's submenu with the keys, sees both inside the gutter (and side by side where the
 * window has room for it), closes it and opens it again with the keys, and presses its first item.
 */
const staysOnScreen = async (
  page: Page,
  { component, example, open, sub, first }: Menu,
  dir: Direction,
  place: Place,
  row: Row
): Promise<void> => {
  await openExample(page, component, example);
  await setDirection(page, dir);
  await open(page, place, row);
  // The keys alone from here. A submenu over its parent may open under a pointer left resting on
  // the trigger, and when it closes, UI SDK reads the pointer leaving the parent as the person
  // moving off its rows, and lets go of the row the keys were on.
  await page.mouse.move(0, 0);
  const trigger = page.getByRole("menuitem", { name: sub });
  await expect(trigger).toBeVisible();
  await trigger.focus();
  // The keys follow the reading direction wherever the submenu opened.
  const [into, out] = arrows(dir);
  await page.keyboard.press(into);
  const item = page.getByRole("menuitem", { name: first });
  await expect(item).toBeFocused();
  const submenu = page.getByRole("menu", { name: sub, exact: true });
  const parent = page.getByRole("menu").filter({ has: trigger });
  await expect.poll(async () => await pastEdge(submenu)).toBe(0);
  expect(await pastEdge(parent)).toBe(0);
  if ((page.viewportSize()?.width ?? 0) >= desktop.width) {
    // With room, it stands beside its parent, never over it.
    expect(await beside(submenu, parent)).toBe(true);
  }
  await page.keyboard.press(out);
  await expect(item).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.keyboard.press(into);
  await expect(item).toBeFocused();
  await item.click();
  await expect(trigger).toBeHidden();
};

for (const menu of menus) {
  for (const size of windows) {
    for (const dir of directions) {
      for (const place of places) {
        test(`${menu.component}: a submenu stays on screen at ${size.width}×${size.height}, ${dir}, trigger at the top ${place}`, async ({
          page,
        }) => {
          await page.setViewportSize(size);
          await staysOnScreen(page, menu, dir, place, "top");
        });
      }
    }
  }
  for (const size of [phone, desktop]) {
    for (const place of places) {
      test(`${menu.component}: a submenu stays on screen at ${size.width}×${size.height}, trigger at the bottom ${place}`, async ({
        page,
      }) => {
        await page.setViewportSize(size);
        await staysOnScreen(page, menu, "ltr", place, "bottom");
      });
    }
  }
}

test.describe("at 200% zoom on a 1440×900 screen", () => {
  // Zoom halves the window in CSS pixels and doubles the pixels to each.
  test.use({ viewport: { width: 720, height: 450 }, deviceScaleFactor: 2 });
  for (const menu of menus) {
    for (const dir of directions) {
      for (const place of places) {
        test(`${menu.component}: a submenu stays on screen, ${dir}, trigger at the ${place}`, async ({
          page,
        }) => {
          await staysOnScreen(page, menu, dir, place, "top");
        });
      }
    }
  }
});

for (const size of [phone, { width: 320, height: 640 }, desktop]) {
  for (const dir of directions) {
    for (const place of places) {
      test(`menubar: a submenu's submenu stays on screen at ${size.width}, ${dir}, menubar at the ${place}`, async ({
        page,
      }) => {
        await page.setViewportSize(size);
        await openExample(page, "menubar", "editor");
        await setDirection(page, dir);
        await stand(page.getByRole("menubar", { name: "Editor" }), place);
        await page.getByRole("menuitem", { name: "File" }).click();
        const [into, out] = arrows(dir);
        await page.getByRole("menuitem", { name: "Export" }).focus();
        await page.keyboard.press(into);
        await expect(
          page.getByRole("menuitem", { name: "As PDF" })
        ).toBeFocused();
        await page.keyboard.press("End");
        const image = page.getByRole("menuitem", { name: "As an image" });
        await expect(image).toBeFocused();
        await page.keyboard.press(into);
        const png = page.getByRole("menuitem", { name: "PNG" });
        await expect(png).toBeFocused();
        const levels = ["File", "Export", "As an image"].map((name) =>
          page.getByRole("menu", { name, exact: true })
        );
        await Promise.all(
          levels.map(async (level) => {
            await expect.poll(async () => await pastEdge(level)).toBe(0);
          })
        );
        const [file, exported, images] = levels;
        if (
          size.width === desktop.width &&
          file !== undefined &&
          exported !== undefined &&
          images !== undefined
        ) {
          expect(await beside(exported, file)).toBe(true);
          expect(await beside(images, exported)).toBe(true);
        }
        await page.keyboard.press(out);
        await expect(png).toBeHidden();
        await expect(image).toBeFocused();
        await page.keyboard.press(into);
        await png.click();
        await expect(image).toBeHidden();
      });
    }
  }
}

// The parent's width changes nothing but where the submenu may stand: beside it, the submenu has
// all the room on its side (here, words long enough to take the widest a popup grows), and over
// it, its item's width.
const parents = [
  { name: "narrow", width: "100px" },
  { name: "ordinary", width: null },
  { name: "wide", width: `${popupWidth}px` },
] as const;

for (const size of [phone, desktop]) {
  for (const parentWidth of parents) {
    for (const place of places) {
      test(`dropdown-menu: a submenu takes the room beside a ${parentWidth.name} parent at ${size.width}, trigger at the ${place}`, async ({
        page,
      }) => {
        await page.setViewportSize(size);
        await openExample(page, "dropdown-menu", "submenu");
        const roadmap = page.getByRole("button", { name: "Roadmap" });
        await stand(roadmap, place);
        await roadmap.click();
        const share = page.getByRole("menuitem", { name: "Share" });
        const parent = page.getByRole("menu").filter({ has: share });
        if (parentWidth.width !== null) {
          await parent.evaluate((node: HTMLElement, width) => {
            node.style.setProperty("--damsko-menu-width", width);
          }, parentWidth.width);
        }
        await share.focus();
        await page.keyboard.press("ArrowRight");
        const team = page.getByRole("menuitem", { name: "With the team" });
        await expect(team).toBeFocused();
        await team.evaluate((item) => {
          const words = document
            .createTreeWalker(item, NodeFilter.SHOW_TEXT)
            .nextNode();
          if (words !== null) {
            words.textContent =
              "With the team, the board and everyone who follows the roadmap";
          }
        });
        const submenu = page.getByRole("menu", { name: "Share", exact: true });
        // Where the submenu stands, once UI SDK has placed it for its new words, and whether it
        // takes the room it has there.
        const where = async (): Promise<string> => {
          const [own, theirs, item] = await Promise.all([
            submenu.boundingBox(),
            parent.boundingBox(),
            share.boundingBox(),
          ]);
          if (own === null || theirs === null || item === null) {
            return "not drawn";
          }
          if ((await pastEdge(submenu)) > 0 || (await pastEdge(parent)) > 0) {
            return "past the gutter";
          }
          if (await beside(submenu, parent)) {
            // To the gutter on its side, or as wide as a popup grows.
            const reach =
              own.x > theirs.x
                ? size.width - gutter - own.x
                : own.x + own.width - gutter;
            return Math.abs(own.width - Math.min(reach, popupWidth)) <= 1
              ? "beside, all its room"
              : `beside, ${own.width}px of ${reach}px`;
          }
          return Math.abs(own.width - item.width) <= 1
            ? "over, its item's width"
            : `over, ${own.width}px for an item of ${item.width}px`;
        };
        await expect
          .poll(where)
          .toMatch(
            size.width === desktop.width
              ? /^beside, all its room$/u
              : /^(?:beside, all its room|over, its item's width)$/u
          );
        if (size.width === desktop.width) {
          const box = await submenu.boundingBox();
          expect(box?.width).toBeCloseTo(popupWidth, 0);
        }
      });
    }
  }
}

/** Opens the submenu at the left of a phone, where it stands over its parent. */
const openOver = async (
  page: Page,
  { component, example, open, sub, first }: Menu
) => {
  await openExample(page, component, example);
  await open(page, "left");
  const trigger = page.getByRole("menuitem", { name: sub });
  await trigger.tap();
  await expect(page.getByRole("menuitem", { name: first })).toBeVisible();
  const submenu = page.getByRole("menu", { name: sub, exact: true });
  const parent = page.getByRole("menu").filter({ has: trigger });
  await expect.poll(async () => await beside(submenu, parent)).toBe(false);
  return { submenu, parent };
};

/** After going back: the parent is still open, and another of its items can be picked. */
const picksAnother = async (
  page: Page,
  { first, items: [, another] }: Menu,
  parent: Locator
) => {
  await expect(page.getByRole("menuitem", { name: first })).toBeHidden();
  await expect(parent).toBeVisible();
  await page.getByRole("menuitem", { name: another }).tap();
  await expect(parent).toBeHidden();
};

test.describe("from a submenu over its parent, a press goes back one level", () => {
  test.use({ viewport: phone, hasTouch: true, isMobile: true });

  for (const menu of menus) {
    test(`${menu.component}: a tap on a parent's row still showing closes the submenu alone, without pressing the row`, async ({
      page,
    }) => {
      const { parent } = await openOver(page, menu);
      const row = await page
        .getByRole("menuitem", { name: menu.items[0] })
        .boundingBox();
      if (row === null) {
        throw new Error("The parent's first row is not drawn.");
      }
      await page.touchscreen.tap(row.x + row.width / 2, row.y + row.height / 2);
      await picksAnother(page, menu, parent);
    });

    test(`${menu.component}: a tap outside both menus closes the submenu alone`, async ({
      page,
    }) => {
      const { parent } = await openOver(page, menu);
      await page.touchscreen.tap(phone.width - 8, phone.height - 8);
      await picksAnother(page, menu, parent);
    });

    test(`${menu.component}: a tap outside a submenu that covers its whole parent closes the submenu alone`, async ({
      page,
    }) => {
      const { submenu, parent } = await openOver(page, menu);
      // As tall as the window less its gutters, as a long submenu is.
      await submenu.evaluate((node: HTMLElement) => {
        node.style.minHeight = "calc(100vh - 32px)";
      });
      const covered = async () =>
        await parent.evaluate((node) =>
          [...node.querySelectorAll('[role="menuitem"]')].every((row) => {
            const box = row.getBoundingClientRect();
            const top = document.elementFromPoint(
              box.x + box.width / 2,
              box.y + box.height / 2
            );
            return top?.closest('[role="menu"]') !== node;
          })
        );
      await expect.poll(covered).toBe(true);
      await page.touchscreen.tap(gutter / 2, gutter / 2);
      await picksAnother(page, menu, parent);
    });
  }
});

for (const { component, example, open, sub, first } of menus) {
  test(`${component}: on a desktop, a press outside a submenu beside its parent closes the whole menu`, async ({
    page,
  }) => {
    await page.setViewportSize(desktop);
    await openExample(page, component, example);
    await open(page, "left");
    await page.getByRole("menuitem", { name: sub }).click();
    await expect(page.getByRole("menuitem", { name: first })).toBeVisible();
    await page.mouse.click(desktop.width - 8, desktop.height - 8);
    await expect(page.getByRole("menu")).toHaveCount(0);
  });
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
        await page.setViewportSize(phone);
        await openExample(page, component, example);
        await setDirection(page, dir);
        await stand(trigger(page), place);
        await open(trigger(page));
        await expect(popup(page)).toBeVisible();
        await expect.poll(async () => await pastEdge(popup(page))).toBe(0);
      });
    }
  }
}
