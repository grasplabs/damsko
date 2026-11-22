// The search index, built from the pages' MDX by site/system/vite.ts (site/search-index.ts).
declare module "virtual:damsko-search" {
  const sections: import("../search-index.ts").SearchSection[];
  export default sections;
}
