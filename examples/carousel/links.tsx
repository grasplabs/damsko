import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@grasp-os/ui/components/carousel";
import { focusRingInset } from "@grasp-os/ui/lib/styles";
import {
  colors,
  font,
  media,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 640 },
  slide: {
    display: "grid",
    alignContent: "end",
    gap: space["1"],
    boxSizing: "border-box",
    minHeight: 160,
    padding: space["4"],
    borderRadius: radius.base,
    cornerShape: radius.shape,
    color: colors.foreground,
    backgroundColor: colors.card,
    boxShadow: size.borderStrong,
    textDecoration: "none",
    // Its edge is a shadow, which forced colours drop: a real one there.
    borderWidth: { default: 0, [media.forcedColors]: 1 },
    borderStyle: "solid",
    borderColor: "currentColor",
  },
  title: { fontSize: font.textSm, fontWeight: font.weightMedium },
  words: { fontSize: font.textSm, color: colors.mutedForeground },
});

const rooms = [
  { name: "Studio A", seats: "Seats 6" },
  { name: "Studio B", seats: "Seats 4" },
  { name: "Library", seats: "Seats 12" },
  { name: "Workshop", seats: "Seats 8" },
];

// Each slide is a link. The slides' window clips what stands past its edge, a ring round a slide
// with it, so a slide that takes focus draws its ring just inside its own edge (`focusRingInset`).
export default function CarouselLinks() {
  return (
    <div {...stylex.props(layout.box)}>
      <Carousel aria-label="Rooms" slidesPerPage={2}>
        <CarouselContent>
          {rooms.map((room) => (
            <CarouselItem key={room.name}>
              <a
                href={`#${room.name.toLowerCase().replace(" ", "-")}`}
                {...stylex.props(layout.slide, focusRingInset)}
              >
                <span {...stylex.props(layout.title)}>{room.name}</span>
                <span {...stylex.props(layout.words)}>{room.seats}</span>
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
