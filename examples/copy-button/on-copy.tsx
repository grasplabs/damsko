import { CopyButton } from "@grasp-os/ui/components/copy-button";
import { Input } from "@grasp-os/ui/components/input";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useRef, useState } from "react";

const layout = stylex.create({
  stack: { display: "grid", gap: space[2], justifyItems: "start" },
  row: {
    display: "flex",
    alignItems: "center",
    gap: space[2],
    "--tap-room-inline": `calc(${space[2]} / 2)`,
  },
  said: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
  },
});

// What it copies is read at the press, from a field that may have changed since it was drawn, and
// `onCopy` hears what was copied, once, only when it is on the clipboard.
export default function CopyButtonOnCopy() {
  const note = useRef<HTMLInputElement>(null);
  const [copies, setCopies] = useState<string[]>([]);
  return (
    <div {...stylex.props(layout.stack)}>
      <div {...stylex.props(layout.row)}>
        <Input
          ref={note}
          aria-label="Invite note"
          defaultValue="Join the review on Thursday"
        />
        <CopyButton
          value={() => note.current?.value ?? ""}
          aria-label="Copy the note"
          onCopy={(copied) => {
            setCopies((before) => [...before, copied]);
          }}
        />
      </div>
      <p {...stylex.props(layout.said)}>
        {copies.length === 0
          ? "Nothing copied yet"
          : `Copies: ${String(copies.length)}, last: ${copies.at(-1) ?? ""}`}
      </p>
    </div>
  );
}
