// FileTree: the files an assistant changed or made, as folders that open, after shadcn's File Tree
// pattern (apps/v4/content/docs/ai-elements/base/file-tree.mdx). shadcn builds it from Collapsible
// and Button; here it is Damsko's TreeView with files' data, so the keys, the roles, typeahead and
// the choice are TreeView's own and there is no second tree.
// Adapted from shadcn/ui (MIT), see THIRD_PARTY_NOTICES.md.
//
//   <FileTree
//     defaultExpanded={["app"]}
//     defaultSelectedPath="app/page.tsx"
//     items={[{ type: "folder", name: "app", path: "app", children: [
//       { type: "file", name: "page.tsx", path: "app/page.tsx" },
//     ] }]}
//   />
//
// shadcn writes the tree as nested parts (FileTreeFolder, FileTreeFile, FileTreeIcon, FileTreeName);
// TreeView takes its items as data, so the whole tree is known to the keys and typeahead, and
// those parts are the fields of a node here: `type`, `path`, `name`, `icon` and `children`. Each
// file wears an icon for its extension unless it brings its own; a folder wears the folder. Only a
// file is chosen: a press on a folder opens or closes it. FileTreeActions holds a row's buttons:
// pressing one, or a key on one, runs it and leaves the row as it was. Every value is a token.
"use client";

import * as stylex from "@stylexjs/stylex";
import { useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

import { useI18n } from "../lib/i18n";
import { FolderIcon } from "../lib/icons";
import type { IconData } from "../lib/icons";
import { space } from "../lib/tokens.stylex";
import type { LayoutStyle } from "../lib/utils";
import { fileTreeIcon } from "./file-tree-icon";
import { TreeView } from "./tree-view";
import type { TreeNode } from "./tree-view";

/** One file or folder of a FileTree. */
export interface FileTreeNode {
  /** A `file`, which can be chosen, or a `folder`, which opens and closes. */
  type: "file" | "folder";
  /** Its name, as it is on disk ("page.tsx"). Typeahead matches it. */
  name: string;
  /** Its path from the tree's root ("app/page.tsx"): unique, and what is chosen or expanded. */
  path: string;
  /** A folder's files and folders. A file's are never shown. */
  children?: FileTreeNode[];
  /**
   * Its icon.
   * @default a folder's, or one for a file's extension (a document, a sheet, an image, code), else a plain file
   */
  icon?: IconData;
  /** At the row's end: a FileTreeActions with its buttons, or a quiet mark such as a count. */
  actions?: ReactNode;
}

/** Every prop a FileTree takes. */
export interface FileTreeProps {
  /** The files and folders at the top, folders holding theirs in `children`. */
  items: FileTreeNode[];
  /**
   * The tree's name for a screen reader.
   * @default "Files" (`fileTree.name`)
   */
  "aria-label"?: string;
  /** The chosen file's path. Pass it with `onSelect` to hold it yourself. */
  selectedPath?: string | null;
  /** The file chosen at first, when you do not hold it. */
  defaultSelectedPath?: string | null;
  /** Runs with a file's path when it is chosen: a press, Enter or Space on it. */
  onSelect?: (path: string) => void;
  /** The open folders' paths. Pass it with `onExpandedChange` to hold them yourself. */
  expanded?: string[];
  /** The folders open at first, when you do not hold them. */
  defaultExpanded?: string[];
  /** Runs with the open folders' paths when one opens or closes. */
  onExpandedChange?: (expanded: string[]) => void;
  /** Where it sits and how wide it is. */
  style?: LayoutStyle;
}

/** Every prop a FileTreeActions takes. */
export interface FileTreeActionsProps {
  /** The row's buttons: small icon Buttons, each with its own name ("Download page.tsx"). */
  children: ReactNode;
  /** Layout only: where it sits. */
  style?: LayoutStyle;
}

const styles = stylex.create({
  actions: {
    display: "inline-flex",
    alignItems: "center",
    gap: space["1"],
  },
});

/** TreeView's nodes, from the files: each file's icon for its extension, unless it brings its own. */
const toNodes = (items: FileTreeNode[]): TreeNode[] =>
  items.map((item) =>
    item.type === "folder"
      ? {
          value: item.path,
          label: item.name,
          icon: item.icon ?? FolderIcon,
          actions: item.actions,
          children: toNodes(item.children ?? []),
        }
      : {
          value: item.path,
          label: item.name,
          icon: item.icon ?? fileTreeIcon(item.name),
          actions: item.actions,
        }
  );

/** Every file's path: only these can be chosen. */
const filePaths = (items: FileTreeNode[]): Set<string> =>
  new Set(
    items.flatMap((item) =>
      item.type === "folder" ? [...filePaths(item.children ?? [])] : [item.path]
    )
  );

/** Files in folders that open: the files changed or made. */
export const FileTree = ({
  items,
  "aria-label": label,
  selectedPath,
  defaultSelectedPath = null,
  onSelect,
  expanded,
  defaultExpanded,
  onExpandedChange,
  style,
}: FileTreeProps) => {
  const words = useI18n().fileTree;
  const [own, setOwn] = useState(defaultSelectedPath);
  const selected = selectedPath === undefined ? own : selectedPath;
  // The React Compiler keeps these between renders while `items` stays the same.
  const nodes = toNodes(items);
  const files = filePaths(items);
  // A press chooses a file and runs it in one go: the file it chose, so running it does not choose
  // it again.
  const chosenByPress = useRef<string | null>(null);
  const choose = (path: string) => {
    if (selectedPath === undefined) {
      setOwn(path);
    }
    onSelect?.(path);
  };
  return (
    <div data-slot="file-tree" {...stylex.props(style)}>
      <TreeView
        aria-label={label ?? words.name}
        items={nodes}
        // Held here, so a folder is never chosen: the tree asks, and only a file's path is taken.
        value={selected}
        onValueChange={(next) => {
          if (typeof next === "string" && files.has(next)) {
            chosenByPress.current = next;
            // The press runs it straight after; Space runs nothing, so it is forgotten after.
            queueMicrotask(() => {
              chosenByPress.current = null;
            });
            choose(next);
          }
        }}
        // Enter on a file chooses it, as a press does.
        onAction={(path) => {
          if (chosenByPress.current !== path && files.has(path)) {
            choose(path);
          }
        }}
        expandedValue={expanded}
        defaultExpandedValue={defaultExpanded}
        onExpandedChange={onExpandedChange}
      />
    </div>
  );
};

/** A press or a key on a row's button is the button's: the row is not chosen, opened or moved from. */
const keep = (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
  event.stopPropagation();
};

/** A row's buttons, at its end: pressing one runs it and leaves the row as it was. */
export const FileTreeActions = ({ children, style }: FileTreeActionsProps) => (
  // oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- it only keeps its buttons' presses and keys from the row; the buttons are the controls
  <span
    data-slot="file-tree-actions"
    onClick={keep}
    onKeyDown={keep}
    {...stylex.props(styles.actions, style)}
  >
    {children}
  </span>
);
