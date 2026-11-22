"use client";

import { DataTable } from "@grasp-os/ui/components/data-table";
import { useState } from "react";

const all = Array.from({ length: 60 }, (_, index) => ({
  id: `e${index + 1}`,
  name: `Weekly note ${index + 1}`,
  owner: ["Amara Okafor", "Jonas Weber", "Lena Ruiz", "Sam Patel"][index % 4]!,
  words: 300 + ((index * 137) % 900),
}));

// Endless: more rows come as the last one scrolls into view, with placeholders while they do.
export default function DataTableEndless() {
  const [count, setCount] = useState(15);
  const [loadingMore, setLoadingMore] = useState(false);
  const more = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setCount((now) => Math.min(all.length, now + 15));
      setLoadingMore(false);
    }, 700);
  };
  return (
    <DataTable
      aria-label="Weekly notes"
      rows={all.slice(0, count)}
      getRowId={(note) => note.id}
      height="22rem"
      onEndReached={more}
      hasMore={count < all.length}
      loadingMore={loadingMore}
      unit={{ one: "note", other: "notes" }}
      columns={[
        { id: "name", header: "Note", value: (note) => note.name },
        { id: "owner", header: "Owner", value: (note) => note.owner },
        {
          id: "words",
          header: "Words",
          value: (note) => note.words,
          align: "end",
        },
      ]}
    />
  );
}
