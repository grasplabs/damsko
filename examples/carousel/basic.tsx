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
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 480 },
  slide: {
    display: "grid",
    alignContent: "end",
    gap: space["1"],
    boxSizing: "border-box",
    minHeight: 220,
    padding: space["5"],
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: size.borderStrong,
    // Its edge is a shadow, which forced colours drop: a real one there.
    borderWidth: { default: 0, [media.forcedColors]: 1 },
    borderStyle: "solid",
    borderColor: "currentColor",
  },
  title: {
    margin: 0,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    fontWeight: font.weightMedium,
  },
  words: { margin: 0, color: colors.mutedForeground },
});

const stories = [
  {
    title: "The spring launch, in review",
    words: "What worked, and what we would change.",
  },
  {
    title: "A new home for the team",
    words: "Moving floors in March, and what it means for you.",
  },
  {
    title: "Supplier week",
    words: "Five visits, three new partners and one long train ride.",
  },
  {
    title: "Hiring for the summer",
    words: "Four roles open across design and operations.",
  },
];

// One slide a view. Previous, Next, a swipe or the arrow keys move it; the marks say where you are.
export default function CarouselBasic() {
  return (
    <div {...stylex.props(layout.box)}>
      <Carousel aria-label="Featured stories">
        <CarouselContent>
          {stories.map((story) => (
            <CarouselItem key={story.title}>
              <article {...stylex.props(layout.slide)}>
                <h3 {...stylex.props(layout.title)}>{story.title}</h3>
                <p {...stylex.props(layout.words)}>{story.words}</p>
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
