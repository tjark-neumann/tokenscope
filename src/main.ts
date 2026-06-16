import "./style.css";
import { registerBuiltins, grouped, get, type Tokenizer, type Token } from "./tokenizers";
import { getApiKey, setApiKey, getModel, setModel } from "./tokenizers/settings";

registerBuiltins();

const SAMPLE =
  "tokenscope shows how text becomes tokens.\n" +
  "Try emoji 🌍, code `x = f(y)`, numbers 2025, and CJK 你好.";

type View = "text" | "ids";
let currentId = "anthropic/claude-legacy";
let view: View = "text";

// ── build the DOM ───────────────────────────────────────────
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <header>
    <h1 class="wordmark">tokenscope</h1>
    <p class="tagline">See how text becomes tokens. Switch the model; the breakdown follows.</p>
  </header>

  <div class="controls">
    <label class="field">Model
      <select id="model"></select>
    </label>
    <label class="field">View
      <span class="seg" role="group" aria-label="Token view">
        <button id="view-text" aria-pressed="true">text</button>
        <button id="view-ids" aria-pressed="false">ids</button>
      </span>
    </label>
    <div class="settings" id="settings">
      <label class="field">Anthropic API key
        <input id="api-key" type="password" placeholder="sk-ant-…" autocomplete="off" />
      </label>
      <label class="field">Model id
        <input id="api-model" type="text" placeholder="claude-opus-4-8" />
      </label>
      <span class="hint">Key stays in your browser. Direct browser calls expose it — use a throwaway key or a proxy.</span>
    </div>
  </div>

  <textarea id="input" spellcheck="false" aria-label="Text to tokenize"></textarea>

  <div class="stats">
    <span class="stat primary"><span class="num" id="n-tokens">0</span><span class="lbl">tokens</span></span>
    <span class="stat"><span class="num" id="n-chars">0</span><span class="lbl">characters</span></span>
    <span class="stat"><span class="num" id="n-ratio">0</span><span class="lbl">chars / token</span></span>
    <span class="badge" id="badge"></span>
  </div>
  <p class="note" id="note"></p>

  <div class="tokens" id="tokens"></div>

  <footer>
    Built on <a href="https://github.com/dqbd/tiktoken" target="_blank" rel="noopener">js-tiktoken</a>
    and Anthropic's public legacy tokenizer. Add your own model in
    <code>src/tokenizers/</code> — see the README.
  </footer>
`;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const select = $<HTMLSelectElement>("model");
const input = $<HTMLTextAreaElement>("input");
const tokensEl = $<HTMLDivElement>("tokens");
const noteEl = $<HTMLParagraphElement>("note");
const badgeEl = $<HTMLSpanElement>("badge");
const settingsEl = $<HTMLDivElement>("settings");

// populate the model dropdown, grouped by family
for (const [family, list] of grouped()) {
  const og = document.createElement("optgroup");
  og.label = family;
  for (const t of list) {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = t.label;
    if (t.id === currentId) opt.selected = true;
    og.appendChild(opt);
  }
  select.appendChild(og);
}

// settings inputs
const keyInput = $<HTMLInputElement>("api-key");
const modelInput = $<HTMLInputElement>("api-model");
keyInput.value = getApiKey();
modelInput.value = getModel();
keyInput.addEventListener("input", () => { setApiKey(keyInput.value.trim()); recompute(); });
modelInput.addEventListener("input", () => { setModel(modelInput.value.trim()); recompute(); });

// ── rendering ───────────────────────────────────────────────
const WS: Record<string, string> = { " ": "·", "\n": "⏎", "\t": "⇥", "\r": "⏎" };

function tokenNode(tok: Token): HTMLElement {
  const span = document.createElement("span");
  span.className = "tok" + (tok.partial ? " partial" : "");
  if (tok.id !== null) span.title = `id ${tok.id}`;

  if (view === "ids") {
    span.classList.add("id");
    span.textContent = tok.id === null ? "·" : String(tok.id);
    return span;
  }
  // text view: keep characters, but make whitespace visible
  for (const ch of tok.text) {
    if (ch in WS) {
      const w = document.createElement("span");
      w.className = "ws";
      w.textContent = WS[ch];
      span.appendChild(w);
      if (ch === "\n") span.appendChild(document.createTextNode("\n"));
    } else {
      span.appendChild(document.createTextNode(ch));
    }
  }
  if (tok.text === "") span.textContent = "∅";
  return span;
}

function setBadge(exact: boolean) {
  badgeEl.textContent = exact ? "exact" : "estimate";
  badgeEl.className = "badge " + (exact ? "exact" : "estimate");
}

let runToken = 0;
async function recompute() {
  const tok: Tokenizer | undefined = get(currentId);
  if (!tok) return;
  settingsEl.classList.toggle("show", tok.id === "anthropic/count-tokens");

  const text = input.value;
  const chars = [...text].length;
  const myRun = ++runToken;

  try {
    const res = await tok.encode(text);
    if (myRun !== runToken) return; // a newer keystroke already superseded this

    $("n-tokens").textContent = res.count.toLocaleString();
    $("n-chars").textContent = chars.toLocaleString();
    $("n-ratio").textContent = res.count ? (chars / res.count).toFixed(2) : "0";
    setBadge(res.exact);
    noteEl.className = "note";
    noteEl.textContent = res.note ?? "";

    tokensEl.innerHTML = "";
    if (!tok.segmentation || res.tokens.length === 0) {
      const e = document.createElement("span");
      e.className = "empty";
      e.textContent = text
        ? "This tokenizer reports a count only — no per-token segments."
        : "Type something above.";
      tokensEl.appendChild(e);
      return;
    }
    const frag = document.createDocumentFragment();
    for (const t of res.tokens) frag.appendChild(tokenNode(t));
    tokensEl.appendChild(frag);
  } catch (err) {
    if (myRun !== runToken) return;
    noteEl.className = "note error";
    noteEl.textContent = err instanceof Error ? err.message : String(err);
    tokensEl.innerHTML = "";
  }
}

// ── events ──────────────────────────────────────────────────
let debounce: number | undefined;
input.addEventListener("input", () => {
  clearTimeout(debounce);
  debounce = window.setTimeout(recompute, 120);
});
select.addEventListener("change", () => { currentId = select.value; recompute(); });

function setView(v: View) {
  view = v;
  $("view-text").setAttribute("aria-pressed", String(v === "text"));
  $("view-ids").setAttribute("aria-pressed", String(v === "ids"));
  recompute();
}
$("view-text").addEventListener("click", () => setView("text"));
$("view-ids").addEventListener("click", () => setView("ids"));

// ── boot ────────────────────────────────────────────────────
input.value = SAMPLE;
recompute();
