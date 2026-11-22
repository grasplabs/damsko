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

// A held yes that does not get through the first time: the held button says so in place, the
// request still waits, and the next hold goes through.
export default function ConfirmationHeldFailed() {
  const [state, setState] = useState<State>("approval-requested");
  const [approved, setApproved] = useState<boolean | undefined>();
  const [tries, setTries] = useState(0);
  const respond = async (yes: boolean) => {
    setTries(tries + 1);
    await wait(700);
    if (yes && tries === 0) {
      throw new Error("The payment could not be sent");
    }
    setApproved(yes);
    setState("approval-responded");
  };
  return (
    <Confirmation state={state} approval={{ id: "refund", approved }}>
      <ConfirmationTitle>
        <ConfirmationRequest>
          Refund £86 to Lin Hayashi for order 5521.
        </ConfirmationRequest>
        <ConfirmationAccepted>
          Refunded: £86 to Lin Hayashi.
        </ConfirmationAccepted>
        <ConfirmationRejected>
          Declined: nothing is refunded.
        </ConfirmationRejected>
      </ConfirmationTitle>
      <ConfirmationActions>
        <ConfirmationAction
          variant="outline"
          onClick={async () => await respond(false)}
        >
          Decline
        </ConfirmationAction>
        <ConfirmationAction hold onClick={async () => await respond(true)}>
          Refund £86
        </ConfirmationAction>
      </ConfirmationActions>
    </Confirmation>
  );
}
