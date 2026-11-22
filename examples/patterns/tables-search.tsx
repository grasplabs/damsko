import { DataTable } from "@grasp-os/ui/components/data-table";

const people = [
  { name: "Amara Okafor", team: "Finance", joined: "Mar 2024" },
  { name: "Jonas Weber", team: "Engineering", joined: "Jan 2025" },
  { name: "Lena Ruiz", team: "Design", joined: "Aug 2023" },
  { name: "Sam Patel", team: "Operations", joined: "Jun 2025" },
];

// Search above the table it narrows. Type a name nobody has: the table says so in its own body.
export default function TablesSearch() {
  return (
    <DataTable
      aria-label="People"
      caption="People in the workspace."
      rows={people}
      getRowId={(person) => person.name}
      searchable
      unit={{ one: "person", other: "people" }}
      columns={[
        { id: "name", header: "Name", value: (person) => person.name },
        { id: "team", header: "Team", value: (person) => person.team },
        {
          id: "joined",
          header: "Joined",
          value: (person) => person.joined,
          align: "end",
        },
      ]}
    />
  );
}
