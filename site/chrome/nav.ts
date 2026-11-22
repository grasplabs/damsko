// The sidebar's shape as the chrome reads it (built by site/system/content.ts from the page list):
// a page, or a group of pages. Two levels only.
export interface SidebarPage {
  kind: "page";
  label: string;
  route: string;
  badge?: string;
}
export interface SidebarGroup {
  kind: "group";
  label: string;
  children: SidebarNode[];
}
export type SidebarNode =
  | SidebarPage
  | SidebarGroup
  | { kind: string; label: string };

/** One of the header's sections as the phone menu lists it: its name, then its sidebar. */
export interface MenuSection {
  label: string;
  items: SidebarNode[];
}

export interface NavGroup {
  label: string;
  pages: SidebarPage[];
}

const isPage = (node: SidebarNode): node is SidebarPage => node.kind === "page";

/**
 * The sidebar as tagged groups. Pages at the top level (Get started) go under "Start", so every
 * page stands under a tag.
 */
export const navGroups = (nodes: SidebarNode[]): NavGroup[] => {
  const groups: NavGroup[] = [];
  for (const node of nodes) {
    if (isPage(node)) {
      const last = groups.at(-1);
      if (last?.label === "Start") {
        last.pages.push(node);
      } else {
        groups.push({ label: "Start", pages: [node] });
      }
    } else if (node.kind === "group" && "children" in node) {
      groups.push({ label: node.label, pages: node.children.filter(isPage) });
    }
  }
  return groups;
};

/** A site path with the deployment's base in front. */
export const href = (path: string) =>
  `${import.meta.env.BASE_URL.replace(/\/$/u, "")}${path}`;
