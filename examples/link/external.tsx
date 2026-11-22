import { Link } from "@grasp-os/ui/components/link";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const look = stylex.create({
  text: {
    maxWidth: 420,
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    color: colors.bodyForeground,
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: space["4"],
    alignItems: "baseline",
  },
});

// A link that leaves the product opens in a new tab and says so: a mark to the eye, words to a screen reader.
export default function LinkExternal() {
  return (
    <div {...stylex.props(look.row)}>
      <p {...stylex.props(look.text)}>
        Check the{" "}
        <Link href="https://status.example.com" external>
          status page
        </Link>{" "}
        for planned maintenance.
      </p>
      <Link href="https://help.example.com" variant="plain" external>
        Help centre
      </Link>
    </div>
  );
}
