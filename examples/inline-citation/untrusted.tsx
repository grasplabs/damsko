import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCardTrigger,
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

// An address from the model that leads nowhere safe (a script): the chip says Source, and the card
// shows the address as words, not a link.
const unsafe = ["java", "script:alert(document.cookie)"].join("");

export default function InlineCitationUntrusted() {
  return (
    <p {...stylex.props(layout.paragraph)}>
      <InlineCitation>
        <InlineCitationText>
          The report was published in the spring.
        </InlineCitationText>{" "}
        <InlineCitationCard>
          <InlineCitationCardTrigger sources={[unsafe]} />
          <InlineCitationCardBody>
            <InlineCitationSource title="Annual report" url={unsafe} />
          </InlineCitationCardBody>
        </InlineCitationCard>
      </InlineCitation>
    </p>
  );
}
