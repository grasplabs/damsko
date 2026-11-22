"use client";

import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationTitle,
} from "@grasp-os/ui/components/confirmation";
import type { ConfirmationProps } from "@grasp-os/ui/components/confirmation";
import { size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: {
    display: "grid",
    gap: space["3"],
    width: "100%",
    maxWidth: size.confirmationWidth,
  },
});

/** One confirmation in one state. */
const Case = ({
  state,
  approved,
  request,
}: {
  state: ConfirmationProps["state"];
  approved?: boolean;
  request: string;
}) => (
  <Confirmation state={state} approval={{ id: request, approved }}>
    <ConfirmationTitle>
      <ConfirmationRequest>{request}</ConfirmationRequest>
      <ConfirmationAccepted>Approved: {request}</ConfirmationAccepted>
      <ConfirmationRejected>Declined: {request}</ConfirmationRejected>
    </ConfirmationTitle>
    <ConfirmationActions>
      <ConfirmationAction variant="outline">Decline</ConfirmationAction>
      <ConfirmationAction>Approve</ConfirmationAction>
    </ConfirmationActions>
  </Confirmation>
);

// By state: waiting with its answers; approved and declined, each the decision alone. While the
// tool's input still comes, nothing is drawn.
export default function ConfirmationStates() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Case
        state="input-streaming"
        request="Book the large meeting room for Friday"
      />
      <Case
        state="approval-requested"
        request="Invite 4 people to the workspace"
      />
      <Case
        state="approval-responded"
        approved
        request="Move 3 reports into the Archive folder"
      />
      <Case
        state="output-denied"
        approved={false}
        request="Email the draft to the whole team"
      />
    </div>
  );
}
