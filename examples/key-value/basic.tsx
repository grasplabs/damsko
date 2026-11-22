import { KeyValueList } from "@grasp-os/ui/components/key-value";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 360 },
});

export default function KeyValueBasic() {
  return (
    <KeyValueList
      style={layout.box}
      items={[
        { id: "owner", label: "Owner", value: "Anna de Vries" },
        { id: "created", label: "Created", value: "3 November 2026" },
        {
          id: "daily-allowance",
          label: "Daily allowance",
          value: "38 of 50 requests left today",
        },
      ]}
    />
  );
}
