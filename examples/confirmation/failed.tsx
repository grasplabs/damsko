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
import { useState } from "react";

const wait = async (ms: number) =>
  await new Promise((done) => {
    setTimeout(done, ms);
  });

type State = ConfirmationProps["state"];

// The first answer does not get through: the pressed button says so in place, the request still
// waits, and the next press goes through.
export default function ConfirmationFailed() {
  const [state, setState] = useState<State>("approval-requested");
  const [approved, setApproved] = useState<boolean | undefined>();
  const [tries, setTries] = useState(0);
  const respond = async (yes: boolean) => {
    setTries(tries + 1);
    await wait(700);
    if (tries % 2 === 0) {
      throw new Error("The answer could not be sent");
    }
    setApproved(yes);
    setState("approval-responded");
  };
  return (
    <Confirmation state={state} approval={{ id: "renewal", approved }}>
      <ConfirmationTitle>
        <ConfirmationRequest>
          Send the renewal offer to 42 customers in the north.
        </ConfirmationRequest>
        <ConfirmationAccepted>
          Approved: the offer goes out.
        </ConfirmationAccepted>
        <ConfirmationRejected>Declined: no offer is sent.</ConfirmationRejected>
      </ConfirmationTitle>
      <ConfirmationActions>
        <ConfirmationAction
          variant="outline"
          onClick={async () => await respond(false)}
        >
          Decline
        </ConfirmationAction>
        <ConfirmationAction onClick={async () => await respond(true)}>
          Approve
        </ConfirmationAction>
      </ConfirmationActions>
    </Confirmation>
  );
}
