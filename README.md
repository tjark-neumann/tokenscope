# tokenscope

A small tokenizer visualizer. Paste text, pick a model, and see how it splits into tokens: with counts, per-token segments, and token ids.

It opens on a Claude tokenizer and also includes OpenAI's encodings, an exact Claude count via the API, and a tiny demo tokenizer.

## A note on the Claude tokenizer

Anthropic doesn't publish a tokenizer for current Claude models (Claude 3 and later), so there are two options here:

- **Claude (legacy public tokenizer)** — the older, publicly released vocab. Runs locally and shows per-token segments. Counts are approximate for newer models.
- **Claude (exact, via API)** — uses Anthropic's `count_tokens` endpoint, which is the only source of exact counts for current models. It returns a total only, no per-token breakdown, and needs an API key. The key is sent directly from the browser, so use a throwaway one or a proxy.

## What's included

| Family | Tokenizer | Segments | Notes |
|--------|-----------|----------|-------|
| Claude | Legacy public tokenizer | yes | approximate for Claude 3+ |
| Claude | Exact via `count_tokens` API | no | exact count, needs a key |
| OpenAI | o200k_base | yes | GPT-4o, GPT-4.1, o-series |
| OpenAI | cl100k_base | yes | GPT-4, GPT-3.5 |
| OpenAI | p50k_base, r50k_base | yes | older models |
| Other | Characters | yes | demo |

OpenAI counts are the BPE of the input text; real API usage adds a small per-message overhead.

## Adding a tokenizer

Tokenizers live in `src/tokenizers/`. Each one implements a small interface and is registered in `index.ts`. `char.ts` is a minimal example to copy; for any tiktoken-format vocab you can reuse the factory in `bpe.ts` instead of writing logic.

## Credit

Tokenization via [js-tiktoken](https://github.com/dqbd/tiktoken) and [@anthropic-ai/tokenizer](https://www.npmjs.com/package/@anthropic-ai/tokenizer). Inspired by [tiktokenizer](https://tiktokenizer.vercel.app).

## License

MIT.
