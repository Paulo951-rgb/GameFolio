import type { AIProvider } from "@gamer-cv/types";
import { AnthropicProvider } from "./anthropic";
import { GeminiProvider } from "./gemini";
import { MockProvider } from "./mock";

/**
 * AI provider adapters (Phase 2). Each implements the `AIProvider` interface
 * from packages/types so the domain never couples to a vendor SDK. The active
 * provider is chosen by server config (env), swappable without touching core.
 *
 * Adapters shipped:
 *  - anthropic  — Anthropic Messages API (claude-3-5-sonnet). Server-only.
 *  - gemini     — Google Gemini REST API (gemini-2.0-flash). Generous free tier;
 *                 best "real IA quasi gratuite" option. Server-only, no SDK.
 *  - mock       — deterministic, tokenless; for tests and dev without an API key.
 */

export interface AIProviderRegistry {
  register(id: string, provider: AIProvider): this;
  get(id: string): AIProvider | undefined;
  active(): AIProvider;
}

export class AIProviderRegistryImpl implements AIProviderRegistry {
  private readonly providers = new Map<string, AIProvider>();
  private activeId: string | null = null;

  register(id: string, provider: AIProvider): this {
    if (this.providers.has(id)) {
      throw new Error(`AI provider "${id}" already registered`);
    }
    this.providers.set(id, provider);
    if (this.activeId === null) this.activeId = id;
    return this;
  }

  setActive(id: string): this {
    if (!this.providers.has(id)) {
      throw new Error(`Unknown AI provider "${id}"`);
    }
    this.activeId = id;
    return this;
  }

  get(id: string): AIProvider | undefined {
    return this.providers.get(id);
  }

  active(): AIProvider {
    if (this.activeId === null) {
      throw new Error("No AI provider registered");
    }
    return this.providers.get(this.activeId)!;
  }
}

/**
 * Build the active AIProvider from server environment variables.
 *
 *  - AI_PROVIDER: "anthropic" | "mock" (default: "mock" so dev works with no key)
 *  - ANTHROPIC_API_KEY: required when AI_PROVIDER=anthropic
 *  - ANTHROPIC_MODEL: optional model override
 *
 * The result is cached for the lifetime of the server process so repeated
 * requests reuse the same provider instance (and SDK client).
 */
let cached: { providerId: string; provider: AIProvider } | null = null;

export function createAIProvider(env: NodeJS.ProcessEnv = process.env): {
  providerId: string;
  provider: AIProvider;
} {
  const providerId = (env.AI_PROVIDER ?? "mock").toLowerCase();

  if (cached && cached.providerId === providerId) {
    return cached;
  }

  let provider: AIProvider;
  switch (providerId) {
    case "anthropic": {
      const apiKey = env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error(
          "AI_PROVIDER=anthropic requires ANTHROPIC_API_KEY to be set",
        );
      }
      provider = new AnthropicProvider({
        apiKey,
        model: env.ANTHROPIC_MODEL,
      });
      break;
    }
    case "gemini": {
      const apiKey = env.GEMINI_API_KEY ?? env.GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error(
          "AI_PROVIDER=gemini requires GEMINI_API_KEY (or GOOGLE_API_KEY) to be set",
        );
      }
      provider = new GeminiProvider({
        apiKey,
        model: env.GEMINI_MODEL,
      });
      break;
    }
    case "mock":
      provider = new MockProvider();
      break;
    default:
      throw new Error(`Unknown AI_PROVIDER "${providerId}"`);
  }

  cached = { providerId, provider };
  return cached;
}

export { AnthropicProvider, GeminiProvider, MockProvider };
