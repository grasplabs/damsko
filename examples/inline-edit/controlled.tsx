import { Button } from "@grasp-os/ui/components/button";
import { Heading } from "@grasp-os/ui/components/heading";
import { InlineEdit } from "@grasp-os/ui/components/inline-edit";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  row: { display: "flex", alignItems: "center", gap: 12 },
});

// The page keeps whether it is open: a Rename button beside the title opens it too. The title is
// the heading's own words, so it reads as a heading until it is changed.
export default function InlineEditControlled() {
  const [title, setTitle] = useState("Launch plan");
  const [editing, setEditing] = useState(false);
  return (
    <div {...stylex.props(layout.row)}>
      <Heading level={2}>
        <InlineEdit
          aria-label="Title"
          value={title}
          onSubmit={setTitle}
          editing={editing}
          onEditingChange={setEditing}
        />
      </Heading>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setEditing(true);
        }}
      >
        Rename
      </Button>
    </div>
  );
}
