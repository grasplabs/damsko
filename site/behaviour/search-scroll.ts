import { scrollbarHidden } from "@grasp-os/ui/lib/styles";
// The search list's scrollbar: the house one (scrollbarHidden in lib/styles), as a class the list
// takes when search first renders (./search.ts). Its fading edges are the frame's (site.css,
// .site-search-results[data-more]).
import * as stylex from "@stylexjs/stylex";

export const scrollBarClass = stylex.props(scrollbarHidden).className ?? "";
