import type { Tokenizer } from "./types";

// The smallest possible adapter — one token per Unicode code point. It exists as
// a worked example: this is all it takes to add an encoder. Copy this file,
// change the logic, register it (see index.ts), done.

export const charTokenizer: Tokenizer = {
  id: "demo/char",
  label: "Characters (demo adapter)",
  family: "Other",
  segmentation: true,
  async encode(text: string) {
    const points = [...text]; // iterates by code point, not UTF-16 unit
    return {
      tokens: points.map((ch) => ({ id: ch.codePointAt(0) ?? null, text: ch })),
      count: points.length,
      exact: true,
      note: "One token per character. A demo, not a real model tokenizer.",
    };
  },
};
