// The library's name, as the docs site says it: in the title of every page, the brand in the top
// bar and the menu, and the site's words about itself. Site words only: the package, the registry's
// namespace, the repository and the tokens keep their names (renaming those is the call).
export const libraryName = "Damsko";

/** Where the docs' sidebar keeps a reader's folded runs, by run id (site/chrome/nav-folds.ts). */
export const navStorageKey = "damsko-docs-nav";

/** Where the docs' sidebar keeps whether it is open (the SidebarProvider's storageKey). */
export const navOpenKey = "damsko-docs-sidebar";
