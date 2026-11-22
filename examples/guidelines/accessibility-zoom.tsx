import { Badge } from "@grasp-os/ui/components/badge";
import { Card, CardDescription, CardTitle } from "@grasp-os/ui/components/card";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  // As narrow as a phone's column at 320px, less its gutters.
  narrow: {
    display: "grid",
    gap: space["4"],
    justifyItems: "start",
    width: "100%",
    maxWidth: 240,
    minWidth: 0,
  },
  card: { width: "100%" },
});

// A card a phone's width, in Dutch. The title wraps whole words and breaks a word only where it
// must; the words under it hyphenate where Dutch breaks them (lang="nl"). Nothing is cut, and no
// height is fixed, so the card grows with what it holds.
export default function AccessibilityZoom() {
  return (
    <div lang="nl" {...stylex.props(styles.narrow)}>
      <Card style={styles.card}>
        <CardTitle>Arbeidsongeschiktheidsverzekering</CardTitle>
        <CardDescription>
          De verzekeringsmaatschappij vraagt een bevestiging van de ingangsdatum
          en de werkgeversbijdrage.
        </CardDescription>
      </Card>
      <Badge variant="warning">Wachten op handtekening</Badge>
    </div>
  );
}
