"use client";

import { Inspector } from "@grasp-os/ui/blocks/inspector-01/inspector-01";
import type { InspectorSection } from "@grasp-os/ui/blocks/inspector-01/inspector-01";
import { Badge } from "@grasp-os/ui/components/badge";
import { Button } from "@grasp-os/ui/components/button";
import { Field, FieldError, FieldLabel } from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import { Markdown } from "@grasp-os/ui/components/markdown";
import { Textarea } from "@grasp-os/ui/components/textarea";
import {
  BuildingIcon,
  CalendarIcon,
  CircleUserIcon,
  ClockIcon,
  GlobeIcon,
  Icon,
  InboxIcon,
  MailIcon,
  MessageCircleIcon,
  PencilIcon,
  StickyNoteIcon,
} from "@grasp-os/ui/lib/icons";
import { colors, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import {
  InspectorDialog,
  InspectorFrame,
  InspectorMore,
  useListRows,
} from "./inspector-frame";
import type {
  InspectorOptions,
  InspectorToast,
  ListRow,
} from "./inspector-frame";

const layout = stylex.create({
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: space["2"],
    paddingBlock: space["3"],
    paddingInline: space.sidePanelPadding,
  },
  quiet: {
    margin: 0,
    paddingBlock: space["3"],
    paddingInline: space.sidePanelPadding,
    color: colors.mutedForeground,
    fontSize: size.sidePanelText,
    lineHeight: size.sidePanelTextLine,
  },
  fields: { display: "grid", rowGap: space["4"] },
});

const firstNotes = [
  "Prefers a call to email for anything about pricing.",
  "Renewal is due in March. She asked for the quote to show each team on its own line, and for the onboarding hours to be listed apart from support.",
  "Met at the spring meetup; introduced by Jonas Weber.",
];

const moreFields: ListRow[] = [
  {
    id: "phone",
    icon: MessageCircleIcon,
    name: "+31 20 555 0142",
    detail: "Phone",
  },
  { id: "zone", icon: ClockIcon, name: "Amsterdam, CET", detail: "Time zone" },
  { id: "birthday", icon: CalendarIcon, name: "4 June", detail: "Birthday" },
];

const moreTags = ["Newsletter", "Board member", "Speaks Portuguese"];

/** An open approval, as its dialog tells it. */
interface Approval {
  id: string;
  name: string;
  asked: string;
  why: string;
}

const firstApprovals: Approval[] = [
  {
    id: "quote",
    name: "Send the renewal quote",
    asked: "Lena Fischer, yesterday",
    why: "Each team on its own line, as she asked.",
  },
  {
    id: "access",
    name: "Give her access to the shared plan",
    asked: "Jonas Weber, 3 days ago",
    why: "She reviews the onboarding hours before the renewal.",
  },
];

const LINK = "https://example.com/people/mira-santos";

/** Edit: her name and role in a dialog; Save keeps them, Cancel leaves them. */
const EditDialog = ({
  name,
  role,
  onSave,
  onClose,
}: {
  name: string;
  role: string;
  onSave: (name: string, role: string) => void;
  onClose: () => void;
}) => {
  const [draftName, setDraftName] = useState(name);
  const [draftRole, setDraftRole] = useState(role);
  const [empty, setEmpty] = useState(false);
  return (
    <InspectorDialog
      open
      onClose={onClose}
      title={`Edit ${name}`}
      description="The whole team sees the change."
      actions={[
        {
          label: "Save",
          errorText: "Could not save",
          // An empty name is refused: the field says why, and the dialog stays open.
          run: () => {
            if (draftName.trim() === "") {
              setEmpty(true);
              throw new Error("She needs a name.");
            }
            onSave(draftName.trim(), draftRole.trim());
          },
        },
      ]}
    >
      <div {...stylex.props(layout.fields)}>
        <Field name="name" data-invalid={empty}>
          <FieldLabel>Name</FieldLabel>
          <Input
            value={draftName}
            required
            onValueChange={(value: string) => {
              setDraftName(value);
              setEmpty(false);
            }}
          />
          {empty && <FieldError match>Give her a name.</FieldError>}
        </Field>
        <Field name="role">
          <FieldLabel>Role</FieldLabel>
          <Input
            value={draftRole}
            onValueChange={(value: string) => {
              setDraftRole(value);
            }}
          />
        </Field>
      </div>
    </InspectorDialog>
  );
};

