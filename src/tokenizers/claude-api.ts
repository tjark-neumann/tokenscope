import type { Tokenizer } from "./types";
import { getApiKey, getModel } from "./settings";

// The only way to get *exact* token counts for current Claude models is the
// Anthropic count_tokens endpoint. It returns a total (input_tokens), not a
// per-token breakdown — so this adapter reports a count with no segments.
//
// SECURITY: calling api.anthropic.com directly from a browser requires the
// `anthropic-dangerous-direct-browser-access` header and exposes your API key to
// the page. Fine for local/dev use with a throwaway key. For anything public,
// proxy this through a tiny server endpoint and point ENDPOINT at it instead.

const ENDPOINT = "https://api.anthropic.com/v1/messages/count_tokens";

export const claudeApiTokenizer: Tokenizer = {
  id: "anthropic/count-tokens",
  label: "Claude (exact · via API)",
  family: "Claude",
  segmentation: false,
  async encode(text: string) {
    const key = getApiKey();
    if (!key) {
      return {
        tokens: [],
        count: 0,
        exact: true,
        note: "Add an Anthropic API key in settings to use the exact endpoint.",
      };
    }
    if (!text) return { tokens: [], count: 0, exact: true };

    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: getModel(),
        messages: [{ role: "user", content: text }],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`count_tokens failed (${res.status}): ${detail.slice(0, 200)}`);
    }
    const data = (await res.json()) as { input_tokens: number };
    return {
      tokens: [],
      count: data.input_tokens,
      exact: true,
      note: `Exact for ${getModel()}. Count only; the endpoint returns no per-token segments.`,
    };
  },
};
