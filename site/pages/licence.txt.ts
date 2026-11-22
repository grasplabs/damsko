// /licence.txt: the repository's LICENSE, as the docs' footer links it.
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { findRoot } from "../lib/root";

export const GET = () =>
  new Response(readFileSync(join(findRoot(), "LICENSE"), "utf-8"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