/** Write: a note in a dialog; Save puts it at the top of the notes. */
const WriteDialog = ({
  onSave,
  onClose,
}: {
  onSave: (note: string) => void;
  onClose: () => void;
}) => {
  const [note, setNote] = useState("");
  const [empty, setEmpty] = useState(false);
  return (
    <InspectorDialog
      open
      onClose={onClose}
      title="Write a note"
      description="The team sees it at the top of her notes."
      actions={[
        {
          label: "Save",
          errorText: "Could not save",
          run: () => {
            if (note.trim() === "") {
              setEmpty(true);
              throw new Error("The note is empty.");
            }
            onSave(note.trim());
          },
        },
      ]}
    >
      <Field name="note" data-invalid={empty}>
        <FieldLabel>Note</FieldLabel>
        <Textarea
          rows={4}
          value={note}
          required
          placeholder="Asked to move the call to Thursday."
          onValueChange={(value: string) => {
            setNote(value);
            setEmpty(false);
          }}
        />
        {empty && <FieldError match>Write the note first.</FieldError>}
      </Field>
    </InspectorDialog>
  );
};

/** An approval, opened from its row: who asked and why, and the answer. */
const ApprovalDialog = ({
  approval,
  onAnswer,
  onClose,
}: {
  approval: Approval | undefined;
  onAnswer: (approval: Approval, yes: boolean) => void;
  onClose: () => void;
}) => (
  <InspectorDialog
    open={approval !== undefined}
    onClose={onClose}
    title={approval?.name ?? ""}
    description={
      approval === undefined
        ? undefined
        : `Asked by ${approval.asked}. ${approval.why}`
    }
    cancel={false}
    actions={
      approval === undefined
        ? []
        : [
            {
              label: "Decline",
              errorText: "Could not decline",
              variant: "outline",
              run: () => {
                onAnswer(approval, false);
              },
            },
            {
              label: "Approve",
              errorText: "Could not approve",
              run: () => {
                onAnswer(approval, true);
              },
            },
          ]
    }
  >
    <p {...stylex.props(layout.quiet)}>
      It waits for your answer. The one who asked hears either way.
    </p>
  </InspectorDialog>
);

/** Her tags: Add puts in the next one on offer, and says when there is none. */
const useTags = (toast: InspectorToast) => {
  const [tags, setTags] = useState([
    "Customer",
    "Renewal in March",
    "Decision maker",
  ]);
  const add = () => {
    const next = moreTags.find((tag) => !tags.includes(tag));
    if (next === undefined) {
      toast("Every suggested tag is on her");
      return;
    }
    setTags([...tags, next]);
    toast(`Tagged ${next}`);
  };
  return { tags, add };
};

/** The open approvals: answering one takes it off the list. */
const useApprovals = (toast: InspectorToast) => {
  const [approvals, setApprovals] = useState(firstApprovals);
  const [opened, setOpened] = useState<string | null>(null);
  const answer = (approval: Approval, yes: boolean) => {
    setApprovals((was) => was.filter((had) => had.id !== approval.id));
    setOpened(null);
    toast(yes ? `Approved: ${approval.name}` : `Declined: ${approval.name}`);
  };
  return {
    approvals,
    opened: approvals.find((approval) => approval.id === opened),
    setOpened,
    answer,
  };
};

const approvalsSection = (
  approvals: Approval[],
  onOpen: (id: string) => void
): InspectorSection => ({
  id: "approvals",
  view: "record",
  title: "Open approvals",
  description: "Requests about her that wait for someone's answer.",
  rows: approvals.map((approval) => ({
    id: approval.id,
    icon: InboxIcon,
    name: approval.name,
    detail: <Badge variant="warning">Waiting</Badge>,
    onClick: () => {
      onOpen(approval.id);
    },
  })),
  // With every one answered, the card says so: there is nothing here to add.
  content:
    approvals.length === 0 ? (
      <p {...stylex.props(layout.quiet)}>Nothing waits for an answer.</p>
    ) : undefined,
});

