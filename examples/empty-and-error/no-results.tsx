"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@grasp-os/ui/components/empty";
import { Input } from "@grasp-os/ui/components/input";
import { SearchIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";
import { useRef, useState } from "react";

import { Place, ProjectList, projects } from "./projects";

const layout = stylex.create({
  stack: { display: "grid", gap: 12, width: "100%", maxWidth: 560 },
});

// The list has things and the search hides them all. The search keeps what was typed, the words
// name it, and the way back is one press. The words stand where the first result would land, and the rows under them say the list is still there.
export default function NoResults() {
  const [words, setWords] = useState("invoices");
  const field = useRef<HTMLInputElement>(null);
  const found = projects.filter((project) =>
    project.name.toLowerCase().includes(words.trim().toLowerCase())
  );
  return (
    <div {...stylex.props(layout.stack)}>
      <Input
        ref={field}
        type="search"
        aria-label="Search projects"
        // Cleared, the field still says what it is for.
        icon={SearchIcon}
        placeholder="Search projects"
        value={words}
        onChange={(event) => {
          setWords(event.target.value);
        }}
      />
      <Place>
        {found.length > 0 ? (
          <ProjectList only={words.trim() === "" ? undefined : found.length} />
        ) : (
          <Empty size="lg" align="start">
            <EmptyHeader>
              <EmptyMedia illustration="search" />
              <EmptyTitle>{`No projects match “${words.trim()}”`}</EmptyTitle>
              <EmptyDescription>
                Check the spelling or try a shorter word. All {projects.length}{" "}
                projects are still here.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setWords("");
                  // The button goes with the state: the search takes the focus it held.
                  field.current?.focus();
                }}
              >
                Clear the search
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </Place>
    </div>
  );
}
