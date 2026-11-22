"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupClear,
  InputGroupInput,
} from "@grasp-os/ui/components/input-group";
import {
  PageHeader,
  PageHeaderToolbar,
} from "@grasp-os/ui/components/page-header";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@grasp-os/ui/components/select";
import { Toggle } from "@grasp-os/ui/components/toggle";
import { Icon, SearchIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 720 },
  // The search takes the room there is, and never less than its hint needs; the scope gives way.
  search: { flexGrow: 1, flexBasis: 168, minWidth: 168 },
  // The scope at the width of its words: a select fills its line by default, which here would take
  // the room the search is meant to have.
  scope: { width: "auto", flexShrink: 0 },
});

const kinds = ["All", "Reports", "Decks", "Sheets", "Pages"];

// The row under the title: the kinds to browse at the start; whose they are and a search at the end.
// Narrower than 640px, the two stack. The search is the system's field, with its own clear button.
export default function PageHeaderToolbarBasic() {
  const [kind, setKind] = useState("All");
  return (
    <PageHeader
      title="Outputs"
      size="sm"
      style={layout.box}
      toolbar={
        <PageHeaderToolbar
          aria-label="Outputs"
          start={kinds.map((name) => (
            <Toggle
              key={name}
              size="xs"
              pressed={kind === name}
              onPressedChange={() => {
                setKind(name);
              }}
            >
              {name}
            </Toggle>
          ))}
          end={
            <>
              <Select
                items={["Everyone's", "Mine", "Shared with me"]}
                defaultValue="Everyone's"
              >
                <SelectTrigger aria-label="Whose" style={layout.scope}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent />
              </Select>
              <InputGroup style={layout.search}>
                <InputGroupAddon>
                  <Icon icon={SearchIcon} />
                </InputGroupAddon>
                <InputGroupInput
                  type="search"
                  aria-label="Search outputs"
                  placeholder="Search outputs"
                />
                <InputGroupClear aria-label="Clear search" />
              </InputGroup>
            </>
          }
        />
      }
    />
  );
}
