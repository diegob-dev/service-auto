# Archivio foto tramite Telegram

Il bot riceve foto in chat privata dagli ID Telegram autorizzati e le aggiunge
all’archivio riservato. Supporta foto singole, album (una voce per foto) e immagini
inviate come file JPG, PNG, WebP o AVIF fino a 10 MB. La didascalia viene conservata.

Le foto restano nell’archivio fino al salvataggio finale dell’auto.
La ricevuta `telegram:<chat_id>:<message_id>` impedisce doppioni quando Telegram
riprova a consegnare lo stesso messaggio, anche dopo l’associazione a un’auto.

## Configurazione server

La funzione Supabase `telegram-images` richiede questi secret:

- `TELEGRAM_BOT_TOKEN`: token BotFather, soltanto lato server.
- `TELEGRAM_WEBHOOK_SECRET`: valore casuale passato a `setWebhook` come `secret_token`.
- `TELEGRAM_ALLOWED_USER_IDS`: ID numerici dei mittenti autorizzati, separati da virgola.

Il file locale `.env.telegram` è escluso da Git. Non inserire questi valori in
variabili `VITE_*` o nel frontend. Importare i valori nei secret del progetto
Supabase e pubblicare la funzione `telegram-images` prima di impostare il webhook.

Il callback è `https://<project-ref>.supabase.co/functions/v1/telegram-images`.
Impostare `allowed_updates` su `["message"]`. La verifica JWT Supabase è disattivata
per questo endpoint perché ogni richiesta è autenticata con il secret Telegram.
Le chat di gruppo e gli utenti non autorizzati vengono ignorati.

## Uso

Aprire la chat privata del bot, premere Avvia e inviare le foto. Nell’area riservata
premere **Aggiorna archivio** per vedere i nuovi arrivi. Non sono previste risposte
automatiche del bot: il risultato si controlla nell’archivio del sito.

Telegram può rimuovere la data di scatto dalle foto compresse. Per conservare i
metadati nell’originale, inviare come file; i metadati non disponibili non vengono
sostituiti con la data del messaggio.

Riferimento: [Telegram Bot API](https://core.telegram.org/bots/api#setwebhook).
