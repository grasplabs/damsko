import { colors, font, media, space } from "@grasp-os/ui/lib/tokens.stylex";
// The brand book as one still document (/brand/book): a cover with the contents, then every room in
// the order of the table of contents, each part in its still form (still.ts). A script after the
// build turns this page into one self-contained file (book-file.ts). The same rooms and words as
// /brand, so the two cannot drift.
import * as stylex from "@stylexjs/stylex";

import { bookWords, frameWords, rooms } from "./content";
import { nameSetting } from "./entrance";
import { Glass } from "./glass";
import ApplicationsRoom from "./rooms/applications";
import ColourRoom from "./rooms/colour";
import DownloadsRoom from "./rooms/downloads";
import GraspRoom from "./rooms/grasp";
import IconsRoom from "./rooms/icons";
import LayoutRoom from "./rooms/layout";
import LogoRoom from "./rooms/logo";
import MotionRoom from "./rooms/motion";
import NamesRoom from "./rooms/names";
import ProductRoom from "./rooms/product";
import TypeRoom from "./rooms/type";
import VisualRoom from "./rooms/visual-language";
import VoiceRoom from "./rooms/voice";
import { StillContext } from "./still";

const s = stylex.create({
  book: {
    backgroundColor: colors.background,
    color: colors.bodyForeground,
    fontFamily: font.sans,
  },
  cover: {
    position: "relative",
    isolation: "isolate",
    display: "grid",
    alignContent: "center",
    justifyItems: "center",
    gap: space["6"],
    minHeight: "100svh",
    paddingInline: space["6"],
    paddingBlock: space["16"],
    textAlign: "center",
    colorScheme: "dark",
    backgroundColor: colors.brandNight,
  },
  // The entrance's glass, one pane each side behind the cover.
  coverGlass: { position: "absolute", inset: 0, zIndex: -1 },
  line: {
    margin: 0,
    maxWidth: "30rem",
    fontSize: font.textLg,
    lineHeight: font.textLgLine,
    color: colors.bodyForeground,
  },
  contents: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 15rem))",
      [media.maxSm]: "minmax(0, 1fr)",
    },
    columnGap: space["10"],
    rowGap: space["2"],
    margin: 0,
    marginBlockStart: space["8"],
    padding: 0,
    listStyle: "none",
    textAlign: "start",
  },
  contentsName: {
    gridColumn: "1 / -1",
    marginBlockEnd: space["2"],
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
  },
  entry: {
    display: "flex",
    gap: space["3"],
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    color: colors.foreground,
    textDecorationLine: "none",
  },
  number: { color: colors.mutedForeground, fontVariantNumeric: "tabular-nums" },
  from: {
    margin: 0,
    marginBlockStart: space["8"],
    maxWidth: "30rem",
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
  },
});

export default function Book({ sketches }: { sketches: string[] }) {
  return (
    <StillContext.Provider value>
      <div {...stylex.props(s.book)}>
        <header id={frameWords.coverId} {...stylex.props(s.cover)}>
          <span aria-hidden="true" {...stylex.props(s.coverGlass)}>
            <Glass shape="pane" />
          </span>
          <h1 {...stylex.props(nameSetting.name)}>{bookWords.cover}</h1>
          <p {...stylex.props(s.line)}>{bookWords.line}</p>
          <nav id={frameWords.contentsId} aria-label={bookWords.contents}>
            <ol {...stylex.props(s.contents)}>
              <li {...stylex.props(s.contentsName)}>{bookWords.contents}</li>
              {rooms.map((room) => (
                <li key={room.id}>
                  <a href={`#room-${room.id}`} {...stylex.props(s.entry)}>
                    <span {...stylex.props(s.number)}>{room.number}</span>
                    <span>{room.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <p {...stylex.props(s.from)}>{bookWords.from}</p>
        </header>
        <GraspRoom />
        <NamesRoom />
        <LogoRoom />
        <ColourRoom />
        <TypeRoom />
        <VoiceRoom />
        <VisualRoom sketches={sketches} />
        <MotionRoom />
        <IconsRoom />
        <LayoutRoom />
        <ProductRoom />
        <ApplicationsRoom />
        <DownloadsRoom />
      </div>
    </StillContext.Provider>
  );
}
