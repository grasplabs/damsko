import {
  Source,
  SourceIcon,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@grasp-os/ui/components/sources";
import { FilePdfIcon, Icon } from "@grasp-os/ui/lib/icons";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  answer: { width: "100%", maxWidth: 640 },
  picture: {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  favicon: { display: "block", width: space["4"], height: space["4"] },
});

// The marks are yours: SourceIcon holds whatever you map a source to, an icon for a file, a site's
// own small icon, a person's portrait.
export default function SourcesMarks() {
  const file = <Icon icon={FilePdfIcon} />;
  const site = <img src="/icon.svg" alt="" {...stylex.props(layout.favicon)} />;
  const person = (
    <img src="/people/avatar-1.svg" alt="" {...stylex.props(layout.picture)} />
  );
  return (
    <Sources defaultOpen style={layout.answer}>
      <SourcesTrigger count={3}>
        <SourceIcon>{file}</SourceIcon>
        <SourceIcon>{site}</SourceIcon>
        <SourceIcon>{person}</SourceIcon>
      </SourcesTrigger>
      <SourcesContent>
        <Source
          title="Churn by region, Q3"
          origin="Finance / Reports"
          href="#churn"
        >
          <SourceIcon>{file}</SourceIcon>
        </Source>
        <Source
          title="How onboarding shapes the first year"
          href="https://research.example.com/onboarding"
        >
          <SourceIcon>{site}</SourceIcon>
        </Source>
        <Source title="Amara Okafor" origin="Customer success" href="#amara">
          <SourceIcon>{person}</SourceIcon>
        </Source>
      </SourcesContent>
    </Sources>
  );
}
