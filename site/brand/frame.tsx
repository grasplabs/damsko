"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@grasp-os/ui/components/dialog";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  FloorPlanIcon,
  Icon,
} from "@grasp-os/ui/lib/icons";
import { focusRingInset, visuallyHidden } from "@grasp-os/ui/lib/styles";
import {
  colors,
  duration,
  font,
  media,
  radius,
  shadow,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
// The brand book's frame: no
// bar: two quiet controls stand over the top of the page, each on its own
// ground, Back to Damsko at the start and the floor plan at the end, then the room's walls. A wall
// is one idea on one screen: the exhibit, large, and its label beside it, as a museum hangs a
// label beside the work, so the exhibit and its rule are seen together. What can be picked up (a
// file, a value) waits in the exhibit's corner and shows under the pointer or with focus; on a
// touch screen it is always there. A room ends with a door to the next.
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { siteSize } from "../system/site-tokens.stylex";
import { frameWords, neighbours, roomHref, roomOf, rooms } from "./content";
import type { RoomId } from "./content";
import { wallMarker } from "./markers.stylex";
import { useStill } from "./still";

/** The room the controls take at the top: their inset, a 36px control, and a gap under it. */
const controlsRoom = "5.5rem";

const s = stylex.create({
  page: {
    minHeight: "100svh",
    backgroundColor: colors.background,
    color: colors.bodyForeground,
    fontFamily: font.sans,
  },
  // A page that the controls stand over: they are placed from its top.
  holder: { position: "relative" },
  // The two controls, over the top of the page at its inset, each on its own ground: no band, no
  // line, no tray. They stay at the top; the door at a room's end leads on from the foot.
  control: {
    position: "absolute",
    zIndex: 3,
    insetBlockStart: {
      default: space["6"],
      [media.maxSm]: space["4"],
    },
  },
  // The floor plan's own ground: the raised surface of what it stands over, opaque, with a hairline
  // and the low lift, in the button's own squircle (Back to Damsko is words only). Its words hold over the glass, the colour strip
  // and the sky; on a night room it is the night's raised surface with light ink, never a white
  // button. Each control has its own; there is no tray.
  ground: {
    display: "inline-grid",
    borderRadius: `min(${radius.xl}, calc(${size.controlDefault} / 2))`,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    color: colors.foreground,
    boxShadow: `inset 0 0 0 ${size.hairline} ${colors.border}, ${shadow.sm}`,
  },
  onNight: { colorScheme: "dark" },
  onLight: { colorScheme: "light" },
  // The floor plan stands over the label column, in the page's own look, where there is one; under
  // the sidebar's width the label goes below and it stands over the exhibit too.
  endOnNight: { colorScheme: { default: null, [media.maxLg]: "dark" } },
  endOnLight: { colorScheme: { default: null, [media.maxLg]: "light" } },
  start: {
    insetInlineStart: {
      default: space["6"],
      [media.maxSm]: space["4"],
    },
  },
  end: {
    insetInlineEnd: { default: space["6"], [media.maxSm]: space["4"] },
  },
  // ---- A wall
  wall: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr) 24rem",
      [media.maxLg]: "minmax(0, 1fr)",
    },
    minHeight: { default: "100svh", [media.maxLg]: 0 },
  },
  // The first wall starts at the very top: its exhibit and its words keep clear of the controls.
  firstExhibit: {
    paddingBlockStart: { default: 0, [media.maxLg]: controlsRoom },
  },
  firstLabel: {
    paddingBlockStart: {
      default: controlsRoom,
      [media.maxLg]: space["6"],
    },
  },
  exhibit: {
    position: "relative",
    display: "grid",
    placeItems: "center",
    minWidth: 0,
    minHeight: { default: 0, [media.maxLg]: "68svh" },
    overflow: "hidden",
    isolation: "isolate",
  },
  night: {
    colorScheme: "dark",
    backgroundColor: colors.brandNight,
    color: colors.bodyForeground,
  },
  light: {
    colorScheme: "light",
    backgroundColor: colors.brandPaper,
    color: colors.bodyForeground,
  },
  bleed: { placeItems: "stretch" },
  pickup: {
    position: "absolute",
    insetBlockEnd: { default: space["6"], [media.maxSm]: space["4"] },
    insetInlineStart: {
      default: space["6"],
      [media.maxSm]: space["4"],
    },
    zIndex: 2,
    // No tray: each control stands on the exhibit on its own ground (the quiet button's fill), with
    // the library's gap between them. A squircle never sits inside a pill.
    display: "flex",
    flexWrap: "wrap",
    gap: space["2"],
    opacity: {
      default: 0,
      [stylex.when.ancestor(":hover", wallMarker)]: 1,
      [stylex.when.ancestor(":focus-within", wallMarker)]: 1,
      [media.pointerCoarse]: 1,
    },
    transitionProperty: "opacity",
    transitionDuration: duration.hover,
    transitionTimingFunction: duration.ease,
  },
  beside: {
    display: "flex",
    flexWrap: "wrap",
    gap: space["2"],
    paddingBlockStart: space["2"],
  },
  label: {
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    gap: space["8"],
    paddingBlock: { default: space["8"], [media.maxSm]: space["6"] },
    paddingInline: { default: space["8"], [media.maxSm]: space["4"] },
    backgroundColor: `light-dark(${colors.background}, ${colors.muted})`,
    boxShadow: {
      default: `inset ${size.hairline} 0 0 ${colors.border}`,
      [media.maxLg]: `inset 0 calc(-1 * ${size.hairline}) 0 ${colors.border}`,
    },
  },
  roomLine: {
    margin: 0,
    display: "flex",
    gap: space["2"],
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
  },
  roomNumber: { fontVariantNumeric: "tabular-nums" },
  words: { display: "grid", gap: space["4"], alignContent: "center" },
  title: {
    margin: 0,
    fontFamily: font.serif,
    fontWeight: font.weightNormal,
    fontSize: font.headingXl,
    lineHeight: font.headingXlLine,
    letterSpacing: font.trackingTitle,
    color: colors.foreground,
  },
  rule: {
    margin: 0,
    fontFamily: font.serif,
    fontWeight: font.weightNormal,
    fontSize: font.headingMd,
    lineHeight: font.headingMdLine,
    letterSpacing: font.trackingTitle,
    color: colors.foreground,
    textWrap: "pretty",
  },
  detail: {
    margin: 0,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    color: colors.bodyForeground,
  },
  foot: { minHeight: 0 },
  // ---- The door to the next room
  door: {
    display: "grid",
    gridTemplateColumns: { default: "1fr 1fr", [media.maxSm]: "1fr" },
    boxShadow: `inset 0 ${size.hairline} 0 ${colors.border}`,
  },
  doorLink: {
    display: "grid",
    gap: space["1"],
    alignContent: "center",
    minHeight: { default: "14rem", [media.maxSm]: "9rem" },
    paddingInline: { default: space["10"], [media.maxSm]: space["4"] },
    color: colors.foreground,
    textDecorationLine: "none",
    backgroundColor: {
      default: colors.background,
      [media.hover]: { default: colors.background, ":hover": colors.muted },
    },
    transitionProperty: "background-color",
    transitionDuration: duration.hover,
  },
  doorNext: {
    justifyItems: "end",
    textAlign: "end",
    boxShadow: {
      default: `inset ${size.hairline} 0 0 ${colors.border}`,
      [media.maxSm]: `inset 0 ${size.hairline} 0 ${colors.border}`,
    },
  },
  doorWord: {
    display: "flex",
    alignItems: "center",
    gap: space["2"],
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
  },
  doorTitle: {
    fontFamily: font.serif,
    fontSize: font.headingLg,
    lineHeight: font.headingLgLine,
    letterSpacing: font.trackingTitle,
  },
  // ---- The floor plan
  // The plan: its cells divided by hairlines (the line's colour through the gaps), its own corner
  // clipping the corner cells, and its edge drawn as one unbroken ring over them, so the line runs
  // round each corner with no step. It stands inside the panel's body, at the body's inset.
  planFrame: { position: "relative", marginBlockStart: space["1"] },
  // The panel's own inset under the plan: the body has none at its foot when no footer follows.
  planFoot: {
    paddingBlockEnd: {
      default: space["6"],
      [media.maxSm]: `max(${space["6"]}, env(safe-area-inset-bottom))`,
    },
  },
  plan: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(3, minmax(0, 1fr))",
      [media.maxSm]: "repeat(2, minmax(0, 1fr))",
    },
    gap: size.hairline,
    margin: 0,
    padding: 0,
    listStyle: "none",
    backgroundColor: colors.border,
    borderRadius: radius.sm,
    cornerShape: radius.shape,
    overflow: "hidden",
  },
  planRing: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    borderRadius: radius.sm,
    cornerShape: radius.shape,
    boxShadow: `inset 0 0 0 ${size.hairline} ${colors.border}`,
  },
  cell: {
    position: "relative",
    display: "grid",
    alignContent: "space-between",
    gap: space["3"],
    minHeight: "5.5rem",
    padding: space["3"],
    backgroundColor: colors.card,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.subtleForeground,
    textDecorationLine: "none",
  },
  cellOpen: {
    color: colors.foreground,
    backgroundColor: {
      default: colors.card,
      [media.hover]: { default: colors.card, ":hover": colors.muted },
    },
  },
  cellHere: { backgroundColor: colors.muted },
  slot: { display: "grid" },
  entranceCell: {
    gridColumn: { default: "span 2", [media.maxSm]: "span 1" },
  },
  cellNumber: {
    fontVariantNumeric: "tabular-nums",
    color: colors.mutedForeground,
  },
  dot: {
    position: "absolute",
    insetBlockStart: space["3"],
    insetInlineEnd: space["3"],
    width: siteSize.frameDot,
    height: siteSize.frameDot,
    borderRadius: radius.circle,
    backgroundColor: colors.mint,
  },
});

