"use client";

import { Inspector } from "@grasp-os/ui/blocks/inspector-01/inspector-01";
import { Avatar, AvatarFallback } from "@grasp-os/ui/components/avatar";
import { Badge } from "@grasp-os/ui/components/badge";
import { Button } from "@grasp-os/ui/components/button";
import { Combobox } from "@grasp-os/ui/components/combobox";
import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { KeyValueList } from "@grasp-os/ui/components/key-value";
import {
  ChartColumnIcon,
  CircleCheckIcon,
  CircleUserIcon,
  ClockIcon,
  DatabaseIcon,
  EyeIcon,
  FileDocIcon,
  FileIcon,
  Icon,
  PencilIcon,
  UsersIcon,
} from "@grasp-os/ui/lib/icons";
import { useState } from "react";

import {
  InspectorDialog,
  InspectorFrame,
  InspectorMore,
  InspectorShare,
  useListRows,
} from "./inspector-frame";
import type { InspectorOptions, ListRow } from "./inspector-frame";

const LINK = "https://example.com/reports/quarterly-delivery-review";

// Who may own the report.
const jonas = { id: "jonas", name: "Jonas Weber", detail: "Delivery lead" };
const team = [
  jonas,
  { id: "amara", name: "Amara Okafor", detail: "Head of projects" },
  { id: "lena", name: "Lena Fischer", detail: "Finance" },
];

const access = {
  rows: [
    {
      id: "amara",
      icon: CircleUserIcon,
      name: "Amara Okafor",
      detail: "Can edit",
    },
    {
      id: "lena",
      icon: CircleUserIcon,
      name: "Lena Fischer",
      detail: "Can view",
    },
    { id: "team", icon: UsersIcon, name: "Delivery team", detail: "Can view" },
  ],
  spare: [
    {
      id: "mira",
      icon: CircleUserIcon,
      name: "Mira Santos",
      detail: "Can view",
    },
    {
      id: "finance",
      icon: UsersIcon,
      name: "Finance team",
      detail: "Can view",
    },
  ],
} satisfies { rows: ListRow[]; spare: ListRow[] };

const sources = {
  rows: [
    {
      id: "plan",
      icon: FileDocIcon,
      name: "Quarterly plan",
      detail: "Document",
    },
    {
      id: "budget",
      icon: FileIcon,
      name: "Budget, fourth quarter",
      detail: "Sheet",
    },
  ],
  spare: [
    { id: "hours", icon: FileIcon, name: "Time sheets", detail: "Sheet" },
    { id: "risks", icon: FileDocIcon, name: "Risk log", detail: "Document" },
  ],
} satisfies { rows: ListRow[]; spare: ListRow[] };

/** Open: the report itself, each project against its plan. */
const ReportDialog = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => (
  <InspectorDialog
    open={open}
    onClose={onClose}
    title="Quarterly delivery review"
    description="Each project this quarter, against its plan."
  >
    <KeyValueList
      items={[
        { id: "harbour", label: "Harbour site", value: "On plan, 92% done" },
        { id: "supplier", label: "Supplier contract", value: "Two weeks late" },
        { id: "office", label: "New office fit-out", value: "Ahead, 64% done" },
        { id: "budget", label: "Budget used", value: "71% of the quarter's" },
      ]}
    />
  </InspectorDialog>
);

/** Change: the owner, chosen by name; Save keeps the choice. */
const OwnerDialog = ({
  owner,
  onSave,
  onClose,
}: {
  owner: string;
  onSave: (id: string) => void;
  onClose: () => void;
}) => {
  const [chosen, setChosen] = useState<string | null>(owner);
  return (
    <InspectorDialog
      open
      onClose={onClose}
      title="Change the owner"
      description="The owner answers for the report and hears when it fails to refresh."
      actions={[
        {
          label: "Save",
          errorText: "Could not save",
          run: () => {
            if (chosen !== null) {
              onSave(chosen);
            }
          },
        },
      ]}
    >
      <Field name="owner">
        <FieldLabel>Owner</FieldLabel>
        <Combobox
          items={team.map((person) => ({
            value: person.id,
            label: person.name,
            description: person.detail,
            media: (
              <Avatar name={person.name} size="xs" decorative>
                <AvatarFallback />
              </Avatar>
            ),
          }))}
          media={<Icon icon={UsersIcon} />}
          placeholder="Choose a person"
          value={chosen}
          onValueChange={(id) => {
            setChosen(id);
          }}
        />
      </Field>
    </InspectorDialog>
  );
};

