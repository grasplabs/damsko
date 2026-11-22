// Values read from JSON files are `unknown` until checked: these narrow them.
import { readFileSync } from "node:fs";

/** A JSON file's value, to narrow before use. */
export const readJson = (file: string): unknown =>
  JSON.parse(readFileSync(file, "utf-8"));

/** Whether a value is a JSON object. */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** An object's field of names to strings (package.json's dependencies), or an empty one. */
export const stringsAt = (
  value: unknown,
  key: string
): Record<string, string> => {
  const field = isRecord(value) ? value[key] : undefined;
  if (!isRecord(field)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(field).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string"
    )
  );
};
