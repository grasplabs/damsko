"use client";

import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@grasp-os/ui/components/select";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import MembersPeople, { people } from "./members-people";
import type { Person } from "./members-people";
import { TeamDialog, everyone } from "./members-team-dialog";
import MembersTeams, { teams } from "./members-teams";

const layout = stylex.create({
  stage: { display: "grid", gap: space["4"], width: "100%", maxWidth: 720 },
  switch: { width: "14rem" },
});

const first = [
  "Anna",
  "Ravi",
  "Sofia",
  "Tom",
  "Lena",
  "Bas",
  "Mira",
  "Omar",
  "Ilse",
  "Pieter",
];
const last = ["de Vries", "Menon", "Laine", "Becker"];
// Forty people, made up, with a role each: enough for two pages of twenty.
const forty: Person[] = Array.from({ length: 40 }, (_, at) => {
  const name = `${first[at % first.length] ?? ""} ${last[Math.floor(at / first.length) % last.length] ?? ""}`;
  return {
    name,
    email: `${name.toLowerCase().replaceAll(" ", ".")}@northwind.example`,
    role: ["admin", "editor", "viewer"][at % 3] ?? "viewer",
    state: "active",
  };
});

const states = [
  { value: "one", label: "One person" },
  { value: "forty", label: "Forty people, paged" },
  { value: "loading", label: "Loading" },
  { value: "empty-team", label: "An empty team" },
  { value: "failed-save", label: "A team's save fails" },
];

// The states the Members page meets, each from the same parts: one person, forty people paged
// (search runs over all of them), the people loading, a team with no one in it, and a team's save
// that fails and keeps its changes.
export default function MembersStates() {
  const [state, setState] = useState("one");
  return (
    <div {...stylex.props(layout.stage)}>
      <Select
        items={states}
        value={state}
        onValueChange={(next) => {
          setState(next ?? "one");
        }}
      >
        <SelectTrigger size="sm" aria-label="State shown" style={layout.switch}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent />
      </Select>
      {state === "one" && (
        <MembersPeople key="one" initial={people.slice(0, 1)} />
      )}
      {state === "forty" && <MembersPeople key="forty" initial={forty} />}
      {state === "loading" && <MembersPeople key="loading" loading />}
      {state === "empty-team" && (
        <MembersTeams
          key="empty"
          initial={[{ id: "legal", name: "Legal", members: [] }, ...teams]}
        />
      )}
      {state === "failed-save" && (
        <TeamDialog
          team={{
            id: "finance",
            name: "Finance",
            members: everyone.slice(0, 6).map((person) => person.email),
          }}
          everyone={everyone}
          failSave
          onClose={() => {
            setState("one");
          }}
          onSave={() => undefined}
        />
      )}
    </div>
  );
}
