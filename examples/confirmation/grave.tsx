"use client";

import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationDetails,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationTitle,
} from "@grasp-os/ui/components/confirmation";
import type { ConfirmationProps } from "@grasp-os/ui/components/confirmation";
import { DollarSignIcon, UsersIcon } from "@grasp-os/ui/lib/icons";
import { useState } from "react";

type State = ConfirmationProps["state"];

// Money that leaves cannot come back: the yes is held, or confirmed once more after a tap, and its
// words say what it does.
export default function ConfirmationGrave() {
  const [state, setState] = useState<State>("approval-requested");
  const [approved, setApproved] = useState<boolean | undefined>();
  const respond = (yes: boolean) => {
    setApproved(yes);
    setState("approval-responded");
  };
  return (
    <Confirmation state={state} approval={{ id: "invoice", approved }}>
      <ConfirmationTitle>
        <ConfirmationRequest>
          Pay Northwind Supplies £1,240 for invoice 2024-118.
        </ConfirmationRequest>
        <ConfirmationAccepted>
          Paid: £1,240 to Northwind Supplies.
        </ConfirmationAccepted>
        <ConfirmationRejected>Declined: nothing is paid.</ConfirmationRejected>
      </ConfirmationTitle>
      <ConfirmationDetails
        items={[
          {
            icon: DollarSignIcon,
            label: "£1,240.00",
            detail: "From the operations account",
          },
          {
            icon: UsersIcon,
            label: "Northwind Supplies",
            detail: "Gets an email with the receipt",
          },
        ]}
      />
      <ConfirmationActions>
        <ConfirmationAction
          variant="outline"
          onClick={() => {
            respond(false);
          }}
        >
          Decline
        </ConfirmationAction>
        <ConfirmationAction
          hold
          onClick={() => {
            respond(true);
          }}
        >
          Pay £1,240
        </ConfirmationAction>
      </ConfirmationActions>
    </Confirmation>
  );
}
