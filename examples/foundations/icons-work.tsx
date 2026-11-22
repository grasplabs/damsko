"use client";

import { Badge } from "@grasp-os/ui/components/badge";
import { Button } from "@grasp-os/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@grasp-os/ui/components/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@grasp-os/ui/components/input-group";
import {
  ArchiveIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  CircleIcon,
  CopyIcon,
  DownloadIcon,
  EllipsisIcon,
  Icon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
} from "@grasp-os/ui/lib/icons";
import {
  colors,
  font,
  media,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
// Icons, scene: icons at work. The same drawings in four real parts, each sized and coloured by the
// part that holds it: a button, a menu, a field and a status. Nothing here sets an icon's size.
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [media.maxMd]: "minmax(0, 1fr)",
    },
  },
  part: {
    display: "grid",
    alignContent: "start",
    rowGap: space["5"],
    minWidth: 0,
    paddingBlock: space["8"],
    paddingInline: { default: space["8"], [media.maxSm]: space["5"] },
  },
  // The lines between the four parts, never along the frame's own edge.
  top: { boxShadow: `inset 0 calc(-1 * ${size.hairline}) 0 ${colors.border}` },
  topStart: {
    boxShadow: {
      default: `inset calc(-1 * ${size.hairline}) calc(-1 * ${size.hairline}) 0 ${colors.border}`,
      [media.maxMd]: `inset 0 calc(-1 * ${size.hairline}) 0 ${colors.border}`,
    },
  },
  third: {
    boxShadow: {
      default: `inset calc(-1 * ${size.hairline}) 0 0 ${colors.border}`,
      [media.maxMd]: `inset 0 calc(-1 * ${size.hairline}) 0 ${colors.border}`,
    },
  },
  label: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    fontWeight: font.weightMedium,
    color: colors.mutedForeground,
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space["2"],
  },
  field: { width: "100%", maxWidth: "20rem" },
});

export default function IconsWork() {
  return (
    <div {...stylex.props(styles.grid)}>
      <div {...stylex.props(styles.part, styles.topStart)}>
        <p {...stylex.props(styles.label)}>In a button</p>
        <div {...stylex.props(styles.row)}>
          <Button variant="outline">
            <Icon icon={PlusIcon} />
            New report
          </Button>
          <Button variant="default">
            <Icon icon={CheckIcon} />
            Approve
          </Button>
          <Button variant="outline" size="icon" aria-label="More actions">
            <Icon icon={EllipsisIcon} />
          </Button>
        </div>
      </div>
      <div {...stylex.props(styles.part, styles.top)}>
        <p {...stylex.props(styles.label)}>In a menu</p>
        <div {...stylex.props(styles.row)}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Board report
                <Icon icon={ChevronDownIcon} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem icon={PencilIcon}>Rename</DropdownMenuItem>
              <DropdownMenuItem icon={CopyIcon}>Duplicate</DropdownMenuItem>
              <DropdownMenuItem icon={DownloadIcon}>
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem icon={ArchiveIcon}>Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div {...stylex.props(styles.part, styles.third)}>
        <p {...stylex.props(styles.label)}>In a field</p>
        <div {...stylex.props(styles.field)}>
          <InputGroup>
            <InputGroupAddon>
              <Icon icon={SearchIcon} />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              aria-label="Search projects"
              placeholder="Search projects"
            />
          </InputGroup>
        </div>
      </div>
      <div {...stylex.props(styles.part)}>
        <p {...stylex.props(styles.label)}>In a status</p>
        <div {...stylex.props(styles.row)}>
          <Badge variant="success" icon={CircleCheckIcon}>
            Published
          </Badge>
          <Badge variant="warning" icon={CircleIcon}>
            Waiting for you
          </Badge>
          <Badge variant="destructive" icon={CircleAlertIcon}>
            Sync stopped
          </Badge>
        </div>
      </div>
    </div>
  );
}
