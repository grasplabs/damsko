"use client";

import { Button } from "@grasp-os/ui/components-tw/button";

const sizes = ["xs", "sm", "default", "lg"] as const;

// Cancel, two main steps and Delete side by side at each size: one size reads as one height,
// whatever its fill.
export default function ButtonHeights() {
  return (
    <div className="bg-card grid gap-4 rounded-xl p-6 shadow-sm">
      {sizes.map((size) => (
        <div key={size} className="flex items-center gap-2">
          <Button size={size} variant="outline">
            Cancel
          </Button>
          <Button size={size} variant="default">
            Connect
          </Button>
          <Button size={size} variant="destructive">
            Delete
          </Button>
          <Button size={size} variant="default">
            Approve
          </Button>
        </div>
      ))}
    </div>
  );
}
