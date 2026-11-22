import {
  Source,
  SourceIcon,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@grasp-os/ui/components/sources";
import {
  FileDocIcon,
  FilePdfIcon,
  GlobeIcon,
  Icon,
} from "@grasp-os/ui/lib/icons";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  answer: { display: "grid", gap: space["4"], width: "100%", maxWidth: 640 },
  words: {
    margin: 0,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    color: colors.bodyForeground,
  },
});

// Sources the person cannot open (`locked`) or that could not be opened (`gone`) still say what
// they are, and why not; neither is a link.
export default function SourcesAccess() {
  return (
    <div {...stylex.props(layout.answer)}>
      <p {...stylex.props(layout.words)}>
        Churn in the north is down to 4.6%. Whether prices change next year is
        in the board's memo, and the competitor's prices could not be read just
        now.
      </p>
      <Sources defaultOpen>
        <SourcesTrigger count={3}>
          <SourceIcon>
            <Icon icon={FilePdfIcon} />
          </SourceIcon>
          <SourceIcon>
            <Icon icon={FileDocIcon} />
          </SourceIcon>
          <SourceIcon>
            <Icon icon={GlobeIcon} />
          </SourceIcon>
        </SourcesTrigger>
        <SourcesContent>
          <Source
            title="Churn by region, Q3"
            origin="Finance / Reports"
            href="#churn"
          >
            <SourceIcon>
              <Icon icon={FilePdfIcon} />
            </SourceIcon>
          </Source>
          <Source
            title="Board pricing memo"
            origin="Leadership / Board"
            access="locked"
          >
            <SourceIcon>
              <Icon icon={FileDocIcon} />
            </SourceIcon>
          </Source>
          <Source
            title="Competitor price list"
            href="https://prices.example.com/list"
            access="gone"
          >
            <SourceIcon>
              <Icon icon={GlobeIcon} />
            </SourceIcon>
          </Source>
        </SourcesContent>
      </Sources>
    </div>
  );
}
