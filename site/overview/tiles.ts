import { listPages } from "../system/content.ts";
// The components overview's tiles: one per page in docs/components, grouped by kind in the
// sidebar's order (site/system/kinds.ts, read through content.ts), so a page added on any branch has
// a tile with no list to edit. A tile's preview is its sketch (sketches/<name>.ts), found by the
// page itself.
//
// Plain Node, like content.ts.
import { kindOf, kinds, otherKind } from "../system/kinds.ts";

export interface Tile {
  /** The component's name, from its page's title: "Radio group". */
  name: string;
  /** Its page's one sentence. */
  description: string;
  /** Its page: "/components/radio-group". */
  route: string;
}

export interface TileGroup {
  /** The kind's id, also the heading's id: "forms". */
  id: string;
  /** The kind's name, as the sidebar shows it: "Forms". */
  label: string;
  /** The kind's sentence, where it has one. */
  says?: string;
  tiles: Tile[];
}

/** Every component's tile, in the sidebar's order. */
export const tiles = (): Tile[] =>
  listPages()
    .filter((page) => page.group === "Components")
    .map((page) => ({
      name: page.title,
      description: page.description,
      route: page.route,
    }));

/** The tiles in groups, one per kind that has any, in the sidebar's order. */
export const tileGroups = (): TileGroup[] => {
  const all = tiles();
  return [...kinds, otherKind]
    .map((kind) => ({
      id: kind.id,
      label: kind.label,
      says: kind.says,
      tiles: all.filter(
        (tile) => kindOf(tile.route.split("/").pop() ?? "").id === kind.id
      ),
    }))
    .filter((group) => group.tiles.length > 0);
};
