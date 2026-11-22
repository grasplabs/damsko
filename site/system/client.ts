// The script every page of this system loads, beside the header's own (site/behaviour/docs.ts):
// the examples' islands, and in dev the StyleX sheet kept current while files change.
import "./island.ts";
import "../behaviour/stylex-sheet.ts";

if (import.meta.env.DEV) {
  void import("../behaviour/stylex-dev.ts");
}
