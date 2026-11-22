import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@grasp-os/ui/components/card";
import {
  ChartArea,
  ChartContainer,
  ChartGrid,
  ChartTooltip,
  ChartXAxis,
  ChartYAxis,
} from "@grasp-os/ui/components/chart";
import { Stat } from "@grasp-os/ui/components/stat";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  card: { width: "100%", maxWidth: 720 },
  body: { display: "grid", gap: space["4"] },
  chart: { width: "100%" },
});

const data = [
  { month: "Jun", spend: 3120 },
  { month: "Jul", spend: 3480 },
  { month: "Aug", spend: 2960 },
  { month: "Sep", spend: 4210 },
  { month: "Oct", spend: 4630 },
  { month: "Nov", spend: 5180 },
];

const euros = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const money = (value: string | number) => euros.format(Number(value));

// Spend in a card, as the product's usage page shows it: the figure that matters at the card's
// start edge, then the months under it at the card's full width, with its grid, both axes (the
// y axis in euros), the area and a tooltip.
export default function ChartSpendCard() {
  return (
    <Card asChild style={layout.card}>
      <section>
        <CardHeader>
          <CardTitle level={2}>Spend</CardTitle>
          <CardDescription>Model calls, the last six months.</CardDescription>
        </CardHeader>
        <CardContent>
          <div {...stylex.props(layout.body)}>
            <Stat
              label="This month"
              value={money(5180)}
              change="+12% on October"
              variant="warning"
              unstyled
            />
            <ChartContainer
              aria-label="Spend by month"
              summary="Up from €3,120 in June to €5,180 in November."
              data={data}
              xKey="month"
              config={{ spend: { label: "Spend" } }}
              style={layout.chart}
            >
              <ChartGrid />
              <ChartXAxis />
              <ChartYAxis valueFormatter={money} width={56} />
              <ChartArea dataKey="spend" pattern="none" />
              <ChartTooltip />
            </ChartContainer>
          </div>
        </CardContent>
      </section>
    </Card>
  );
}
