// The people in the User picker examples: a small team.
import type { UserPickerUser } from "@grasp-os/ui/components/user-picker";

export const team: UserPickerUser[] = [
  { id: "amara", name: "Amara Okafor", detail: "Head of operations" },
  // An id may hold a space, as a display name used as an id does.
  { id: "jonas weber", name: "Jonas Weber", detail: "Finance" },
  { id: "lena", name: "Lena Ruiz", detail: "Design" },
  { id: "sam", name: "Sam Patel", detail: "Facilities" },
  { id: "mei", name: "Mei Chen", detail: "People and hiring" },
];
