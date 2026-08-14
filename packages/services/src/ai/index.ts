import type { AIProvider } from "@gamer-cv/types";

/**
 * AI provider adapters (Phase 2). Each implements the `AIProvider` interface
 * from packages/types so the domain never couples to a vendor SDK. The active
 * provider is chosen by server config (env), swappable without touching core.
 *
 * Phase 0 ships only the registry/selection plumbing; concrete adapters
 * (Anthropic, OpenAI, Gemini, OpenRouter) are added in Phase 2.
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
