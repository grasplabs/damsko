import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@grasp-os/ui/components/collapsible";
// A fold on a docs page: a Collapsible named by its words, for an Astro page, which hands an island
// one component and its body as children (Reference's folds, Intent's comparisons).
import type { ReactNode } from "react";

export interface FoldProps {
  /** The words on its trigger. */
  title: string;
  /** What opens under it. */
  children?: ReactNode;
}

export const Fold = ({ title, children }: FoldProps) => (
  <Collapsible>
    <CollapsibleTrigger>{title}</CollapsibleTrigger>
    <CollapsibleContent>{children}</CollapsibleContent>
  </Collapsible>
);
