import { BrandIcon } from "@grasp-os/ui/components/brand-icon";
import { colors, font, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

import { logos } from "./logos";
import type { Brand } from "./logos";

const sources: { brand: Brand; name: string; detail: string }[] = [
  { brand: "slack", name: "Slack", detail: "3 channels, synced 5 minutes ago" },
  {
    brand: "google-drive",
    name: "Google Drive",
    detail: "Shared folder, 128 files",
  },
  { brand: "notion", name: "Notion", detail: "Product wiki, 46 pages" },
];

const layout = stylex.create({
  list: {
    display: "grid",
    gap: space["3"],
    width: "100%",
    maxWidth: size.popupWidth,
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: space["3"],
    fontFamily: font.sans,
  },
  words: { display: "grid", minWidth: 0 },
  name: {
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
  },
  detail: {
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
});

// In a list of connected sources the name is in the words, so the mark is decorative.
export default function BrandIconsSources() {
  return (
    <ul {...stylex.props(layout.list)}>
      {sources.map((source) => (
        <li key={source.brand} {...stylex.props(layout.row)}>
          <BrandIcon {...logos[source.brand]} size="lg" decorative />
          <span {...stylex.props(layout.words)}>
            <span {...stylex.props(layout.name)}>{source.name}</span>
            <span {...stylex.props(layout.detail)}>{source.detail}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
