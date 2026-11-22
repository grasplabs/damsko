"use client";

import { PageFailed } from "./page-failed";

// The same failed page as the whole window, as when the app itself did not load: its heading the
// page's h1.
export default function PageFailedWhole() {
  return <PageFailed whole />;
}
