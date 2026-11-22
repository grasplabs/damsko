import { Inspector } from "@grasp-os/ui/blocks/inspector-01/inspector-01";
import { Avatar, AvatarFallback } from "@grasp-os/ui/components/avatar";
import { Badge } from "@grasp-os/ui/components/badge";
import { Link } from "@grasp-os/ui/components/link";
import { BuildingIcon } from "@grasp-os/ui/lib/icons";
import { size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  panel: { width: "100%", maxWidth: size.sidePanelWidth, height: 640 },
  person: { display: "inline-flex", alignItems: "center", gap: space["2"] },
});

// A record's facts from data: a label and a value each, a hairline between them. A link, a person,
// a date and a badge are values as given; a missing one is a quiet dash.
export default function InspectorFacts() {
  return (
    <Inspector
      aria-label="Company details"
      style={layout.panel}
      icon={BuildingIcon}
      title="Northwind Studio"
      description="A design studio in Amsterdam, a customer since 2024."
      sections={[
        {
          id: "facts",
          title: "Details",
          facts: [
            {
              id: "owner",
              label: "Owner",
              value: (
                <span {...stylex.props(layout.person)}>
                  <Avatar name="Mara Jensen" size="xs" decorative>
                    <AvatarFallback />
                  </Avatar>
                  Mara Jensen
                </span>
              ),
            },
            {
              id: "stage",
              label: "Stage",
              value: <Badge size="sm">Renewal</Badge>,
            },
            {
              id: "renews",
              label: "Renews",
              value: <time dateTime="2027-03-01">1 March 2027</time>,
            },
            {
              id: "website",
              label: "Website",
              value: <Link href="#northwind">northwind.example</Link>,
            },
            {
              id: "address",
              label: "Billing address",
              value: "Keizersgracht 123, 1015 CJ Amsterdam, the Netherlands",
            },
            { id: "vat", label: "VAT number", value: "" },
          ],
        },
        {
          id: "contacts",
          title: "Contacts",
          onAdd: () => undefined,
          emptyLabel: "Add a contact",
        },
      ]}
    />
  );
}
