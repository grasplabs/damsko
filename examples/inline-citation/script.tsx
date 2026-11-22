// A citation a spec drives (tests/inline-citation.spec.ts): three sources, and
// `window.inlineCitationScript.drop()` to take the last away while the card is open, as an answer
// still being written revises its sources.
"use client";

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
  InlineCitationSource,
  InlineCitationText,
} from "@grasp-os/ui/components/inline-citation";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    inlineCitationScript?: { drop: () => void };
  }
}

const all = [
  { url: "https://research.example.com/teams", title: "Remote teams" },
  { url: "https://blog.example.org/rhythm", title: "A weekly rhythm" },
  { url: "https://www.example.net/meetings", title: "Fewer meetings" },
];

export default function InlineCitationScript() {
  const [sources, setSources] = useState(all);
  useEffect(() => {
    window.inlineCitationScript = {
      drop: () => {
        setSources((was) => was.slice(0, -1));
      },
    };
    return () => {
      delete window.inlineCitationScript;
    };
  }, []);
  return (
    <p>
      <InlineCitation>
        <InlineCitationText>
          Teams that plan together finish more.
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
                    />
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
