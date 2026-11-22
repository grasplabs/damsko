import {
  Queue,
  QueueItem,
  QueueItemAttachment,
  QueueItemContent,
  QueueItemImage,
  QueueList,
  QueueSection,
  QueueSectionContent,
  QueueSectionLabel,
  QueueSectionTrigger,
} from "@grasp-os/ui/components/queue";
import { MessageSquareIcon } from "@grasp-os/ui/lib/icons";
import { size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: { width: "100%", maxWidth: `calc(${size.popupWidth} * 1.6)` },
});

// A queued message's pictures, by address: a remote one is not drawn (loading it would tell its
// site who looked, and when) unless `allowRemote` says the source is trusted; nor is an SVG,
// which can carry script. A picture written into the address is.
export default function QueueUntrusted() {
  return (
    <Queue style={layout.column}>
      <QueueSection>
        <QueueSectionTrigger>
          <QueueSectionLabel
            count={1}
            label="queued"
            icon={MessageSquareIcon}
          />
        </QueueSectionTrigger>
        <QueueSectionContent>
          <QueueList>
            <QueueItem>
              <QueueItemContent>Use these for the cover</QueueItemContent>
              <QueueItemAttachment>
                <QueueItemImage
                  src="https://images.example.com/cover.jpg"
                  alt="cover.jpg"
                />
                <QueueItemImage
                  src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4="
                  alt="drawing.svg"
                />
                <QueueItemImage
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAFklEQVR42mOo6FlAEmIY1TCqYfhqAAAgvaQQhbmUggAAAABJRU5ErkJggg=="
                  alt="swatch.png"
                />
              </QueueItemAttachment>
            </QueueItem>
          </QueueList>
        </QueueSectionContent>
      </QueueSection>
    </Queue>
  );
}
