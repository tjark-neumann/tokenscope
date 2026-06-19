import { defineConfig } from "vite";

// base: "./" keeps asset paths relative so the built site works both at a
// domain root and under a GitHub Pages project subpath (user.github.io/repo/).
// The large chunks are the tokenizer vocabularies. they are code-split and
// lazy-loaded (only the selected model's vocab is fetched), so the warning is
// expected; we raise the limit rather than hide a real problem.
export default defineConfig({
  base: "./",
  build: { chunkSizeWarningLimit: 2600 },
});
