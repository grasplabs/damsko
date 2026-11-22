import { InlineEdit } from "@grasp-os/ui/components/inline-edit";
import { useState } from "react";

// A press on the name, Enter or F2 opens the field; Enter or leaving it saves, Escape keeps the
// name as it was.
export default function InlineEditBasic() {
  const [name, setName] = useState("Quarterly review");
  return (
    <InlineEdit aria-label="Document name" value={name} onSubmit={setName} />
  );
}
