// Shared rows for the Data table examples: reports in a workspace.
export interface Report {
  id: string;
  name: string;
  owner: string;
  pages: number;
  edited: string;
}

export const reports: Report[] = [
  {
    id: "r1",
    name: "Quarterly summary",
    owner: "Amara Okafor",
    pages: 14,
    edited: "2026-11-12",
  },
  {
    id: "r2",
    name: "Supplier list for the spring",
    owner: "Jonas Weber",
    pages: 6,
    edited: "2026-11-10",
  },
  {
    id: "r3",
    name: "Team survey results",
    owner: "Lena Ruiz",
    pages: 22,
    edited: "2026-11-08",
  },
  {
    id: "r4",
    name: "Office move plan",
    owner: "Sam Patel",
    pages: 9,
    edited: "2026-11-07",
  },
  {
    id: "r5",
    name: "Hiring plan for the summer",
    owner: "Amara Okafor",
    pages: 11,
    edited: "2026-11-05",
  },
  {
    id: "r6",
    name: "Travel policy",
    owner: "Mei Chen",
    pages: 4,
    edited: "2026-11-03",
  },
  {
    id: "r7",
    name: "Spring launch review",
    owner: "Jonas Weber",
    pages: 18,
    edited: "2026-10-30",
  },
  {
    id: "r8",
    name: "Budget for next year",
    owner: "Sam Patel",
    pages: 27,
    edited: "2026-10-28",
  },
  {
    id: "r9",
    name: "Welcome guide",
    owner: "Lena Ruiz",
    pages: 8,
    edited: "2026-10-21",
  },
];
