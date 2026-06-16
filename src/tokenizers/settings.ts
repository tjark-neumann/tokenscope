// Small persistence helper for the optional Claude API option. Lives in
// localStorage in the user's own browser — never bundled, never committed.

const KEY = "tokenscope.anthropic_key";
const MODEL = "tokenscope.anthropic_model";
const DEFAULT_MODEL = "claude-opus-4-8";

export function getApiKey(): string {
  return localStorage.getItem(KEY) ?? "";
}
export function setApiKey(v: string): void {
  if (v) localStorage.setItem(KEY, v);
  else localStorage.removeItem(KEY);
}
export function getModel(): string {
  return localStorage.getItem(MODEL) || DEFAULT_MODEL;
}
export function setModel(v: string): void {
  localStorage.setItem(MODEL, v || DEFAULT_MODEL);
}
