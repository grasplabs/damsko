// The makers, models and effort levels the Model selector's examples choose between, as a product
// keeps them: the makers' logos are the docs site's own (examples/brand-icon/logos.ts); Damsko ships
// none.
import type { IconData } from "@grasp-os/ui/lib/icons";

import { logos } from "../brand-icon/logos";

export interface Maker {
  id: string;
  name: string;
  logo: IconData;
}

export interface Level {
  value: string;
  label: string;
}

export interface Model {
  id: string;
  name: string;
  maker: string;
  description: string;
  /** Out of use; its description says why. */
  unavailable?: boolean;
  /** The levels of effort it offers, from the least to the most; none for a model without. */
  levels?: Level[];
}

export const makers: Maker[] = [
  { id: "anthropic", name: "Anthropic", logo: logos.claude.logo },
  { id: "openai", name: "OpenAI", logo: logos.chatgpt.logo },
  { id: "google", name: "Google", logo: logos.gemini.logo },
];

const five: Level[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "extra", label: "Extra high" },
  { value: "max", label: "Max" },
];
const three = five.slice(0, 3);

export const models: Model[] = [
  {
    id: "opus",
    name: "Claude Opus 5.5",
    maker: "anthropic",
    description: "Careful work and long documents",
    levels: five,
  },
  {
    id: "sonnet",
    name: "Claude Sonnet 5.5",
    maker: "anthropic",
    description: "Everyday writing and analysis",
    levels: three,
  },
  {
    id: "haiku",
    name: "Claude Haiku 5.5",
    maker: "anthropic",
    description: "Quick answers",
  },
  {
    id: "gpt",
    name: "GPT-5.2",
    maker: "openai",
    description: "Broad general knowledge",
    levels: five,
  },
  {
    id: "gpt-mini",
    name: "GPT-5.2 mini",
    maker: "openai",
    description: "Not on this plan",
    unavailable: true,
  },
  {
    id: "gemini-pro",
    name: "Gemini 3 Pro",
    maker: "google",
    description: "Long context",
    levels: three,
  },
  {
    id: "gemini-flash",
    name: "Gemini 3 Flash",
    maker: "google",
    description: "Fast answers",
  },
];

export const modelOf = (id: string): Model | undefined =>
  models.find((model) => model.id === id);

export const logoOf = (maker: string): IconData | undefined =>
  makers.find((each) => each.id === maker)?.logo;

/** Keeps the effort a level the new model has: the same one, else its strongest. */
export const effortFor = (id: string, effort: string): string => {
  const own = modelOf(id)?.levels ?? [];
  return own.some((level) => level.value === effort)
    ? effort
    : (own.at(-1)?.value ?? "");
};
