import Anthropic from "@anthropic-ai/sdk";
import type {
  AIProvider,
  GenerationInput,
  GenerationOutput,
} from "@gamer-cv/types";
import { buildUserMessage, extractJson } from "./prompt";

/**
 * AnthropicProvider — concrete AIProvider backed by the Anthropic Messages API.
 *
 * Server-side ONLY: the API key never reaches the client. The provider is
 * instantiated once (factory in ./index.ts) and injected wherever generation
 * is needed, so the domain never imports the SDK directly.
 *
 * Structured output: the model is instructed to reply with a JSON object
 * matching GeneratedTextSchema; we extract the JSON from the response and
 * return it as `structured` (validated upstream by runGeneration). The raw
 * text is kept for debugging.
 */
export interface AnthropicProviderOptions {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  /** Injectable for tests (avoids real network). */
  client?: Anthropic;
}

export class AnthropicProvider implements AIProvider {
  private readonly client: Anthropic;
  private readonly model: string;
  private readonly maxTokens: number;

  constructor(opts: AnthropicProviderOptions) {
    if (!opts.apiKey) {
      throw new Error("AnthropicProvider: apiKey is required");
    }
    this.client = opts.client ?? new Anthropic({ apiKey: opts.apiKey });
    this.model = opts.model ?? "claude-3-5-sonnet-latest";
    // 4096 leaves headroom for a detailed CV (many games, full sections) so the
    // structured JSON isn't truncated mid-object (truncation → parse failure →
    // 500). 2048 was too tight for "detailed" mode / 5+ games.
    this.maxTokens = opts.maxTokens ?? 4096;
  }

  async generate(input: GenerationInput): Promise<GenerationOutput> {
    const userMessage = buildUserMessage(input);

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      system: input.systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const raw = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    return { structured: extractJson(raw), raw };
  }
}
