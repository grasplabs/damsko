"use client";

import { Inspector } from "@grasp-os/ui/blocks/inspector-01/inspector-01";
import { Button } from "@grasp-os/ui/components/button";
import { Text } from "@grasp-os/ui/components/text";
import { FileIcon } from "@grasp-os/ui/lib/icons";
import { size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  column: {
    display: "grid",
    gap: space["3"],
    width: "100%",
    maxWidth: size.sidePanelWidth,
  },
  toggle: { justifySelf: "start" },
  panel: { height: 520 },
  footer: { marginInline: space.sidePanelPadding },
});

// While the record loads (`loading`), its head waits as placeholders and each fact still on its way
// waits as a line; the sections stand as they will. Under them, the panel's own small print
// (`footer`).
export default function InspectorLoading() {
  const [loading, setLoading] = useState(true);
  return (
    <div {...stylex.props(layout.column)}>
      <Button
        variant="outline"
        size="sm"
        style={layout.toggle}
        onClick={() => {
          setLoading(!loading);
        }}
      >
        {loading ? "Show the record" : "Load again"}
      </Button>
      <Inspector
        aria-label="Source details"
        style={layout.panel}
        icon={FileIcon}
        loading={loading}
        title={loading ? "" : "Supplier contracts 2026"}
        description={loading ? "" : "Uploaded by Mara Jensen"}
        sections={[
          {
            id: "version",
            title: "This version",
            facts: [
              {
                id: "added",
                label: "Added",
                value: loading ? undefined : "12 November 2026",
                loading,
              },
              {
                id: "pages",
                label: "Pages",
                value: loading ? undefined : "48",
                loading,
              },
            ],
          },
        ]}
        footer={
          <Text as="p" size="sm" color="muted" style={layout.footer}>
            Earlier versions are kept for 400 days.
          </Text>
        }
      />
    </div>
  );
}
