"use client";

import {
  SidePanel,
  SidePanelContent,
  SidePanelHeader,
  SidePanelSection,
  SidePanelText,
} from "@grasp-os/ui/components/side-panel";
import { size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: size.sidePanelWidth, height: 480 },
  text: { margin: 0 },
});

const steps = [
  "Read the week's new deals from the pipeline, and the notes on each.",
  "Group them by owner, and by the stage each moved to this week.",
  "Write one paragraph per owner: what moved, what stalled, and why.",
  "End with the three deals most likely to close this month.",
  "Send it to the sales channel every Monday before nine.",
];

// A long text in a card: it stands short, faded at its foot, and its corner button opens it in place.
export default function SidePanelTextExample() {
  return (
    <div {...stylex.props(layout.box)}>
      <SidePanel aria-label="Agent details">
        <SidePanelHeader title="Weekly pipeline digest" />
        <SidePanelContent>
          <SidePanelSection title="Instructions">
            <SidePanelText>
              {steps.map((step) => (
                <p key={step} {...stylex.props(layout.text)}>
                  {step}
                </p>
              ))}
            </SidePanelText>
          </SidePanelSection>
        </SidePanelContent>
      </SidePanel>
    </div>
  );
}
