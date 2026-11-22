// The tokens, read by the docs' token displays and their Markdown forms. Pages never retype a
// value: they name a set and the value comes from here (site/system/token-file.ts).
import { tokenEntries, tokenSets } from "../system/token-file";

export type { ContrastEntry, TokenEntry } from "../system/token-file";
export { tokenContrast as contrastPairs } from "../system/token-file";

/** The tokens of one set, by its id (grounds, inks, accents, light, status, focus, ...). */
export const tokenSet = (id: string) => {
  const set = tokenSets.find((candidate) => candidate.id === id);
  if (!set) {
    throw new Error(
      `No token set "${id}". Sets: ${tokenSets.map((s) => s.id).join(", ")}.`
    );
  }
  return set.tokens;
};

export const token = (name: string) => {
  const found = tokenEntries.get(name);
  if (!found) {
    throw new Error(`No token "${name}".`);
  }
  return found;
};