function ReportInspector({ onClose, toast }: InspectorOptions) {
  const [reading, setReading] = useState(false);
  const [changing, setChanging] = useState(false);
  const [owner, setOwner] = useState("jonas");
  const people = useListRows({
    title: "People with access",
    ...access,
    full: "Everyone suggested has access",
    toast,
  });
  const linked = useListRows({
    title: "Linked sources",
    ...sources,
    full: "Every suggested source is linked",
    toast,
  });
  const held = team.find((person) => person.id === owner) ?? jonas;
  return (
    <>
      <Inspector
        aria-label="Report details"
        onClose={onClose}
        icon={ChartColumnIcon}
        title="Quarterly delivery review"
        description="How each project moved this quarter, against its plan."
        meta={["By Jonas Weber", "Updated Tuesday"]}
        actions={
          <>
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                setReading(true);
              }}
            >
              Open
            </Button>
            <InspectorShare
              name="Quarterly delivery review"
              href={LINK}
              toast={toast}
            />
            <InspectorMore
              name="Quarterly delivery review"
              href={LINK}
              toast={toast}
            />
          </>
        }
        sections={[
          {
            id: "owner",
            title: "Owner",
            description: "The one person who answers for the report.",
            action: (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  setChanging(true);
                }}
              >
                <Icon icon={PencilIcon} />
                Change
              </Button>
            ),
            rows: [
              {
                id: held.id,
                icon: CircleUserIcon,
                name: held.name,
                detail: held.detail,
              },
            ],
          },
          {
            id: "status",
            title: "Status",
            description: "Whether people can see it, and when it refreshes.",
            rows: [
              {
                id: "published",
                icon: CircleCheckIcon,
                name: "Published",
                detail: <Badge variant="success">Live</Badge>,
              },
              {
                id: "refresh",
                icon: ClockIcon,
                name: "Refreshes every Monday at 07:00",
                detail: "Weekly",
              },
            ],
          },
          {
            id: "access",
            title: "People with access",
            description:
              "Who can open the report, and what they may do with it.",
            ...people,
          },
          {
            id: "sources",
            title: "Linked sources",
            description: "Where its numbers come from. They refresh with it.",
            onAdd: linked.onAdd,
            rows: [
              {
                id: "records",
                icon: DatabaseIcon,
                name: "Project records",
                detail: "Table",
                locked: "Cannot be removed",
              },
              ...linked.rows,
            ],
          },
          {
            id: "activity",
            title: "Activity",
            description: "What happened to the report, the newest first.",
            rows: [
              {
                id: "a1",
                icon: CircleCheckIcon,
                name: "Jonas Weber published it",
                detail: "Tue",
              },
              {
                id: "a2",
                icon: PencilIcon,
                name: "Amara Okafor changed the chart",
                detail: "Mon",
              },
              {
                id: "a3",
                icon: EyeIcon,
                name: "Lena Fischer opened it",
                detail: "Mon",
              },
            ],
          },
        ]}
      />
      <ReportDialog
        open={reading}
        onClose={() => {
          setReading(false);
        }}
      />
      {changing && (
        <OwnerDialog
          owner={owner}
          onClose={() => {
            setChanging(false);
          }}
          onSave={(id) => {
            setOwner(id);
            const next = team.find((person) => person.id === id);
            toast(`${next?.name ?? "The new owner"} owns the report now`);
          }}
        />
      )}
    </>
  );
}

// A report's details: owner, status, people with access, linked sources and activity. No views:
// the bar gains its hairline as the panel scrolls. Drawn by the Inspector block. Every control
// works on the example's own state.
export default function InspectorReport() {
  return (
    <InspectorFrame
      title="Quarterly delivery review"
      description="Every project's progress this quarter."
      current="reports"
      inspector={(options) => <ReportInspector {...options} />}
    />
  );
}