/** The floor plan: every room as a cell of one plan, the open ones leading in. */
export const FloorPlan = ({
  here,
  scheme,
}: {
  here?: RoomId | "entrance";
  scheme?: stylex.StyleXStyles;
}) => (
  <Dialog>
    {/* The trigger's own ground and scheme, on the trigger alone: the panel is drawn beside it in
        this subtree and keeps the page's own look. */}
    <span {...stylex.props(s.ground, scheme)}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="default">
          <Icon icon={FloorPlanIcon} />
          {frameWords.plan}
        </Button>
      </DialogTrigger>
    </span>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{frameWords.planTitle}</DialogTitle>
        <DialogDescription>{frameWords.planLine}</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <div {...stylex.props(s.planFoot)}>
          <nav aria-label={frameWords.planTitle} {...stylex.props(s.planFrame)}>
            <ol {...stylex.props(s.plan)}>
              {rooms.map((room) => {
                const isHere = room.id === here;
                const body = (
                  <>
                    <span {...stylex.props(s.cellNumber)}>{room.number}</span>
                    <span>{room.title}</span>
                    {isHere && (
                      <span aria-hidden="true" {...stylex.props(s.dot)} />
                    )}
                  </>
                );
                return (
                  <li key={room.id} {...stylex.props(s.slot)}>
                    {room.open ? (
                      <a
                        href={roomHref(room.id)}
                        aria-current={isHere ? "page" : undefined}
                        {...stylex.props(
                          s.cell,
                          s.cellOpen,
                          isHere && s.cellHere,
                          focusRingInset
                        )}
                      >
                        {body}
                      </a>
                    ) : (
                      <span {...stylex.props(s.cell)}>
                        {body}
                        <span {...stylex.props(visuallyHidden)}>
                          {frameWords.closed}
                        </span>
                      </span>
                    )}
                  </li>
                );
              })}
              <li {...stylex.props(s.slot, s.entranceCell)}>
                <a
                  href="/brand"
                  aria-current={here === "entrance" ? "page" : undefined}
                  {...stylex.props(
                    s.cell,
                    s.cellOpen,
                    here === "entrance" && s.cellHere,
                    focusRingInset
                  )}
                >
                  <span {...stylex.props(s.cellNumber)}>00</span>
                  <span>{frameWords.entrance}</span>
                  {here === "entrance" && (
                    <span aria-hidden="true" {...stylex.props(s.dot)} />
                  )}
                </a>
              </li>
            </ol>
            <span aria-hidden="true" {...stylex.props(s.planRing)} />
          </nav>
        </div>
      </DialogBody>
    </DialogContent>
  </Dialog>
);

