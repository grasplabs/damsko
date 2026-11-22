/**
 * A static server for a built site, `dist/` from `vp run build`. A folder
 * answers with its index.html, `<path>.html` is tried next, and anything else
 * is 404.html. Loopback only, never cached, text compressed (Brotli) as the
 * host serves it. The browser specs start it (tests/setup.ts); run it alone to
 * look at a build:
 *
 *   node scripts/serve.ts [--dir dist] [--port 0]
 */
import { once } from "node:events";
import {
  createReadStream,
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import nodePath from "node:path";
import { parseArgs, promisify } from "node:util";
import { brotliCompress } from "node:zlib";

const types: Record<string, string> = {
  ".css": "text/css",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".json": "application/json",
  ".md": "text/markdown; charset=utf-8",
  ".mjs": "text/javascript",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".wasm": "application/wasm",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

const isFile = (path: string): boolean =>
  existsSync(path) && statSync(path).isFile();

/** The file a request's path names under `root`, or undefined. */
const fileFor = (root: string, url: string): string | undefined => {
  const path = nodePath.join(
    root,
    nodePath.normalize(decodeURIComponent(new URL(url, "http://x").pathname))
  );
  if (!path.startsWith(root)) {
    return undefined;
  }
  return [path, nodePath.join(path, "index.html"), `${path}.html`].find(isFile);
};

const textTypes = /^(?:text|application\/(?:json|wasm))|svg/u;

/** Every file under a folder. */
const filesUnder = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = nodePath.join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });

/**
 * Every text file of the build at Brotli's best, as a host keeps a static file: made once, before
 * the first request, so no request waits on another's compression.
 */
const compressAll = async (root: string): Promise<Map<string, Buffer>> => {
  const compress = promisify(brotliCompress);
  const files = filesUnder(root).filter((file) =>
    textTypes.test(types[nodePath.extname(file)] ?? "")
  );
  const bytes = await Promise.all(
    files.map(async (file) => await compress(readFileSync(file)))
  );
  return new Map(
    files.map((file, index) => [file, bytes[index] ?? Buffer.alloc(0)])
  );
};

export interface Served {
  url: string;
  close: () => Promise<void>;
}

/** Serves `dir` on 127.0.0.1 at `port` (0: any free port). */
export const serve = async (dir: string, port = 0): Promise<Served> => {
  const root = nodePath.resolve(dir);
  const compressed = await compressAll(root);
  const answer = (request: IncomingMessage, response: ServerResponse) => {
    const file = fileFor(root, request.url ?? "/");
    const notFound = nodePath.join(root, "404.html");
    const sent = file ?? (isFile(notFound) ? notFound : undefined);
    if (sent === undefined) {
      response.writeHead(404).end();
      return;
    }
    // Text goes compressed to a client that takes it, as the host serves it, so what a page
    // weighs on the wire here is what it weighs there.
    const packed = /\bbr\b/u.test(request.headers["accept-encoding"] ?? "")
      ? compressed.get(sent)
      : undefined;
    response.writeHead(file === undefined ? 404 : 200, {
      "cache-control": "no-store",
      "content-type":
        types[nodePath.extname(sent)] ?? "application/octet-stream",
      ...(packed === undefined ? {} : { "content-encoding": "br" }),
    });
    if (packed === undefined) {
      createReadStream(sent).pipe(response);
    } else {
      response.end(packed);
    }
  };
  const server = createServer((request, response) => {
    try {
      answer(request, response);
    } catch {
      response.writeHead(400).end();
    }
  });
  server.listen(port, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("the server listens on no port");
  }
  return {
    url: `http://127.0.0.1:${address.port}`,
    close: async () => {
      server.close();
      server.closeAllConnections();
      await once(server, "close");
    },
  };
};

if (import.meta.main) {
  const { values } = parseArgs({
    options: {
      dir: { type: "string", default: "dist" },
      port: { type: "string", default: "0" },
    },
  });
  const { url } = await serve(values.dir, Number(values.port));
  console.log(`serving ${values.dir} at ${url}`);
}
