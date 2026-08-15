import type {
  AIProvider,
  GenerationInput,
  GenerationOutput,
} from "@gamer-cv/types";
import { buildUserMessage, extractJson } from "./prompt";

/**
 * GeminiProvider — concrete AIProvider backed by the Google Gemini REST API
 * (generativelanguage.googleapis.com).
 *
 * WHY GEMINI: Google offers a generous free tier on Gemini models (rate-limited
 * by RPM/RPD, not by spending), making it the cheapest way to get REAL AI
 * generation for testing GameFolio without a credit card. The free tier is more
 * than enough to exercise the full analysis/anti-hallucination pipeline.
 *
 * IMPLEMENTATION NOTES:
 *  - Uses the REST endpoint directly (native fetch), so there is NO SDK
 *    dependency to install — keeps packages/services light and avoids native
 *    build issues. The `@google/generative-ai` SDK is intentionally avoided.
 *  - Server-side ONLY: the API key never reaches the client. Instantiated once
 *    (factory in ./index.ts), never imported by core.
 *  - Structured output: like Anthropic, the model is instructed (via the shared
 *    buildUserMessage) to reply with a JSON object matching GeneratedTextSchema.
 *    We request JSON via both the prompt AND the `responseMimeType: "application/json"`
 *    field (Gemini's native structured-output mode) to minimize prose wrapping.
 *  - The extracted JSON is returned as `structured` (validated upstream by
 *    runGeneration); raw text kept for debugging.
 *  - `fetchImpl` is injectable for tests so the integration test never touches
 *    the network.
 */
export interface GeminiProviderOptions {
  apiKey: string;
  /** e.g. "gemini-2.0-flash" / "gemini-1.5-flash". Free tier applies. */
  model?: string;
  maxOutputTokens?: number;
  /** Injectable for tests (avoids real network). Defaults to global fetch. */
  fetchImpl?: typeof fetch;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
}

const DEFAULT_MODEL = "gemini-2.0-flash";

export class GeminiProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly maxOutputTokens: number;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: GeminiProviderOptions) {
    if (!opts.apiKey) {
      throw new Error("GeminiProvider: apiKey is required");
    }
    this.apiKey = opts.apiKey;
    this.model = opts.model ?? DEFAULT_MODEL;
    // Match Anthropic's headroom: a detailed CV (many games, full sections) can
    // approach 2-3k tokens of structured JSON. 4096 avoids mid-object truncation.
    this.maxOutputTokens = opts.maxOutputTokens ?? 4096;
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  async generate(input: GenerationInput): Promise<GenerationOutput> {
    const userMessage = buildUserMessage(input);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const body = {
      // Gemini accepts an inline system instruction via systemInstruction.
      systemInstruction: { parts: [{ text: input.systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig: {
        // Ask Gemini to emit JSON natively (reduces prose/code-fence wrapping,
        // so extractJson still works even if Gemini adds a fence anyway).
        responseMimeType: "application/json",
        maxOutputTokens: this.maxOutputTokens,
        temperature: 0.7,
      },
    };

    const res = await this.fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(
        `GeminiProvider: API error ${res.status} ${res.statusText}${errText ? ` — ${errText}` : ""}`,
      );
    }

    const json = (await res.json()) as GeminiResponse;

    // Surface Gemini's content blocking clearly instead of crashing on undefined.
    if (!json.candidates || json.candidates.length === 0) {
      const reason = json.promptFeedback?.blockReason;
      throw new Error(
        reason
          ? `GeminiProvider: generation blocked (${reason})`
          : "GeminiProvider: empty response (no candidates)",
      );
    }

    const candidate = json.candidates[0];
    const raw =
      candidate.content?.parts
        ?.map((p) => p.text ?? "")
        .join("") ?? "";

    if (!raw) {
      throw new Error(
        `GeminiProvider: empty text (finishReason=${candidate.finishReason ?? "unknown"})`,
      );
    }

    return { structured: extractJson(raw), raw };
  }
}
