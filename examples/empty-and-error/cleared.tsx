import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@grasp-os/ui/components/empty";

import { Place } from "./projects";

// Everything is dealt with: a good moment, said plainly. No action: there is nothing to do, and
// the words say where the next one will appear.
export default function Cleared() {
  return (
    <Place>
      <Empty size="lg">
        <EmptyHeader>
          <EmptyMedia illustration="done" />
          <EmptyTitle>No approvals waiting</EmptyTitle>
          <EmptyDescription>
            You have answered all 6 from today. New requests appear here when an
            agent asks.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </Place>
  );
}
