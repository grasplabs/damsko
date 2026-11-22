import { InlineEdit } from "@grasp-os/ui/components/inline-edit";
import { useState } from "react";

// The page keeps it open: `editing` is held true, so each Enter saves and the field stays, for the
// next name.
export default function InlineEditKeptOpen() {
  const [name, setName] = useState("Draft one");
  const [saved, setSaved] = useState(0);
  return (
    <p>
      <InlineEdit
        aria-label="Draft name"
        value={name}
        onSubmit={(next) => {
          setName(next);
          setSaved((count) => count + 1);
        }}
        editing
      />{" "}
      Saved {saved} {saved === 1 ? "time" : "times"}
    </p>
  );
}
