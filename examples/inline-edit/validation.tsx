import { InlineEdit } from "@grasp-os/ui/components/inline-edit";
import { useState } from "react";

// A name longer than 24 letters is refused before it is sent: the field stays open, marked wrong,
// and says why.
export default function InlineEditValidation() {
  const [name, setName] = useState("Design team");
  return (
    <InlineEdit
      aria-label="Team name"
      value={name}
      onSubmit={setName}
      validate={(next) => (next.length > 24 ? "Up to 24 letters" : undefined)}
    />
  );
}
