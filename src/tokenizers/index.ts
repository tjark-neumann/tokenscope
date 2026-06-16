import { register } from "./registry";
import { openaiTokenizers } from "./openai";
import { claudeLegacyTokenizer } from "./claude-legacy";
import { claudeApiTokenizer } from "./claude-api";
import { charTokenizer } from "./char";

// ── Add a new model here ────────────────────────────────────────────────────
// 1. Write an adapter that implements the Tokenizer interface (see char.ts for
//    the minimal example, or openai.ts for the BPE-via-rank-JSON pattern).
// 2. Import it above.
// 3. Add it to the list below.
// The dropdown, counting, and visualization pick it up automatically.

export function registerBuiltins(): void {
  claudeLegacyTokenizer && register(claudeLegacyTokenizer);
  register(claudeApiTokenizer);
  openaiTokenizers.forEach(register);
  register(charTokenizer);
}

export { all, get, grouped } from "./registry";
export type { Tokenizer, Token, EncodeResult } from "./types";
