import { Tiktoken } from "js-tiktoken/lite";
import type { TiktokenBPE } from "js-tiktoken/lite";
import type { Tokenizer, Token } from "./types";

// Both OpenAI's encodings and Claude's legacy tokenizer ship as the same
// "tiktoken" rank format: { bpe_ranks, special_tokens, pat_str }. js-tiktoken's
// pure-JS Tiktoken class loads any of them, no WebAssembly, no build hacks.
//
// To add another BPE model later you only need its rank JSON: write a one-line
// adapter that calls fromTiktoken() with a loader for that JSON. That's it.

const REPLACEMENT = "\uFFFD";

function decodeOne(enc: Tiktoken, id: number): Token {
  // Decoding a single id can yield U+FFFD when the token is a fragment of a
  // multi-byte character (common inside emoji / some CJK). The count is still
  // exact; we just flag the fragment so the UI can show it as bytes.
  const text = enc.decode([id]);
  return { id, text, partial: text.includes(REPLACEMENT) };
}

export interface TiktokenOptions {
  id: string;
  label: string;
  family: string;
  /** Lazily load the rank JSON (dynamic import keeps it out of the initial bundle). */
  loadRanks: () => Promise<TiktokenBPE>;
  /** NFKC-normalize before encoding (Claude's tokenizer does this). */
  normalize?: boolean;
  /** Allow all special tokens to be encoded as text rather than throwing. */
  allowSpecial?: boolean;
  exact?: boolean;
  note?: string;
}

export function fromTiktoken(opts: TiktokenOptions): Tokenizer {
  let enc: Tiktoken | null = null;

  return {
    id: opts.id,
    label: opts.label,
    family: opts.family,
    segmentation: true,
    async encode(text: string) {
      if (!enc) enc = new Tiktoken(await opts.loadRanks());
      const input = opts.normalize ? text.normalize("NFKC") : text;
      const ids = opts.allowSpecial
        ? enc.encode(input, "all")
        : enc.encode(input);
      const tokens = ids.map((id) => decodeOne(enc!, id));
      return {
        tokens,
        count: ids.length,
        exact: opts.exact ?? true,
        note: opts.note,
      };
    },
  };
}
