"use client";

import { History } from "./history";

// A log that follows its end (`autoScroll`) holds what is being read too, once the reader has
// scrolled away from the end: earlier messages load above it and nothing moves, at the very top
// of the log as well.
export default function MessageScrollerHistoryFollowing() {
  return <History autoScroll />;
}
