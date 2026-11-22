import { KeyValueList } from "@grasp-os/ui/components/key-value";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 400 },
});

// A list that stands on its own, with a line between the rows. An id in the mono face can be copied.
export default function KeyValueDivided() {
  return (
    <KeyValueList
      divided
      style={layout.box}
      items={[
        { id: "display-name", label: "Display name", value: "Anna de Vries" },
        {
          id: "email",
          label: "Email",
          value: "anna@northwind.example",
          copyable: true,
        },
        {
          id: "user-id",
          label: "User ID",
          value: "usr_01J9X4F81C2QK7M3",
          mono: true,
          copyable: true,
        },
      ]}
    />
  );
}
