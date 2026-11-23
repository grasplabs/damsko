import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@grasp-os/ui/components/carousel";
import { I18nProvider } from "@grasp-os/ui/lib/i18n";
import { colors, radius, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 480 },
  slide: {
    display: "grid",
    alignContent: "end",
    boxSizing: "border-box",
    minHeight: 160,
    padding: space["5"],
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: size.borderStrong,
  },
});

const stories = ["De lente-lancering", "Een nieuw kantoor", "Leveranciersweek"];

// Every word it says, in another language, from the product's catalogue: its buttons, its row of
// marks and each mark, what a screen reader calls it and its slides, and each slide's name.
const dutch = {
  carousel: {
    carousel: "carrousel",
    previous: "Vorige",
    next: "Volgende",
    pages: (label: string) => `Pagina's van ${label}`,
    page: (page: number) => `Pagina ${page}`,
    slide: "dia",
    slideLabel: (slide: number, count: number) => `${slide} van ${count}`,
  },
};

export default function CarouselLabels() {
  return (
    <I18nProvider locale="nl-NL" catalog={dutch}>
      <div {...stylex.props(layout.box)}>
        <Carousel aria-label="Uitgelichte verhalen">
          <CarouselContent>
            {stories.map((story) => (
              <CarouselItem key={story}>
                <article {...stylex.props(layout.slide)}>{story}</article>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </I18nProvider>
  );
}
