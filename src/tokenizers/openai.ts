import { fromTiktoken } from "./bpe";
import type { Tokenizer } from "./types";

// OpenAI's public encodings, loaded lazily from js-tiktoken's bundled ranks.
// Each entry maps the encoding to the models that use it. The token counts here
// are the exact BPE of the text; real chat-completion usage adds a small,
// model-specific message-format overhead on top.

export const openaiTokenizers: Tokenizer[] = [
  fromTiktoken({
    id: "openai/o200k_base",
    label: "GPT-4o · GPT-4.1 · o-series (o200k_base)",
    family: "OpenAI",
    loadRanks: () => import("js-tiktoken/ranks/o200k_base").then((m) => m.default),
  }),
  fromTiktoken({
    id: "openai/cl100k_base",
    label: "GPT-4 · GPT-3.5 · embeddings (cl100k_base)",
    family: "OpenAI",
    loadRanks: () => import("js-tiktoken/ranks/cl100k_base").then((m) => m.default),
  }),
  fromTiktoken({
    id: "openai/p50k_base",
    label: "Codex · text-davinci (p50k_base)",
    family: "OpenAI",
    loadRanks: () => import("js-tiktoken/ranks/p50k_base").then((m) => m.default),
  }),
  fromTiktoken({
    id: "openai/r50k_base",
    label: "GPT-3 (r50k_base / gpt2)",
    family: "OpenAI",
    loadRanks: () => import("js-tiktoken/ranks/r50k_base").then((m) => m.default),
  }),
];
