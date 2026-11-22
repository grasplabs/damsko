// The brand book drawn still: the one-file book (/brand/book, scripts after the build) renders every
// room with this set, so each part takes its still form. Nothing moves, nothing waits for a script,
// nothing reaches the network: a statement at its last beat, the meadow and the dots as drawings,
// the sizes drawn side by side, the checker as one worked example, the files as data.
import { createContext, useContext } from "react";

export const StillContext = createContext(false);

/** Whether the part is drawn for the one-file book. */
export const useStill = () => useContext(StillContext);
