// The whole extensibility story lives in this file. A tokenizer is anything that
// can turn text into a token count, and (optionally) into per-token segments for
// the visualization. Implement this interface, register it (see registry.ts),
// and it shows up in the dropdown. That is the entire process for adding a model.

export interface Token {
  /** Token id in the vocabulary, or null for tokenizers that don't expose ids. */
  id: number | null;
  /** Decoded display text for this single token. */
  text: string;
  /** True when this token is a fragment of a multi-byte character (e.g. inside an
   *  emoji), so the UI can render it as bytes rather than a broken glyph. */
  partial?: boolean;
}

export interface EncodeResult {
  /** Per-token segments. May be empty for count-only tokenizers (e.g. a remote API). */
  tokens: Token[];
  /** Authoritative token count. Always set, even when `tokens` is empty. */
  count: number;
  /** True if the count is exact for the named target; false if it's an approximation. */
  exact: boolean;
  /** Optional caveat shown next to the count (e.g. "legacy tokenizer", "count only"). */
  note?: string;
}

export interface Tokenizer {
  /** Stable unique key, e.g. "openai/o200k_base". */
  id: string;
  /** Human label for the dropdown, e.g. "GPT-4o / o-series (o200k_base)". */
  label: string;
  /** Group heading in the dropdown: "OpenAI" | "Claude" | "Other", or your own. */
  family: string;
  /** Whether encode() returns per-token segments (true) or just a count (false). */
  segmentation: boolean;
  /** Turn text into tokens + a count. Async so adapters can lazy-load vocab or call an API. */
  encode(text: string): Promise<EncodeResult>;
}
