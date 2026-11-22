// Serves the build the specs run against, once per run: $BASE_URL when a
// site is already served there, else the folder $SITE_DIR (default dist/,
// from `vp run build`) on a free port, which tests/example.ts reads back.
import { existsSync } from "node:fs";
import nodePath from "node:path";

import { serve } from "../scripts/serve.ts";

const setup = async (): Promise<(() => Promise<void>) | undefined> => {
  if ((process.env.BASE_URL ?? "") !== "") {
    return undefined;
  }
  const dir = process.env.SITE_DIR ?? "dist";
  if (!existsSync(nodePath.join(dir, "examples"))) {
    throw new Error(
      `${dir} holds no built examples: run \`vp run build\` first, or set SITE_DIR to a built site or BASE_URL to a served one.`
    );
  }
  const { url, close } = await serve(dir);
  process.env.BASE_URL = url;
  return close;
};

export default setup;
