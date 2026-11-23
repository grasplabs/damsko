import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@grasp-os/ui/components/carousel";
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
  box: { width: "100%", maxWidth: 360 },
  // Running down, the content is given its height: one slide a view.
  content: { height: 200 },
  slide: {
    display: "grid",
    alignContent: "end",
    boxSizing: "border-box",
    height: "100%",
    padding: space["5"],
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: size.borderStrong,
    // Its edge is a shadow, which forced colours drop: a real one there.
    borderWidth: { default: 0, [media.forcedColors]: 1 },
    borderStyle: "solid",
    borderColor: "currentColor",
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
});

const notes = [
  "Doors open at nine",
  "Coffee in the library",
  "Talks from ten in Studio A",
  "Lunch in the garden room",
];

// Down: the up and down arrows page it, and Previous and Next point up and down.
export default function CarouselVertical() {
  return (
    <div {...stylex.props(layout.box)}>
      <Carousel aria-label="The day's notes" orientation="vertical">
        <CarouselContent style={layout.content}>
          {notes.map((note) => (
            <CarouselItem key={note}>
              <p {...stylex.props(layout.slide)}>{note}</p>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
