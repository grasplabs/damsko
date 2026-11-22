import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCardTrigger,
  InlineCitationSource,
  InlineCitationText,
} from "@grasp-os/ui/components/inline-citation";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  answer: {
    display: "grid",
    gap: space["3"],
    width: "100%",
    maxWidth: 480,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textBaseLine,
    color: colors.bodyForeground,
  },
  paragraph: { margin: 0 },
});

interface Cited {
  url: string;
  title: string;
  description: string;
}

const sources = {
  streaming: {
    url: "https://docs.example.com/rendering/streaming",
    title: "Streaming a page",
    description: "How a server sends a page to the browser in pieces.",
  },
  fallback: {
    url: "https://guide.example.org/loading/fallbacks",
    title: "Loading fallbacks",
    description: "Show a placeholder until a slow part has loaded.",
  },
  chunked: {
    url: "https://www.example.net/http/chunked-transfer",
    title: "Chunked transfer",
    description: "Send a response as a series of chunks.",
  },
} satisfies Record<string, Cited>;

const Citation = ({ source, words }: { source: Cited; words: string }) => (
  <InlineCitation>
    <InlineCitationText>{words}</InlineCitationText>{" "}
    <InlineCitationCard>
      <InlineCitationCardTrigger sources={[source.url]} />
      <InlineCitationCardBody>
        <InlineCitationSource
          title={source.title}
          url={source.url}
          description={source.description}
        />
      </InlineCitationCardBody>
    </InlineCitationCard>
  </InlineCitation>
);

// Each chip names where its source lives. Rest on it, or tab to it, for the source's title, a line
// about it and a link to it.
export default function InlineCitationBasic() {
  return (
    <div {...stylex.props(layout.answer)}>
      <p {...stylex.props(layout.paragraph)}>
        <Citation
          source={sources.streaming}
          words="A server can send a page in pieces, so it shows before every request has finished."
        />
      </p>
      <p {...stylex.props(layout.paragraph)}>
        Wrap a slow part of the page in a boundary and the placeholder goes
        first.{" "}
        <Citation
          source={sources.fallback}
          words="When the data is ready, the finished part streams into the same response and takes the placeholder's place."
        />{" "}
        <Citation
          source={sources.chunked}
          words="It all runs over chunked transfer, so there is nothing extra to set up."
        />
      </p>
    </div>
  );
}
