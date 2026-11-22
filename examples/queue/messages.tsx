"use client";

import {
  Queue,
  QueueItem,
  QueueItemAction,
  QueueItemActions,
  QueueItemAttachment,
  QueueItemContent,
  QueueItemFile,
  QueueItemImage,
  QueueList,
  QueueSection,
  QueueSectionContent,
  QueueSectionLabel,
  QueueSectionTrigger,
} from "@grasp-os/ui/components/queue";
import {
  Icon,
  MessageSquareIcon,
  SendIcon,
  TrashIcon,
} from "@grasp-os/ui/lib/icons";
import { size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  column: { width: "100%", maxWidth: `calc(${size.popupWidth} * 1.6)` },
});

interface Waiting {
  id: string;
  text: string;
  files: { url: string; name: string; image: boolean }[];
}

const first: Waiting[] = [
  {
    id: "m1",
    text: "Also compare it with last year's numbers",
    files: [],
  },
  {
    id: "m2",
    text: "Use this chart for the second slide",
    files: [
      {
        url: "/media/quarter-chart.png",
        name: "quarter-chart.png",
        image: true,
      },
    ],
  },
  {
    id: "m3",
    text: "And the notes from the planning meeting",
    files: [
      {
        url: "/files/planning-notes.pdf",
        name: "planning-notes-for-the-autumn-review.pdf",
        image: false,
      },
      {
        // An SVG written into the address can carry script: it is not drawn.
        url: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
        name: "picture.svg",
        image: true,
      },
    ],
  },
];

// Messages the person sent while the answer is written, waiting their turn: each can be sent now or
// taken back, and shows the files it carries: an image as a small preview, any other file by name.
export default function QueueMessages() {
  const [messages, setMessages] = useState(first);
  const take = (id: string) => {
    setMessages((now) => now.filter((message) => message.id !== id));
  };
  return (
    <Queue style={layout.column}>
      <QueueSection>
        <QueueSectionTrigger>
          <QueueSectionLabel
            count={messages.length}
            label="queued"
            icon={MessageSquareIcon}
          />
        </QueueSectionTrigger>
        <QueueSectionContent>
          <QueueList>
            {messages.map((message) => (
              <QueueItem key={message.id}>
                <QueueItemContent>{message.text}</QueueItemContent>
                <QueueItemActions>
                  <QueueItemAction
                    aria-label="Send now"
                    onClick={() => {
                      take(message.id);
                    }}
                  >
                    <Icon icon={SendIcon} />
                  </QueueItemAction>
                  <QueueItemAction
                    aria-label="Remove"
                    onClick={() => {
                      take(message.id);
                    }}
                  >
                    <Icon icon={TrashIcon} />
                  </QueueItemAction>
                </QueueItemActions>
                {message.files.length === 0 ? null : (
                  <QueueItemAttachment>
                    {message.files.map((file) =>
                      file.image ? (
                        <QueueItemImage
                          key={file.name}
                          src={file.url}
                          alt={file.name}
                        />
                      ) : (
                        <QueueItemFile key={file.name}>
                          {file.name}
                        </QueueItemFile>
                      )
                    )}
                  </QueueItemAttachment>
                )}
              </QueueItem>
            ))}
          </QueueList>
        </QueueSectionContent>
      </QueueSection>
    </Queue>
  );
}
