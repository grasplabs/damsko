"use client";

import { Button } from "@grasp-os/ui/components/button";
import { Heading } from "@grasp-os/ui/components/heading";
import { Text } from "@grasp-os/ui/components/text";
import * as stylex from "@stylexjs/stylex";
import { useRef, useState } from "react";

const layout = stylex.create({
  section: { display: "grid", gap: 12, justifyItems: "start" },
});

// The section's only button goes once it is pressed, so focus goes to the section's heading,
// never to the top of the page: the next Tab goes on from there.
export default function HeadingFocus() {
  const [requested, setRequested] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  return (
    <section {...stylex.props(layout.section)}>
      <Heading level={2} size="sm" tabIndex={-1} ref={heading}>
        Your data
      </Heading>
      {requested ? (
        <Text size="sm">We are preparing your export and will email you.</Text>
      ) : (
        <Button
          variant="outline"
          onClick={() => {
            setRequested(true);
            heading.current?.focus();
          }}
        >
          Request an export
        </Button>
      )}
    </section>
  );
}
