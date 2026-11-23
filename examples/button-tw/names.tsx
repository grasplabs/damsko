import { Button } from "@grasp-os/ui/components-tw/button";

// The names fixture, not shown on the page: a caller's aria-label reaches the element as given on a
// Button with words, so "Delete Spring launch" still starts with what it shows.
export default function ButtonNames() {
  return (
    <div>
      <Button variant="outline" aria-label="Delete Spring launch">
        Delete
      </Button>
    </div>
  );
}
