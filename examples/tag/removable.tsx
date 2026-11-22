"use client";

import { Tag } from "@grasp-os/ui/components/tag";
import { size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: space["2"],
    justifyContent: "center",
    minHeight: size.tagHeight,
  },
});

export default function TagRemovable() {
  const [tags, setTags] = useState(["Design", "Research", "Hiring"]);
  return (
    <div {...stylex.props(layout.row)}>
      {tags.map((tag) => (
        <Tag
          key={tag}
          onRemove={() => {
            setTags((current) => current.filter((item) => item !== tag));
          }}
        >
          {tag}
        </Tag>
      ))}
    </div>
  );
}
