import { Button } from "@grasp-os/ui/components/button";

// The names fixture, not shown on the page: a caller's aria-label reaches the element as given on a
// Button with words, so "Delete Spring launch" still starts with what it shows.
export default function ButtonNames() {
  return (
    <div>
      <Button variant="secondary" aria-label="Delete Spring launch">
        Delete
      </Button>
    </div>
  );
}
