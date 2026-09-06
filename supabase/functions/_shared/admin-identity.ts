// Supabase Auth uses email identities internally. Username-only accounts use
// a deterministic address in the reserved .invalid domain; no mail is sent.
export function adminAuthEmail(identifier: string): string {
  const normalized = identifier.trim().toLowerCase();
  if (!normalized) throw new Error("Username o email obbligatorio");
  if (normalized.includes("@")) return normalized;
  const encoded = Array.from(new TextEncoder().encode(normalized), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
  return `${encoded}@admin.service.invalid`;
}
