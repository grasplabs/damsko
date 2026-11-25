// A popup stays whole on the screen, a gutter from each edge, wherever its trigger stands. A
// submenu opens beside its parent when that side has room, on the other side when only that one
// has, and over its parent when neither has (a phone), and its items can still be pressed. Every
// menu with a submenu, on phones from 320 wide, in a short window, on a desktop and at 200% zoom,
// in both reading directions, with the trigger at the left, the centre and the right, at the top
// and at the bottom, and a submenu's submenu; under a pinch zoom a submenu settles and stays put;
// a submenu beside a narrow, an ordinary and a wide parent takes the room beside it; a submenu over
// its parent stands beside it again once the window widens; after a tap on a parent's row goes
// back one level, a tap outside closes the whole menu; and the top-level popups at a phone's width.
import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { openExample } from "./example.ts";

/** The space a popup keeps from the window's edges (popup.gutter). */
const gutter = 16;
/** The widest a popup grows for its words (popup.width, 20rem). */
const popupWidth = 320;
/** The width a menu takes at least (menu-width). */
const menuWidth = 249;

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
  /** The top-level menu's first item, above its submenu's trigger. */
  topItem: string;
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
    topItem: "Open",
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
    topItem: "Open",
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
    topItem: "New document",
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

// A pinch zoom shows a part of the page, narrower than the window: UI SDK places a submenu in
// that part, and the submenu settles there, beside its parent or over it, and stays put.
for (const size of [
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  desktop,
]) {
  for (const scale of [1, 2, 3]) {
    test(`dropdown-menu: under a pinch zoom of ${scale}× at ${size.width}×${size.height}, a submenu settles and stays put`, async ({
      page,
    }) => {
      await page.setViewportSize(size);
      await openExample(page, "dropdown-menu", "submenu");
      const cdp = await page.context().newCDPSession(page);
      await cdp.send("Emulation.setPageScaleFactor", {
        pageScaleFactor: scale,
      });
      await expect
        .poll(async () => await page.evaluate(() => visualViewport?.scale))
        .toBe(scale);
      const roadmap = page.getByRole("button", { name: "Roadmap" });
      await stand(roadmap, "left");
      await roadmap.focus();
      await page.keyboard.press("Enter");
      const share = page.getByRole("menuitem", { name: "Share" });
      await expect(share).toBeVisible();
      await share.focus();
      await page.keyboard.press("ArrowRight");
      const team = page.getByRole("menuitem", { name: "With the team" });
      await expect(team).toBeFocused();
      const submenu = page.getByRole("menu", { name: "Share", exact: true });
      const parent = page.getByRole("menu").filter({ has: share });
      // Its box on each of the next 60 frames.
      const frames = await submenu.evaluate(
        async (node) =>
          // oxlint-disable-next-line promise/avoid-new -- the next frames, which have no promise of their own
          await new Promise<string[]>((resolve) => {
            const boxes: string[] = [];
            const frame = () => {
              const { x, y, width, height } = node.getBoundingClientRect();
              boxes.push(`${x},${y} ${width}×${height}`);
              if (boxes.length < 60) {
                requestAnimationFrame(frame);
              } else {
                resolve(boxes);
              }
            };
            requestAnimationFrame(frame);
          })
      );
      expect(new Set(frames)).toEqual(new Set([frames[0]]));
      expect(await pastEdge(submenu)).toBe(0);
      const [own, theirs] = await Promise.all([
        submenu.boundingBox(),
        parent.boundingBox(),
      ]);
      const over =
        own !== null &&
        theirs !== null &&
        own.x >= theirs.x &&
        own.x + own.width <= theirs.x + theirs.width;
      expect(over || (await beside(submenu, parent))).toBe(true);
      await team.click();
      await expect(share).toBeHidden();
    });
  }
}

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
      const article = parentWidth.name === "ordinary" ? "an" : "a";
      test(`dropdown-menu: a submenu takes the room beside ${article} ${parentWidth.name} parent at ${size.width}, trigger at the ${place}`, async ({
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

// Over its parent, a submenu is its item's width only while there is no room beside it: once the
// window widens, it stands beside its parent at a menu's width, and so does one opened again.
test("dropdown-menu: a submenu over its parent at 390 stands beside it once the window widens to 1280", async ({
  page,
}) => {
  await page.setViewportSize(phone);
  await openExample(page, "dropdown-menu", "submenu");
  const roadmap = page.getByRole("button", { name: "Roadmap" });
  await stand(roadmap, "left");
  await roadmap.click();
  const share = page.getByRole("menuitem", { name: "Share" });
  const team = page.getByRole("menuitem", { name: "With the team" });
  const submenu = page.getByRole("menu", { name: "Share", exact: true });
  const parent = page.getByRole("menu").filter({ has: share });
  const where = async (): Promise<string> => {
    const [own, item] = await Promise.all([
      submenu.boundingBox(),
      share.boundingBox(),
    ]);
    if (own === null || item === null || (await pastEdge(submenu)) > 0) {
      return "not whole on the screen";
    }
    if (await beside(submenu, parent)) {
      return `beside, ${Math.round(own.width)}px`;
    }
    return Math.abs(own.width - item.width) <= 1
      ? "over, its item's width"
      : `over, ${own.width}px for an item of ${item.width}px`;
  };
  const openSub = async () => {
    await share.focus();
    await page.keyboard.press("ArrowRight");
    await expect(team).toBeFocused();
  };
  const closeSub = async () => {
    await page.keyboard.press("ArrowLeft");
    await expect(team).toBeHidden();
  };
  await page.mouse.move(0, 0);
  await openSub();
  await expect.poll(where).toBe("over, its item's width");
  // Widened while it is open.
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect.poll(where).toBe(`beside, ${menuWidth}px`);
  await closeSub();
  await page.setViewportSize(phone);
  await openSub();
  await expect.poll(where).toBe("over, its item's width");
  // Widened while it is closed, then opened again.
  await closeSub();
  await page.setViewportSize({ width: 1280, height: 900 });
  await openSub();
  await expect.poll(where).toBe(`beside, ${menuWidth}px`);
});

/** Taps the middle of an element. */
const tapOn = async (page: Page, element: Locator): Promise<void> => {
  const box = await element.boundingBox();
  if (box === null) {
    throw new Error("The element is not drawn.");
  }
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
};

// A tap on a parent's row still showing goes back one level without pressing the row (UI SDK
// closes only the menus a press lands outside of); a tap outside every menu then closes them all.
test.describe("on a touch phone, back one level by a tap on a parent's row, then a tap outside", () => {
  test.use({ viewport: phone, hasTouch: true, isMobile: true });

  for (const { component, example, open, sub, first, topItem } of menus) {
    test(`${component}: a tap outside closes the whole menu`, async ({
      page,
    }) => {
      await openExample(page, component, example);
      await open(page, "left");
      const trigger = page.getByRole("menuitem", { name: sub });
      await trigger.tap();
      const item = page.getByRole("menuitem", { name: first });
      await expect(item).toBeVisible();
      const submenu = page.getByRole("menu", { name: sub, exact: true });
      const parent = page.getByRole("menu").filter({ has: trigger });
      await expect.poll(async () => await beside(submenu, parent)).toBe(false);
      await tapOn(page, page.getByRole("menuitem", { name: topItem }));
      await expect(item).toBeHidden();
      await expect(parent).toBeVisible();
      await page.touchscreen.tap(phone.width - 8, phone.height - 8);
      await expect(page.getByRole("menu")).toHaveCount(0);
    });
  }

  test("menubar: from a submenu's submenu, a tap outside closes the whole menu", async ({
    page,
  }) => {
    await openExample(page, "menubar", "editor");
    await stand(page.getByRole("menubar", { name: "Editor" }), "left");
    await page.getByRole("menuitem", { name: "File" }).tap();
    const exportRow = page.getByRole("menuitem", { name: "Export" });
    await exportRow.tap();
    const image = page.getByRole("menuitem", { name: "As an image" });
    await image.tap();
    const png = page.getByRole("menuitem", { name: "PNG" });
    await expect(png).toBeVisible();
    const images = page.getByRole("menu", { name: "As an image", exact: true });
    const exported = page.getByRole("menu", { name: "Export", exact: true });
    await expect.poll(async () => await beside(images, exported)).toBe(false);
    await tapOn(page, page.getByRole("menuitem", { name: "As PDF" }));
    await expect(png).toBeHidden();
    await expect(exported).toBeVisible();
    await page.touchscreen.tap(phone.width - 8, phone.height - 8);
    await expect(page.getByRole("menu")).toHaveCount(0);
  });
});

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
