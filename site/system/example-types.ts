// What both example finders give (./example-files.ts for a build, ./example-files-dev.ts in dev).
import type { ComponentType } from "react";

export type Example = ComponentType<Record<string, unknown>>;
export interface ExampleModule {
  default: Example;
}
export interface ExampleFiles {
  /** Whether examples/{path}.tsx exists. */
  has: (path: string) => boolean;
  /** Its module. Throws, naming the file, when there is none. */
  component: (path: string) => Promise<ExampleModule>;
  /** Its source text. Throws, naming the file, when there is none. */
  source: (path: string) => Promise<string>;
  /** Every example's path, unsorted: "button/states". */
  paths: () => string[];
}
