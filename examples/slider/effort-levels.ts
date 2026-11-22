// The scales the examples choose along: shared, not a page.
import type { SliderLevel } from "@grasp-os/ui/components/slider";

export const effort: SliderLevel[] = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "extra", label: "Extra high" },
  { id: "max", label: "Max" },
];

export const detail: SliderLevel[] = [
  { id: "brief", label: "Brief" },
  { id: "standard", label: "Standard" },
  { id: "thorough", label: "Thorough" },
];
