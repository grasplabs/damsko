"use client";

import { Badge } from "@grasp-os/ui/components/badge";
import { Button } from "@grasp-os/ui/components/button";
import { CheckIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  rows: { display: "grid", gap: 12, justifyItems: "start" },
  row: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 },
});

// Working on it: an invitation sending, a member being removed. The turning mark stands in the
// icon's place, so the badge keeps its width when it settles; with reduced motion it stands still.
// Its words are said politely, once each, as they change.
export default function BadgePending() {
  const [sending, setSending] = useState(true);
  const send = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
    }, 1500);
  };
  return (
    <div {...stylex.props(layout.rows)}>
      <div {...stylex.props(layout.row)}>
        <Badge
          loading={sending}
          icon={CheckIcon}
          variant={sending ? "default" : "success"}
        >
          {sending ? "Sending" : "Invited"}
        </Badge>
        <Button size="sm" variant="ghost" onClick={send}>
          Send again
        </Button>
      </div>
      <Badge loading>Being removed</Badge>
    </div>
  );
}