/** Where Back leads: the page of the site the reader came into the book from, kept for the visit,
 * or Get started. */
const fromKey = "damsko-brand-from";
const useWayBack = () => {
  const [href, setHref] = useState(frameWords.backHref);
  useEffect(() => {
    try {
      const from = document.referrer === "" ? null : new URL(document.referrer);
      if (
        from &&
        from.origin === location.origin &&
        !from.pathname.startsWith("/brand")
      ) {
        sessionStorage.setItem(
          fromKey,
          `${from.pathname}${from.search}${from.hash}`
        );
      }
      const kept = sessionStorage.getItem(fromKey);
      if (kept !== null && kept.startsWith("/")) {
        setHref(kept);
      }
    } catch {
      // No storage: Back leads to Get started.
    }
  }, []);
  return href;
};

/** Where the controls stand over night at the top of a page: the entrance's glass, and the rooms
 * whose first wall is the night (rooms/*.tsx). Every other room opens on paper. */
const nightAtTop: ReadonlySet<RoomId | "entrance"> = new Set([
  "entrance",
  "grasp",
  "logo",
  "voice",
  "motion",
]);

/** The two controls over the top of a page: Back to Damsko at the start, the floor plan at the end.
 * Back comes first in the tab order, then the floor plan, then the page. */
