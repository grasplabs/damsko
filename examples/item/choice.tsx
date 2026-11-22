"use client";

import { BrandIcon } from "@grasp-os/ui/components/brand-icon";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@grasp-os/ui/components/item";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { logos } from "../brand-icon/logos";

const layout = stylex.create({
  tiles: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(12rem, 100%), 1fr))",
    gap: space["3"],
    width: "100%",
    maxWidth: 640,
  },
  said: { margin: 0, color: colors.mutedForeground, fontSize: font.textSm },
});

// Items as choices: each row one button (`onClick`), named by its title alone, where it runs said
// after it. No chevron: it chooses, it goes nowhere.
export default function ItemChoice() {
  const [chosen, setChosen] = useState("nothing yet");
  return (
    <div {...stylex.props(layout.tiles)}>
      {[
        {
          id: "Anthropic",
          brand: "claude" as const,
          region: "European Union",
        },
        {
          id: "OpenAI",
          brand: "chatgpt" as const,
          region: "United States",
        },
      ].map((each) => (
        <Item
          key={each.id}
          variant="outline"
          size="sm"
          onClick={() => {
            setChosen(each.id);
          }}
        >
          <ItemMedia align="center">
            <BrandIcon {...logos[each.brand]} size="lg" decorative />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{each.id}</ItemTitle>
            <ItemDescription>{each.region}</ItemDescription>
          </ItemContent>
        </Item>
      ))}
      <p {...stylex.props(layout.said)}>Chosen: {chosen}</p>
    </div>
  );
}
