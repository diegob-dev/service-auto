// Traduce i messaggi più comuni di Supabase (in inglese) in italiano.
// I messaggi già in italiano, o non riconosciuti, restano invariati.
const translations: Array<[RegExp, string]> = [
  [/invalid login credentials/i, "Username, email o password non corretti."],
  [/email not confirmed/i, "L'indirizzo email non è ancora stato confermato."],
  [/user is banned|user banned/i, "Account disattivato. Contatta un amministratore."],
  [/already (been )?registered|email_exists|email address.*exists/i, "Esiste già un utente con questa email."],
  [/new password should be different/i, "La nuova password deve essere diversa da quella attuale."],
  [/password should (be|contain)|weak_password|password is too weak/i, "La password non è abbastanza sicura: usa almeno 10 caratteri."],
  [/duplicate key value.*slug/i, "Esiste già un'auto con lo stesso indirizzo di pagina. Riprova."],
  [/duplicate key value/i, "Esiste già un elemento con questi dati."],
  [/row-level security|permission denied|not authorized|42501/i, "Non hai i permessi per questa operazione."],
  [/jwt expired|invalid jwt|auth session missing|refresh token/i, "La sessione è scaduta: accedi di nuovo."],
  [/failed to fetch|networkerror|load failed|network request failed/i, "Connessione non riuscita. Controlla la rete e riprova."],
  [/exceeded the maximum allowed size|payload too large|entity too large/i, "La fotografia supera la dimensione massima consentita."],
  [/mime type .* not supported|invalid mime/i, "Formato della fotografia non supportato."],
  [/rate limit|too many requests|for security purposes, you can only request/i, "Troppi tentativi ravvicinati: attendi qualche istante e riprova."],
  [/edge function returned a non-2xx/i, "Operazione non riuscita sul server. Riprova."],
];

export function translateError(message: string) {
  for (const [pattern, translation] of translations) {
    if (pattern.test(message)) return translation;
  }
  return message;
}

export function adminError(message: string) {
  return new Error(translateError(message));
}
