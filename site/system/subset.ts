// A page-subset build, for a builder's own preview only, NEVER for the gate or a deploy:
//
//   GRASP_PAGES="/components/button,/examples/button/*" pnpm exec astro build --outDir dist/pages
//
// The listed addresses (a trailing `*` takes everything under it) are drawn, with their `.md` twin;
// every other page of the routes that list pages is left out, and the llms files with them. The two
// bundles still compile everything (about 10 s warm), so a subset build is the bundles plus a few
// pages. The build writes `.subset` into its folder, naming what it holds, so nothing mistakes it for
// the site. Without GRASP_PAGES nothing changes.
const asked = (process.env.GRASP_PAGES ?? "")
  .split(",")
  .map((each) => each.trim().replace(/\/$/u, ""))
  .filter((each) => each !== "");

/** Whether this build draws only some pages. */
export const subset = asked.length > 0;

/** Whether the page at `route` ("/components/button") is drawn in this build. */
export const wanted = (route: string): boolean => {
  if (!subset) {
    return true;
  }
  const plain = route.replace(/\/$/u, "") || "/";
  return asked.some((each) =>
    each.endsWith("*") ? plain.startsWith(each.slice(0, -1)) : plain === each
  );
};

/** What `.subset` says: the addresses asked for. */
export const subsetNote = () =>
  `A page-subset build (GRASP_PAGES), for a preview only. Not the site.\n${asked.join("\n")}\n`;
