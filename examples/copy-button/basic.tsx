import { CopyButton } from "@grasp-os/ui/components/copy-button";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: { display: "flex", alignItems: "center", gap: space[2] },
});

const code = `import { Badge } from "@grasp-os/ui/components/badge";

export function ReportStatus({ ready }: { ready: boolean }) {
  return <Badge variant={ready ? "default" : "secondary"}>{ready ? "Ready" : "Draft"}</Badge>;
}`;

// Icon only, named by what it copies, and with words beside the icon. The check shows once it is
// copied, and a screen reader hears it once.
export default function CopyButtonBasic() {
  return (
    <div {...stylex.props(layout.row)}>
      <CopyButton value={code} aria-label="Copy code" />
      <CopyButton
        value={() => "https://example.com/reports/q3"}
        variant="outline"
        size="sm"
      >
        Copy link
      </CopyButton>
    </div>
  );
}
