"use client";

import { ShareDialog } from "@grasp-os/ui/blocks/share-dialog-01/share-dialog-01";
import type { ShareMember } from "@grasp-os/ui/blocks/share-dialog-01/share-dialog-01";
import { Button } from "@grasp-os/ui/components/button";
import type { UserPickerUser } from "@grasp-os/ui/components/user-picker";
import {
  BuildingIcon,
  Icon,
  ShareIcon,
  UsersIcon,
} from "@grasp-os/ui/lib/icons";
import { useState } from "react";

const levels = [
  { value: "use", label: "Can use" },
  { value: "edit", label: "Can edit" },
  { value: "none", label: "No access" },
];

// Who the workspace knows: anyone already in the list is not offered again.
const people: UserPickerUser[] = [
  { id: "design", name: "Design team", detail: "6 people" },
  { id: "pieter", name: "Pieter de Boer", detail: "pieter@contoso.example" },
  { id: "mees", name: "Mees Bakker", detail: "mees@contoso.example" },
  { id: "lotte", name: "Lotte Visser", detail: "lotte@contoso.example" },
];

const start: ShareMember[] = [
  { id: "sanne", name: "Sanne de Wit", you: true, owner: true },
  {
    id: "design",
    name: "Design team",
    note: "6 people",
    icon: UsersIcon,
    level: "edit",
  },
  {
    id: "pieter",
    name: "Pieter de Boer",
    note: "Account manager",
    level: "use",
  },
  {
    id: "everyone",
    name: "Everyone at Contoso",
    note: "148 people",
    icon: BuildingIcon,
    level: "none",
  },
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Share a plan: pick someone and their level, Add; a row's level changes at once, and Remove is the
// last choice of a level. The link in the foot copies.
export default function ShareDialogBasic() {
  const [members, setMembers] = useState(start);
  return (
    <ShareDialog
      title="Share the spring launch plan"
      description="People you add can read it and leave comments."
      trigger={
        <Button variant="secondary">
          <Icon icon={ShareIcon} />
          Share
        </Button>
      }
      people={people}
      members={members}
      levels={levels}
      onInvite={async (id, level) => {
        await wait(400);
        const person = people.find((each) => each.id === id);
        if (person !== undefined) {
          setMembers((all) => [
            ...all,
            { id, name: person.name, note: person.detail, level },
          ]);
        }
      }}
      onLevelChange={(id, level) => {
        setMembers((all) =>
          all.map((member) =>
            member.id === id ? { ...member, level } : member
          )
        );
      }}
      onRemove={(id) => {
        setMembers((all) => all.filter((member) => member.id !== id));
      }}
      link="https://contoso.example/plans/spring-launch"
    />
  );
}
