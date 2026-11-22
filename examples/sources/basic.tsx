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
  MailIcon,
  MessageSquareIcon,
} from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const sources: {
  title: string;
  origin?: string;
  href: string;
  icon: IconData;
}[] = [
  {
    title: "Churn by region, Q3",
    origin: "Finance / Reports",
    href: "#churn",
    icon: FilePdfIcon,
  },
  {
    title: "Onboarding plan, autumn",
    origin: "Customer success / Plans",
    href: "#plan",
    icon: FileDocIcon,
  },
  {
    title: "Message in #customer-success",
    origin: "Chat · Tuesday 14:02",
    href: "#message",
    icon: MessageSquareIcon,
  },
  {
    title: "Re: onboarding for the new team",
    origin: "Email · Monday 09:41",
    href: "#email",
    icon: MailIcon,
  },
  {
    title: "How onboarding shapes the first year",
    href: "https://research.example.com/onboarding",
    icon: GlobeIcon,
  },
];

const layout = stylex.create({
  answer: { display: "grid", gap: space["4"], width: "100%", maxWidth: 640 },
  words: {
    margin: 0,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    color: colors.bodyForeground,
  },
});

// An answer with what it drew on folded under it: the pile says how many. Press it to open the
// list, and again to fold it. A source on another site shows its host, read from its address.
export default function SourcesBasic() {
  return (
    <div {...stylex.props(layout.answer)}>
      <p {...stylex.props(layout.words)}>
        Churn in the north fell from 6.1% to 4.6% last quarter, after every new
        team got a guided first week from August. Customers asked for it by
        name, and the quarterly review called it the one change tied to churn.
      </p>
      <Sources>
        <SourcesTrigger count={sources.length}>
          {sources.map((source) => (
            <SourceIcon key={source.href}>
              <Icon icon={source.icon} />
            </SourceIcon>
          ))}
        </SourcesTrigger>
        <SourcesContent>
          {sources.map((source) => (
            <Source
              key={source.href}
              title={source.title}
              origin={source.origin}
              href={source.href}
            >
              <SourceIcon>
                <Icon icon={source.icon} />
              </SourceIcon>
            </Source>
          ))}
        </SourcesContent>
      </Sources>
    </div>
  );
}
