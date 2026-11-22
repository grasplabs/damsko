import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from "@grasp-os/ui/components/chain-of-thought";
import { SearchIcon } from "@grasp-os/ui/lib/icons";
import { size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: { width: "100%", maxWidth: `calc(${size.popupWidth} * 1.6)` },
});

const results = ["northwind.example", "fabrikam.example", "contoso.example"];

// A search step holds what it found under its line: a quiet badge for each site.
export default function ChainOfThoughtResults() {
  return (
    <ChainOfThought defaultOpen style={layout.column}>
      <ChainOfThoughtHeader>Searched once and read 1 file</ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        <ChainOfThoughtStep
          label="Searched the web"
          description="competitor pricing"
          icon={SearchIcon}
        >
          <ChainOfThoughtSearchResults>
            {results.map((site) => (
              <ChainOfThoughtSearchResult key={site}>
                {site}
              </ChainOfThoughtSearchResult>
            ))}
          </ChainOfThoughtSearchResults>
        </ChainOfThoughtStep>
        <ChainOfThoughtStep label="Read pricing-2026.pdf" />
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
}