export const Controls = ({ here }: { here?: RoomId | "entrance" }) => {
  const back = useWayBack();
  const night = here !== undefined && nightAtTop.has(here);
  const end =
    here === "entrance"
      ? night
        ? s.onNight
        : s.onLight
      : night
        ? s.endOnNight
        : s.endOnLight;
  return (
    <>
      {/* Back to Damsko is words only: no ground, no border, no lift; its ink follows what it
          stands over. */}
      <div {...stylex.props(s.control, s.start, night ? s.onNight : s.onLight)}>
        <Button variant="ghost" size="default" asChild>
          <a href={back}>
            <Icon icon={ArrowLeftIcon} />
            {frameWords.back}
          </a>
        </Button>
      </div>
      <div {...stylex.props(s.control, s.end)}>
        <FloorPlan here={here} scheme={end} />
      </div>
    </>
  );
};

/** The controls in the one-file book, over each room: Back to the cover, and the contents. */
const StillControls = ({ here }: { here: RoomId }) => (
  <>
    <div
      {...stylex.props(
        s.control,
        s.start,
        nightAtTop.has(here) ? s.onNight : s.onLight
      )}
    >
      <Button variant="ghost" size="default" asChild>
        <a href={`#${frameWords.coverId}`}>
          <Icon icon={ArrowLeftIcon} />
          {frameWords.backToCover}
        </a>
      </Button>
    </div>
    <div
      {...stylex.props(
        s.control,
        s.end,
        s.ground,
        nightAtTop.has(here) ? s.endOnNight : s.endOnLight
      )}
    >
      <Button variant="ghost" size="default" asChild>
        <a href={`#${frameWords.contentsId}`}>
          <Icon icon={FloorPlanIcon} />
          {frameWords.plan}
        </a>
      </Button>
    </div>
  </>
);

export interface WallProps {
  room: RoomId;
  /** The exhibit, large. */
  exhibit: ReactNode;
  /** What the exhibit stands on: night, the brand's paper, or its own ground (`bleed`). */
  ground: "night" | "light" | "bleed";
  /** The rule, in one line. */
  rule: string;
  /** One more line, only where the exhibit cannot say it. */
  detail?: string;
  /** The first wall of a room: the room's name, large. */
  first?: boolean;
  /** What can be picked up from the exhibit: a file, a value. */
  pickup?: ReactNode;
  /** What can be picked up for the whole wall, standing with its words, off the exhibit: for an
   * exhibit with no quiet corner to lay a pick-up on (the light). */
  beside?: ReactNode;
}