function RecordInspector({ onClose, toast }: InspectorOptions) {
  const [name, setName] = useState("Mira Santos");
  const [role, setRole] = useState("Head of operations");
  const [editing, setEditing] = useState(false);
  const [writing, setWriting] = useState(false);
  const [notes, setNotes] = useState(firstNotes);
  const fields = useListRows({
    title: "Fields",
    rows: [],
    spare: moreFields,
    full: "Every suggested field is in",
    toast,
  });
  const { tags, add: addTag } = useTags(toast);
  const approvals = useApprovals(toast);
  return (
    <>
      <Inspector
        aria-label="Person details"
        onClose={onClose}
        icon={CircleUserIcon}
        title={name}
        description={`${role} at Tailspin and Co.`}
        meta={["Added by Lena Fischer", "Last contact 3 days ago"]}
        actions={
          <>
            {/* A link to a new email to her, in the visitor's own mail app. */}
            <Button size="sm" variant="default" asChild>
              <a href="mailto:mira.santos@tailspin.example">
                <Icon icon={MailIcon} />
                Email
              </a>
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label={`Edit ${name}`}
              onClick={() => {
                setEditing(true);
              }}
            >
              <Icon icon={PencilIcon} />
            </Button>
            <InspectorMore name={name} href={LINK} toast={toast} />
          </>
        }
        defaultView="record"
        views={[
          { value: "record", label: "Record", icon: CircleUserIcon },
          { value: "activity", label: "Activity", icon: ClockIcon },
        ]}
        sections={[
          {
            id: "fields",
            view: "record",
            title: "Fields",
            description:
              "What is known about her, kept in step with your records.",
            onAdd: fields.onAdd,
            rows: [
              {
                id: "email",
                icon: MailIcon,
                name: "mira.santos@tailspin.example",
                detail: "Email",
              },
              {
                id: "company",
                icon: BuildingIcon,
                name: "Tailspin and Co",
                detail: "Company",
              },
              { id: "role", icon: CircleUserIcon, name: role, detail: "Role" },
              {
                id: "site",
                icon: GlobeIcon,
                name: "tailspin.example",
                detail: "Website",
              },
              ...fields.rows,
            ],
          },
          {
            id: "tags",
            view: "record",
            title: "Tags",
            description:
              "Words that group her with others, for lists and filters.",
            onAdd: addTag,
            content: (
              <div {...stylex.props(layout.tags)}>
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            ),
          },
          approvalsSection(approvals.approvals, approvals.setOpened),
          {
            id: "notes",
            view: "record",
            title: "Notes",
            description: "What the team wants to remember, newest at the top.",
            action: (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  setWriting(true);
                }}
              >
                <Icon icon={StickyNoteIcon} />
                Write
              </Button>
            ),
            text: <Markdown size="sm">{notes.join("\n\n")}</Markdown>,
          },
          {
            id: "month",
            view: "activity",
            title: "This month",
            description: "Every touch with her, the newest first.",
            rows: [
              {
                id: "t1",
                icon: MailIcon,
                name: "Quote request answered",
                detail: "3 days ago",
              },
              {
                id: "t2",
                icon: ClockIcon,
                name: "Call, 25 minutes",
                detail: "12 Nov",
              },
            ],
          },
        ]}
      />
      {editing && (
        <EditDialog
          name={name}
          role={role}
          onClose={() => {
            setEditing(false);
          }}
          onSave={(nextName, nextRole) => {
            setName(nextName);
            setRole(nextRole);
            toast(`${nextName} saved`);
          }}
        />
      )}
      {writing && (
        <WriteDialog
          onClose={() => {
            setWriting(false);
          }}
          onSave={(note) => {
            setNotes((was) => [note, ...was]);
            toast("Note added", {
              description: "It is at the top of her notes.",
            });
          }}
        />
      )}
      <ApprovalDialog
        approval={approvals.opened}
        onAnswer={approvals.answer}
        onClose={() => {
          approvals.setOpened(null);
        }}
      />
    </>
  );
}

// A person's record: fields, tags, open approvals and notes, beside the list they came from. Drawn
// by the Inspector block. Every control works on the example's own state.
export default function InspectorRecord() {
  return (
    <InspectorFrame
      title="People"
      description="Everyone the team works with, and where each one stands."
      current="people"
      inspector={(options) => <RecordInspector {...options} />}
    />
  );
}
