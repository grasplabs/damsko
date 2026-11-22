"use client";

import { ConnectApiKey } from "@grasp-os/ui/blocks/connect-api-key-01/connect-api-key-01";
import type { ConnectApiKeyProvider } from "@grasp-os/ui/blocks/connect-api-key-01/connect-api-key-01";
import { radius, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { FR, US } from "country-flag-icons/string/3x2";
import { useState } from "react";

import { logos } from "../brand-icon/logos";

const layout = stylex.create({
  // A settings column: about 52rem.
  page: { width: "100%", maxWidth: "52rem" },
});

const flags = stylex.create({
  // A region's flag, 3 by 2, beside its name: rounded, with the system's edge drawn inside, so a
  // white flag keeps its rim on a white ground.
  flag: {
    position: "relative",
    display: "inline-block",
    flexShrink: 0,
    overflow: "hidden",
    width: `calc(${space["3"]} * 3 / 2)`,
    height: space["3"],
    borderRadius: `calc(${space["3"]} / 4)`,
    cornerShape: radius.shape,
    lineHeight: 0,
    "::after": {
      content: "''",
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      cornerShape: "inherit",
      boxShadow: `inset ${size.borderStrong}`,
    },
  },
  picture: {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
});

// The drawing goes in as a data address, so no markup is written into the page. The product
// brings its own flags (country-flag-icons); the block takes the mark through `region.icon`.
const where = (flag: string, label: string) => ({
  icon: (
    <span aria-hidden="true" {...stylex.props(flags.flag)}>
      <img
        alt=""
        src={`data:image/svg+xml,${encodeURIComponent(flag)}`}
        {...stylex.props(flags.picture)}
      />
    </span>
  ),
  label,
});

const providers: ConnectApiKeyProvider[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    logo: logos.claude.logo,
    region: where(US, "United States"),
    placeholder: "sk-ant-…",
  },
  {
    id: "openai",
    name: "OpenAI",
    logo: logos.chatgpt.logo,
    region: where(US, "United States"),
    placeholder: "sk-proj-…",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    logo: logos.gemini.logo,
    region: where(US, "United States"),
    placeholder: "AIza…",
  },
  {
    id: "mistral",
    name: "Mistral AI, La Plateforme",
    logo: logos.mistral.logo,
    region: where(FR, "France"),
  },
  {
    id: "custom",
    name: "Your own endpoint",
    address: true,
    addressLabel: "Use an endpoint of your own",
  },
];

const starts: Record<string, string> = {
  anthropic: "sk-ant-",
  openai: "sk-",
  gemini: "AIza",
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Choose a provider and paste its key: a key that starts as the provider's do connects after a
// moment's test; any other is refused in the provider's words, and the key is cleared. Your own
// endpoint asks for its address first. Once connected: Replace key, or Disconnect.
export default function ConnectApiKeyBasic() {
  const [connected, setConnected] = useState<{
    provider: string;
    last: string;
  } | null>(null);
  return (
    <ConnectApiKey
      style={layout.page}
      title="AI provider"
      description="Choose the AI that chat and automations run on."
      providers={providers}
      connected={connected}
      onConnect={async ({ provider, key }) => {
        // One small call to test the key; a refusal says why.
        await wait(700);
        if (key.length < 24 || !key.startsWith(starts[provider] ?? "")) {
          throw new Error(
            "The provider refused this key: it is not a valid API key."
          );
        }
        setConnected({ provider, last: key.slice(-4) });
      }}
      onDisconnect={async () => {
        await wait(500);
        setConnected(null);
      }}
      disconnectDetail="Chat and automations stop using it, and its key is removed. Connecting again takes a new key."
    />
  );
}
