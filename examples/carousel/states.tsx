import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@grasp-os/ui/components/carousel";
import { font, media, size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const COARSE = media.pointerCoarse;

const look = stylex.create({
  // A window one row tall onto the carousel; the slides above its controls are cut off.
  frame: {
    position: "relative",
    width: { default: 176, [COARSE]: 248 },
    maxWidth: "100%",
    height: size.tapTarget,
    // Clipped, not a box that scrolls: a target past its edge adds no room to scroll.
    overflow: "clip",
  },
  // Onto one button or one mark.
  small: { width: size.tapTarget },
  // The carousel at its own size, placed from the window's foot: its controls are its last row,
  // 44px tall on a touch screen, where the marks grow.
  inner: {
    position: "absolute",
    // On a touch screen each mark grows to 44px: three marks, the gap and both buttons need 248px,
    // or the row wraps and the window shows the wrong part of it (two slivers of buttons).
    width: { default: 176, [COARSE]: 248 },
    insetBlockEnd: {
      default: `calc((${size.tapTarget} - ${size.controlSm}) / 2)`,
      [COARSE]: 0,
    },
    insetInlineStart: 0,
  },
  // Next is the last control on the row.
  next: {
    insetInlineStart: "auto",
    insetInlineEnd: `calc((${size.tapTarget} - ${size.controlSm}) / 2)`,
  },
  // The first page's mark, the start of the row.
  mark: {
    insetInlineStart: {
      default: `calc((${size.tapTarget} - ${size.carouselDotTarget}) / 2)`,
      [COARSE]: 0,
    },
  },
  slide: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
});

const rooms = ["Studio A", "Studio B", "Library"];

// One carousel's controls in one state. The docs draw it once per state; hover, keyboard focus and
// pressed are forced from the controls' own CSS, and the page is its prop. Shown alone, a mark's
// carousel holds one slide, so the forced ring falls on that mark only.
export default function CarouselState({
  page = 1,
  show = "controls",
}: {
  page?: number;
  show?: "controls" | "next" | "mark";
}) {
  return (
    <div
      data-window=""
      {...stylex.props(look.frame, show !== "controls" && look.small)}
    >
      {/* Onto one control, the rest of the carousel lies outside the window: inert, so Tab never
          stops on a control nobody can see. With all its controls in view it stays live. */}
      <div
        inert={show !== "controls"}
        {...stylex.props(
          look.inner,
          show === "next" && look.next,
          show === "mark" && look.mark
        )}
      >
        <Carousel aria-label="Rooms to book" defaultPage={page}>
          <CarouselContent>
            {(show === "mark" ? rooms.slice(0, 1) : rooms).map((room) => (
              <CarouselItem key={room}>
                <p {...stylex.props(look.slide)}>{room}</p>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
}
