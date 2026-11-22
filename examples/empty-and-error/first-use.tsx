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
import { Icon, PlusIcon } from "@grasp-os/ui/lib/icons";
import { useState } from "react";

import { Place, ProjectList } from "./projects";

// Nothing has been made yet: the list's own rows are drawn faint where they will stand, the words
// say what will appear, and the one action makes the first. Press it: the first project arrives
// where its picture was.
export default function FirstUse() {
  const [made, setMade] = useState(false);
  return (
    <Place waiting={made}>
      {made ? (
        <ProjectList only={1} arrived />
      ) : (
        <Empty size="lg">
          <EmptyHeader>
            <EmptyMedia illustration="nothing" />
            <EmptyTitle>No projects yet</EmptyTitle>
            <EmptyDescription>
              Projects appear here once someone in the workspace creates one.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              variant="default"
              onClick={() => {
                setMade(true);
              }}
            >
              <Icon icon={PlusIcon} />
              New project
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </Place>
  );
}
