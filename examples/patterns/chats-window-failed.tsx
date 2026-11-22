"use client";

import ChatsWindow from "./chats-window";

// The chats window when the server's search does not answer: the first search fails and says so
// in the list, with one row to try it again; the second gets through.
export default function ChatsWindowFailed() {
  return <ChatsWindow failSearch />;
}