/** One idea on one screen: the exhibit and its label beside it. */
export const Wall = ({
  room,
  exhibit,
  ground,
  rule,
  detail,
  first = false,
  pickup,
  beside,
}: WallProps) => {
  const info = roomOf(room);
  const still = useStill();
  return (
    <section
      {...stylex.props(wallMarker, s.wall)}
      aria-label={first ? undefined : rule}
    >
      <div
        {...stylex.props(
          s.exhibit,
          ground === "night" && s.night,
          ground === "light" && s.light,
          ground === "bleed" && s.bleed,
          first && ground !== "bleed" && s.firstExhibit
        )}
      >
        {exhibit}
        {pickup !== undefined && !still && (
          <div data-pickup="" {...stylex.props(s.pickup)}>
            {pickup}
          </div>
        )}
      </div>
      <div {...stylex.props(s.label, first && s.firstLabel)}>
        {first ? (
          <span />
        ) : (
          <p {...stylex.props(s.roomLine)}>
            <span {...stylex.props(s.roomNumber)}>{info.number}</span>
            <span>{info.title}</span>
          </p>
        )}
        <div {...stylex.props(s.words)}>
          {first && !still && <h1 {...stylex.props(s.title)}>{info.title}</h1>}
          {first && still && <h2 {...stylex.props(s.title)}>{info.title}</h2>}
          <p {...stylex.props(s.rule)}>{rule}</p>
          {detail !== undefined && <p {...stylex.props(s.detail)}>{detail}</p>}
          {beside !== undefined && !still && (
            <div {...stylex.props(s.beside)}>{beside}</div>
          )}
        </div>
        <span {...stylex.props(s.foot)} />
      </div>
    </section>
  );
};

/** The end of a room: the way back, and the door to the next. */
export const Door = ({ room }: { room: RoomId }) => {
  const { previous, next } = neighbours(room);
  return (
    <nav aria-label={frameWords.rooms} {...stylex.props(s.door)}>
      {previous ? (
        <a
          href={roomHref(previous.id)}
          {...stylex.props(s.doorLink, focusRingInset)}
        >
          <span {...stylex.props(s.doorWord)}>
            <Icon icon={ArrowLeftIcon} />
            {frameWords.previous}
          </span>
          <span {...stylex.props(s.doorTitle)}>{previous.title}</span>
        </a>
      ) : (
        <a href="/brand" {...stylex.props(s.doorLink, focusRingInset)}>
          <span {...stylex.props(s.doorWord)}>
            <Icon icon={ArrowLeftIcon} />
            {frameWords.previous}
          </span>
          <span {...stylex.props(s.doorTitle)}>{frameWords.entrance}</span>
        </a>
      )}
      {next ? (
        <a
          href={roomHref(next.id)}
          {...stylex.props(s.doorLink, s.doorNext, focusRingInset)}
        >
          <span {...stylex.props(s.doorWord)}>
            {frameWords.next}
            <Icon icon={ArrowRightIcon} />
          </span>
          <span {...stylex.props(s.doorTitle)}>{next.title}</span>
        </a>
      ) : (
        <a
          href="/brand"
          {...stylex.props(s.doorLink, s.doorNext, focusRingInset)}
        >
          <span {...stylex.props(s.doorWord)}>
            {frameWords.next}
            <Icon icon={ArrowRightIcon} />
          </span>
          <span {...stylex.props(s.doorTitle)}>{frameWords.entrance}</span>
        </a>
      )}
    </nav>
  );
};

/** A room: the controls, its walls, its door. In the one-file book, its walls under its own anchor,
 * with the way back to the cover and to the contents. */
export const Room = ({ id, children }: { id: RoomId; children: ReactNode }) => {
  const still = useStill();
  if (still) {
    return (
      <section
        id={`room-${id}`}
        data-brand-room={id}
        {...stylex.props(s.holder)}
      >
        <StillControls here={id} />
        {children}
      </section>
    );
  }
  return (
    <div {...stylex.props(s.page, s.holder)} data-brand-room={id}>
      <Controls here={id} />
      <main>{children}</main>
      <Door room={id} />
    </div>
  );
};
