"use client";

import { Badge } from "@grasp-os/ui/components/badge";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
} from "@grasp-os/ui/components/command";
import type { CommandItemData } from "@grasp-os/ui/components/command";
import {
  CircleUserIcon,
  FileDocIcon,
  FolderIcon,
} from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

// What a server would hold: projects, documents and people, each with where it lives.
const everything = [
  {
    value: "spring-launch",
    label: "Spring launch",
    description: "Project · edited Tuesday",
    icon: FolderIcon,
    open: 3,
  },
  {
    value: "supplier-review",
    label: "Supplier review",
    description: "Project · edited 12 November",
    icon: FolderIcon,
    open: 0,
  },
  {
    value: "launch-brief",
    label: "Launch brief.docx",
    description: "Document in Spring launch",
    icon: FileDocIcon,
    open: 0,
  },
  {
    value: "budget-q1",
    label: "Budget for the first quarter.xlsx",
    description: "Document in Finance",
    icon: FileDocIcon,
    open: 0,
  },
  {
    value: "anna",
    label: "Anna de Vries",
    description: "Person · Head of finance",
    icon: CircleUserIcon,
    open: 0,
  },
  {
    value: "lars",
    label: "Lars Meier",
    description: "Person · Financial controller",
    icon: CircleUserIcon,
    open: 0,
  },
];

// The server's answer, after a moment: what contains the words, in its own order.
const search = (query: string) =>
  new Promise<typeof everything>((resolve) => {
    const words = query.trim().toLowerCase();
    setTimeout(() => {
      resolve(
        everything.filter((item) =>
          `${item.label} ${item.description}`.toLowerCase().includes(words)
        )
      );
    }, 600);
  });

const layout = stylex.create({
  command: { maxWidth: 440 },
});

// The page owns the query and the results: each word typed asks the server, the list says it is
// searching meanwhile, and shows what comes back as it comes, in the server's order. Each result
// carries a second line, and an open project its count of tasks at the end.
export default function CommandSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CommandItemData[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let current = true;
    const ask = async () => {
      const found = await search(query);
      if (current) {
        setResults(
          found.map((item) => ({
            value: item.value,
            label: item.label,
            description: item.description,
            icon: item.icon,
            end:
              item.open > 0 ? (
                <Badge size="sm">{`${item.open} open`}</Badge>
              ) : undefined,
          }))
        );
        setLoading(false);
      }
    };
    void ask();
    return () => {
      current = false;
    };
  }, [query]);
  return (
    <Command
      items={results}
      inputValue={query}
      onInputValueChange={(next) => {
        setQuery(next);
        setLoading(true);
      }}
      filter={false}
      loading={loading}
      style={layout.command}
    >
      <CommandInput
        aria-label="Search the workspace"
        placeholder="Search projects, documents and people"
      />
      <CommandEmpty>Nothing matches those words</CommandEmpty>
      <CommandList />
    </Command>
  );
}
