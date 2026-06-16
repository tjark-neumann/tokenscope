import type { Tokenizer } from "./types";

// A tiny registry. Tokenizers register themselves (or are registered in index.ts)
// and the UI reads from here. No framework, no magic — just a Map.

const registry = new Map<string, Tokenizer>();

export function register(tokenizer: Tokenizer): void {
  if (registry.has(tokenizer.id)) {
    throw new Error(`tokenizer id already registered: ${tokenizer.id}`);
  }
  registry.set(tokenizer.id, tokenizer);
}

export function get(id: string): Tokenizer | undefined {
  return registry.get(id);
}

export function all(): Tokenizer[] {
  return [...registry.values()];
}

/** Tokenizers grouped by family, preserving registration order — handy for
 *  building <optgroup>s in the dropdown. */
export function grouped(): Map<string, Tokenizer[]> {
  const out = new Map<string, Tokenizer[]>();
  for (const t of registry.values()) {
    const list = out.get(t.family) ?? [];
    list.push(t);
    out.set(t.family, list);
  }
  return out;
}
