import { InlineEdit } from "@grasp-os/ui/components/inline-edit";
import { useState } from "react";

const taken = new Set(["Roadmap", "Budget"]);

// Saving takes a moment: the field waits, read only, and says that it works. A name with one
// already taken in it (Roadmap, Budget) fails, and the field keeps the words typed so they can be
// changed.
export default function InlineEditAsync() {
  const [name, setName] = useState("Planning notes");
  return (
    <InlineEdit
      aria-label="Document name"
      value={name}
      onSubmit={async (next) => {
        await new Promise((done) => {
          setTimeout(done, 600);
        });
        if ([...taken].some((word) => next.includes(word))) {
          throw new Error(`${next} is taken`);
        }
        setName(next);
      }}
    />
  );
}
