// Cattura il tipo di link prima che Supabase consumi e rimuova i parametri Auth.
const fragment = new URLSearchParams(typeof window === "undefined" ? "" : window.location.hash.slice(1));
const query = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
export const passwordRecoveryRedirect = {
  active: fragment.get("type") === "recovery" && fragment.has("access_token") && fragment.has("refresh_token"),
  invalid: query.has("error") || fragment.has("error") || query.has("error_code") || fragment.has("error_code"),
};

export function clearPasswordRecoveryError() {
  passwordRecoveryRedirect.invalid = false;
  const url = new URL(window.location.href);
  const hash = new URLSearchParams(url.hash.slice(1));
  const keys = ["error", "error_code", "error_description"];
  if (!keys.some((key) => url.searchParams.has(key) || hash.has(key))) return;
  for (const key of keys) {
    url.searchParams.delete(key);
    hash.delete(key);
  }
  url.hash = hash.toString();
  if (url.href !== window.location.href) window.history.replaceState(window.history.state, "", url);
}
