"use client";

import { Button } from "@grasp-os/ui/components/button";
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
import { FileIcon } from "@grasp-os/ui/lib/icons";
import { useState } from "react";

const wait = async (ms: number) =>
  await new Promise((done) => {
    setTimeout(done, ms);
  });

type State = ConfirmationProps["state"];

// The request, what it touches, and the two answers. An answer works in place, then the title says
// what was decided and the answers go; a yes can be taken back with Undo, which asks again. The
// state is the page's, as the AI SDK gives a tool's.
export default function ConfirmationBasic() {
  const [state, setState] = useState<State>("approval-requested");
  const [approved, setApproved] = useState<boolean | undefined>();
  const respond = async (yes: boolean) => {
    await wait(yes ? 900 : 600);
    setApproved(yes);
    setState("approval-responded");
  };
  return (
    <Confirmation state={state} approval={{ id: "move-reports", approved }}>
      <ConfirmationTitle>
        <ConfirmationRequest>
          Move 3 reports into the Archive folder.
        </ConfirmationRequest>
        <ConfirmationAccepted>
          Approved: the reports go to Archive.
        </ConfirmationAccepted>
        <ConfirmationRejected>
          Declined: the reports stay where they are.
        </ConfirmationRejected>
      </ConfirmationTitle>
      <ConfirmationAccepted>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setApproved(undefined);
            setState("approval-requested");
          }}
        >
          Undo
        </Button>
      </ConfirmationAccepted>
      <ConfirmationDetails
        items={[
          {
            icon: FileIcon,
            label: "Quarterly summary.pdf",
            detail: "From Reports to Archive",
          },
          {
            icon: FileIcon,
            label: "Supplier list for the spring.xlsx",
            detail: "From Reports to Archive",
          },
          {
            icon: FileIcon,
            label: "Team survey results.pdf",
            detail: "From Reports to Archive",
          },
        ]}
      />
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
