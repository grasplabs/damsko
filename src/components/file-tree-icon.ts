// The icon a file in File Tree wears for its extension, pure, so it is tested without a page
// (scripts/file-tree-icon.test.ts). The name comes from a model or a tool: the extension is looked up
// as an own key only, so a name such as `a.__proto__` or `a.constructor` finds nothing, and anything
// unknown wears the plain file icon.
import {
  AudioWaveformIcon,
  CodeIcon,
  FileDocIcon,
  FileIcon,
  FilePdfIcon,
  ImageIcon,
  SheetIcon,
  VideoIcon,
} from "../lib/icons";
import type { IconData } from "../lib/icons";
import { ownValue } from "../lib/utils";

// Each kind's extensions, in lower case; the icons are Damsko's own.
const kinds: [IconData, string[]][] = [
  [FilePdfIcon, ["pdf"]],
  [FileDocIcon, ["doc", "docx", "md", "mdx", "odt", "rtf", "txt"]],
  [SheetIcon, ["csv", "ods", "tsv", "xls", "xlsx"]],
  [ImageIcon, ["avif", "gif", "ico", "jpeg", "jpg", "png", "svg", "webp"]],
  [VideoIcon, ["mkv", "mov", "mp4", "webm"]],
  [AudioWaveformIcon, ["flac", "m4a", "mp3", "ogg", "wav"]],
  [
    CodeIcon,
    [
      "c",
      "cpp",
      "css",
      "go",
      "html",
      "java",
      "js",
      "json",
      "jsx",
      "kt",
      "mjs",
      "py",
      "rb",
      "rs",
      "sh",
      "sql",
      "swift",
      "toml",
      "ts",
      "tsx",
      "xml",
      "yaml",
      "yml",
    ],
  ],
];

const byExtension: Readonly<Record<string, IconData>> = Object.fromEntries(
  kinds.flatMap(([icon, extensions]) =>
    extensions.map((extension) => [extension, icon])
  )
);

/** The icon for a file's name, by its extension; the plain file icon when it has none we know. */
export const fileTreeIcon = (name: string): IconData => {
  const dot = name.lastIndexOf(".");
  // No dot, or only a leading one (`.gitignore`): no extension.
  if (dot <= 0) {
    return FileIcon;
  }
  return ownValue(byExtension, name.slice(dot + 1).toLowerCase()) ?? FileIcon;
};
