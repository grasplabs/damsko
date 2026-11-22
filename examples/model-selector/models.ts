// The makers and models the Model selector's examples choose between, as a product keeps them:
// the makers' logos are the docs site's own (examples/brand-icon/logos.ts); Damsko ships none.
import type { IconData } from "@grasp-os/ui/lib/icons";

import { logos } from "../brand-icon/logos";

export interface Maker {
  id: string;
  name: string;
  logo: IconData;
}

export interface Model {
  id: string;
  name: string;
  maker: string;
  description?: string;
  /** Why it cannot be picked, when it cannot. */
  unavailable?: string;
}

export const makers: Maker[] = [
  { id: "anthropic", name: "Anthropic", logo: logos.claude.logo },
  { id: "openai", name: "OpenAI", logo: logos.chatgpt.logo },
  { id: "google", name: "Google", logo: logos.gemini.logo },
];

export const models: Model[] = [
  {
    id: "opus",
    name: "Claude Opus 5.5",
    maker: "anthropic",
    description: "Careful work and long documents",
  },
  {
    id: "sonnet",
    name: "Claude Sonnet 5.5",
    maker: "anthropic",
    description: "Everyday writing and analysis",
  },
  {
    id: "gpt",
    name: "GPT-5.2",
    maker: "openai",
    description: "Broad general knowledge",
  },
  {
    id: "gpt-mini",
    name: "GPT-5.2 mini",
    maker: "openai",
    unavailable: "Not on this plan",
  },
  {
    id: "gemini-pro",
    name: "Gemini 3 Pro",
    maker: "google",
    description: "Long context",
  },
  {
    id: "gemini-flash",
    name: "Gemini 3 Flash",
    maker: "google",
    description: "Fast answers",
  },
];

export const logoOf = (maker: string): IconData | undefined =>
  makers.find((each) => each.id === maker)?.logo;
