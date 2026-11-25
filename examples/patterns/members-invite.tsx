"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@grasp-os/ui/components/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@grasp-os/ui/components/select";
import { TagsInput } from "@grasp-os/ui/components/tags-input";
import { Icon, PlusIcon } from "@grasp-os/ui/lib/icons";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { roles } from "./members-roles";

const layout = stylex.create({
  fields: { display: "grid", gap: space["4"] },
  control: { width: "100%" },
});

const teams = [
  { value: "finance", label: "Finance" },
  { value: "operations", label: "Operations" },
  { value: "sales", label: "Sales" },
];

/** Someone invited: the address and the role they were given. */
export interface Invited {
  email: string;
  role: string;
}

const isAddress = (text: string) =>
  /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/u.test(text);

// A stand-in for the real request: it takes a moment, and an address that starts with "bounce"
// cannot be reached, so the dialog can show a send that went only in part.
const sendInvites = async (addresses: string[]) => {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return {
    sent: addresses.filter((each) => !each.startsWith("bounce")),
    failed: addresses.filter((each) => each.startsWith("bounce")),
  };
};

const listed = (addresses: string[]) => addresses.join(", ");

// Why the addresses cannot go, checked on Send only, never while someone is still typing.
const problemWith = (addresses: string[]): string => {
  const bad = addresses.filter((each) => !isAddress(each));
  if (addresses.length === 0) {
    return "Enter the email of at least one person to invite.";
  }
  if (bad.length > 0) {
    return `${bad.length === 1 ? "This is" : "These are"} not an email address: ${listed(bad)}. Correct or remove ${bad.length === 1 ? "it" : "them"}.`;
  }
  return "";
};

// Settings > Members, Invite: the addresses as tags (paste many at once; a wrong one is marked once
// Send is pressed), the role they get, a team if any, and one sentence on what happens. Send
// invites works as a form's save: Sending, then the dialog closes; if only some went, those are
// gone from the field, the rest stay marked with why, and the dialog stays open.
// `onInvited` runs with whoever was invited, and whether that was everyone: when it was not, the
// field already says who was not, so the page need say nothing more.
export function InviteDialog({
  onInvited,
}: {
  onInvited?: (invited: Invited[], everyone: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [role, setRole] = useState<string | null>("viewer");
  const [team, setTeam] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [failed, setFailed] = useState<string[]>([]);
  const [sentCount, setSentCount] = useState(0);

  const reset = () => {
    setAddresses([]);
    setRole("viewer");
    setTeam(null);
    setChecked(false);
    setFailed([]);
    setSentCount(0);
  };

  const problem = checked ? problemWith(addresses) : "";
  const stillFailing = failed.filter((each) => addresses.includes(each));
  const partly =
    stillFailing.length > 0
      ? `Could not send to ${listed(stillFailing)}. ${sentCount === 1 ? "The other invitation went" : `The other ${sentCount} invitations went`}; try again or remove ${stillFailing.length === 1 ? "it" : "them"}.`
      : "";
  const error = problem || partly;

  // A tag is marked once Send was pressed and it is not an address, or when it could not be sent.
  const validate = (each: string) => {
    if (checked && !isAddress(each)) {
      return "not an email address";
    }
    return stillFailing.includes(each) ? "not sent" : true;
  };

  const [sendWorking, setSendWorking] = useState(false);

  const send = async () => {
    setSendWorking(true);
    await (async () => {
      setChecked(true);
      if (problemWith(addresses) !== "") {
        throw new Error("The addresses need correcting.");
      }
      const result = await sendInvites(addresses);
      if (result.sent.length > 0) {
        onInvited?.(
          result.sent.map((email) => ({ email, role: role ?? "viewer" })),
          result.failed.length === 0
        );
      }
      if (result.failed.length > 0) {
        setAddresses(result.failed);
        setFailed(result.failed);
        setSentCount(result.sent.length);
        throw new Error("Some invitations could not be sent.");
      }
      setOpen(false);
      reset();
    })().finally(() => {
      setSendWorking(false);
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next, details) => {
        if (sendWorking) {
          details.cancel();
          return;
        }
        setOpen(next);
        if (!next) {
          reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <Icon icon={PlusIcon} />
          Invite
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite people</DialogTitle>
          <DialogDescription>
            Each person gets an email with a link to join this workspace.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div {...stylex.props(layout.fields)}>
            <Field name="emails" data-invalid={error !== ""}>
              <FieldLabel>Email addresses</FieldLabel>
              <TagsInput
                value={addresses}
                onValueChange={setAddresses}
                placeholder="name@example.com"
                validate={validate}
              />
              {error === "" ? (
                <FieldDescription>
                  Paste several at once, split by commas or lines.
                </FieldDescription>
              ) : (
                <FieldError match>{error}</FieldError>
              )}
            </Field>
            <Field name="role">
              <FieldLabel>Role</FieldLabel>
              <Select items={roles} value={role} onValueChange={setRole}>
                <SelectTrigger style={layout.control}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent />
              </Select>
            </Field>
            <Field name="team">
              <FieldLabel>Team</FieldLabel>
              <Select items={teams} value={team} onValueChange={setTeam}>
                <SelectTrigger style={layout.control}>
                  <SelectValue placeholder="No team" />
                </SelectTrigger>
                <SelectContent />
              </Select>
              <FieldDescription>
                Optional. They can join teams later.
              </FieldDescription>
            </Field>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <Button
            variant="default"
            onClick={send}
            loadingText="Sending"
            errorText="Could not send"
          >
            Send invites
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function MembersInvite() {
  return <InviteDialog />;
}
