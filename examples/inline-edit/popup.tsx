import { InlineEdit } from "@grasp-os/ui/components/inline-edit";
import { useState } from "react";

const taken = new Set(["Roadmap", "Budget"]);

// A title renamed in a popup: a press, Enter or F2 on the title opens a small popup beside it with
// the field, its words chosen, and Cancel and Save. The save takes a moment and waits; a name
// already taken fails, and the popup stays open with the words typed and why. Escape, Cancel or a
// press outside keep the name, and the focus goes back to the title.
export default function InlineEditPopup() {
  const [name, setName] = useState("Planning notes");
  return (
    <InlineEdit
      variant="popup"
      aria-label="Rename"
      value={name}
      maxLength={60}
      errorText="Could not rename: that name is already taken"
      onSubmit={async (next) => {
        await new Promise((done) => {
          setTimeout(done, 600);
        });
        if (taken.has(next)) {
          throw new Error(`${next} is taken`);
        }
        setName(next);
      }}
    />
  );
}
