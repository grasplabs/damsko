import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCardTrigger,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselItem,
  InlineCitationCarouselNext,
  InlineCitationCarouselPrev,
  InlineCitationQuote,
  InlineCitationSource,
  InlineCitationText,
} from "@grasp-os/ui/components/inline-citation";
import { colors, font } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  paragraph: {
    maxWidth: 480,
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textBaseLine,
    color: colors.bodyForeground,
  },
});

const sources = [
  {
    url: "https://research.example.com/remote-teams/2026",
    title: "Remote teams, a year on",
    description: "A survey of 1,200 teams on how they plan their weeks.",
    quote: "Teams that plan on Mondays ship more by Friday.",
  },
  {
    url: "https://blog.example.org/planning/weekly-rhythm",
    title: "A weekly rhythm",
    description: "One team's notes on keeping plans short.",
    quote: "We keep the plan to one page, and read it aloud.",
  },
  {
    url: "https://www.example.net/guides/meetings",
    title: "Fewer, shorter meetings",
    description: "A guide to the meetings worth keeping.",
    quote: "",
  },
];

// One claim, three sources: the chip says the first one's host and how many more, and the card
// pages through them, one at a time, with a quote from each where there is one.
export default function InlineCitationSeveral() {
  return (
    <p {...stylex.props(layout.paragraph)}>
      <InlineCitation>
        <InlineCitationText>
          Teams that plan their week together, briefly, at its start finish more
          of what they planned.
        </InlineCitationText>{" "}
        <InlineCitationCard>
          <InlineCitationCardTrigger
            sources={sources.map((source) => source.url)}
          />
          <InlineCitationCardBody>
            <InlineCitationCarousel>
              <InlineCitationCarouselHeader>
                <InlineCitationCarouselPrev />
                <InlineCitationCarouselIndex />
                <InlineCitationCarouselNext />
              </InlineCitationCarouselHeader>
              <InlineCitationCarouselContent>
                {sources.map((source) => (
                  <InlineCitationCarouselItem key={source.url}>
                    <InlineCitationSource
                      title={source.title}
                      url={source.url}
                      description={source.description}
                    />
                    {source.quote === "" ? null : (
                      <InlineCitationQuote>{source.quote}</InlineCitationQuote>
                    )}
                  </InlineCitationCarouselItem>
                ))}
              </InlineCitationCarouselContent>
            </InlineCitationCarousel>
          </InlineCitationCardBody>
        </InlineCitationCard>
      </InlineCitation>
    </p>
  );
}
