"use client";

import { ConnectApiKey } from "@grasp-os/ui/blocks/connect-api-key-01/connect-api-key-01";
import type { ConnectApiKeyProvider } from "@grasp-os/ui/blocks/connect-api-key-01/connect-api-key-01";
import { Icon, MapPinIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { logos } from "../brand-icon/logos";

const layout = stylex.create({
  // A settings column: about 52rem.
  page: { width: "100%", maxWidth: "52rem" },
});

const where = (label: string) => ({ icon: <Icon icon={MapPinIcon} />, label });

const providers: ConnectApiKeyProvider[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    logo: logos.claude.logo,
    region: where("United States"),
    placeholder: "sk-ant-…",
  },
  {
    id: "openai",
    name: "OpenAI",
    logo: logos.chatgpt.logo,
    region: where("United States"),
    placeholder: "sk-proj-…",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    logo: logos.gemini.logo,
    region: where("United States"),
    placeholder: "AIza…",
  },
  {
    id: "mistral",
    name: "Mistral AI, La Plateforme",
    logo: logos.mistral.logo,
    region: where("France"),
  },
  { id: "custom", name: "Your own endpoint", address: true },
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
