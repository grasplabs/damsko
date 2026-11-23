import { Snippet } from "@grasp-os/ui/components-tw/snippet";

const tokens = ["--damsko-mint", "--damsko-foreground", "--damsko-background"];

export default function SnippetColours() {
  return (
    <div className="grid justify-items-start gap-2">
      {tokens.map((name) => (
        <Snippet
          key={name}
          size="sm"
          value={name}
          aria-label={`Copy ${name}`}
          swatch={`var(${name})`}
        />
      ))}
    </div>
  );
}
