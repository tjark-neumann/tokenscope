import { fromTiktoken } from "./bpe";
import type { TiktokenBPE } from "js-tiktoken/lite";
import type { Tokenizer } from "./types";

// The legacy, publicly released Claude tokenizer.
//
// IMPORTANT: Anthropic does not publish a tokenizer for current Claude models
// (Claude 3 and later) — see claude-api.ts for exact counts on those. This vocab
// (shipped in @anthropic-ai/tokenizer as claude.json) is the older public
// tokenizer. It's a useful, fully-local approximation and the only one that can
// show per-token segments, but treat its counts as an estimate for modern models.

export const claudeLegacyTokenizer: Tokenizer = fromTiktoken({
  id: "anthropic/claude-legacy",
  label: "Claude (legacy public tokenizer)",
  family: "Claude",
  normalize: true,
  allowSpecial: true,
  exact: false,
  note: "Legacy tokenizer. Approximate for Claude 3+; use the API option for exact counts.",
  loadRanks: () =>
    import("@anthropic-ai/tokenizer/claude.json").then(
      (m) => (m.default ?? m) as unknown as TiktokenBPE,
    ),
});
