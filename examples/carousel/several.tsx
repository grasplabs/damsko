import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@grasp-os/ui/components/carousel";
import {
  colors,
  font,
  media,
  radius,
  size,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 640 },
  slide: {
    display: "grid",
    placeItems: "center",
    boxSizing: "border-box",
    aspectRatio: "1",
    borderRadius: radius.base,
    cornerShape: radius.shape,
    backgroundColor: colors.muted,
    boxShadow: size.borderStrong,
    // Its edge is a shadow, which forced colours drop: a real one there.
    borderWidth: { default: 0, [media.forcedColors]: 1 },
    borderStyle: "solid",
    borderColor: "currentColor",
    fontSize: font.headingSm,
    fontWeight: font.weightMedium,
    fontVariantNumeric: "tabular-nums",
  },
});

const rooms = [
  "Studio A",
  "Studio B",
  "Library",
  "Workshop",
  "Kitchen",
  "Garden room",
  "Loft",
];

// Three a view, going round: Next on the last page comes back to the first.
export default function CarouselSeveral() {
  return (
    <div {...stylex.props(layout.box)}>
      <Carousel aria-label="Rooms to book" slidesPerPage={3} loop>
        <CarouselContent>
          {rooms.map((room) => (
            <CarouselItem key={room}>
              <div {...stylex.props(layout.slide)}>{room}</div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
