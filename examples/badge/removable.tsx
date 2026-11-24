"use client";

import { Badge } from "@grasp-os/ui/components/badge";
import { size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: space["2"],
    // A badge's × stands at its end, the next badge's at that one's far end: room for a whole
    // touch target between them.
    "--tap-room-inline": size.tapTarget,
    justifyContent: "center",
    minHeight: size.badgeLabelHeight,
  },
});

export default function BadgeRemovable() {
  const [tags, setTags] = useState(["Design", "Research", "Hiring"]);
  return (
    <div {...stylex.props(layout.row)}>
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          onRemove={() => {
            setTags((current) => current.filter((item) => item !== tag));
          }}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
