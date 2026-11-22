"use client";

// Room 12, applications: real objects hung on the wall. Three walls: the share card, two slides,
// the first page of a proposal.
import { applicationWords } from "../content";
import { Proposal, ShareCard, Slides } from "../exhibits-apply";
import { Room, Wall } from "../frame";

export default function ApplicationsRoom() {
  return (
    <Room id="applications">
      <Wall
        room="applications"
        first
        ground="light"
        exhibit={<ShareCard />}
        rule={applicationWords.share}
      />
      <Wall
        room="applications"
        ground="night"
        exhibit={<Slides />}
        rule={applicationWords.slides}
      />
      <Wall
        room="applications"
        ground="light"
        exhibit={<Proposal />}
        rule={applicationWords.proposal}
      />
    </Room>
  );
}
