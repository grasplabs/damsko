// The workspace's three roles: the people card's role select, its Roles popover and the Invite
// dialog all read them from here.
export const roles = [
  {
    value: "admin",
    label: "Admin",
    description:
      "Manages people, teams and permissions, and can do everything an Editor can.",
  },
  {
    value: "editor",
    label: "Editor",
    description: "Creates and changes projects and the files in them.",
  },
  {
    value: "viewer",
    label: "Viewer",
    description: "Reads the projects and files shared with them.",
  },
];
