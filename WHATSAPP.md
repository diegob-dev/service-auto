# Archivio foto

L’archivio consente anche il caricamento diretto dall’area riservata con **Carica
nell’archivio**. Le schede mostrano la data di caricamento; cliccando sull’immagine
si apre il dettaglio con la data di creazione/scatto, letta dai metadati EXIF del
file originale prima del ridimensionamento. Quando assente, viene indicata come
non disponibile: non si usa la data di modifica del file come data di scatto.
Applicare anche la migrazione `20261024213319_archive_upload_metadata.sql`.

La funzione è predisposta per **Meta WhatsApp Business Platform (Cloud API)**.
Il bot e il numero WhatsApp non sono ancora configurati: la sola pubblicazione
del sito non attiva la ricezione. Il webhook riceve immagini e non invia risposte.

## Uso nell’area riservata

1. Invia le foto al numero WhatsApp Business da uno dei numeri autorizzati.
   Una didascalia, ad esempio marca/modello o targa, aiuta a riconoscerle.
2. Apri **Archivio foto** per consultare le foto in attesa.
   Premi **Aggiorna archivio** per vedere nuovi arrivi o rinnovare le anteprime.
3. Crea o apri un’auto e vai al passaggio **Immagini**.
4. Seleziona le foto nell’ordine desiderato e premi **Associa foto selezionate**.
   La selezione è provvisoria fino al salvataggio finale nel riepilogo. Chiudendo
   l’editor prima di completarlo, le foto restano nell’archivio.
5. Al salvataggio finale le foto associate spariscono dall’archivio e vengono gestite come le foto
   caricate dal computer: copertina, riordino ed eliminazione. Se l’auto non ha
   copertina, la prima foto associata diventa copertina.

Il salvataggio finale dell’auto e tutte le associazioni selezionate avvengono in
un’unica transazione: se una foto non è disponibile, nessuna associazione viene
confermata e l’archivio rimane invariato. Aggiorna la scheda
prima di riprovare dopo un’interruzione di rete. L’archivio è riservato ad admin
e venditori attivi; i file in attesa sono in un bucket privato.

## Attivazione

1. Configura l’account Meta Business, l’app con prodotto WhatsApp, il numero
   Business e un access token server con i permessi necessari alla lettura dei media.
   Puoi iniziare con il numero di test fornito da Meta.
2. Applica la migrazione `20261021125326_whatsapp_image_archive.sql` al progetto
   Supabase prima di pubblicare la nuova interfaccia.
3. Configura questi secret **solo su Supabase**, mai in variabili `VITE_*`:

   | Secret | Contenuto |
   | --- | --- |
   | `WHATSAPP_VERIFY_TOKEN` | Stringa casuale scelta per la verifica webhook |
   | `WHATSAPP_APP_SECRET` | App Secret dell’app Meta, per validare le firme |
   | `WHATSAPP_ACCESS_TOKEN` | Token server per scaricare i media |
   | `WHATSAPP_PHONE_NUMBER_ID` | ID Meta del numero ricevente |
   | `WHATSAPP_GRAPH_VERSION` | Versione Graph API supportata dall’app, nel formato `vNN.0` |
   | `WHATSAPP_ALLOWED_SENDERS` | Numeri mittenti ammessi, separati da virgola, con prefisso internazionale senza `+` o spazi |

   `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` sono disponibili nell’ambiente
   delle Edge Functions ospitate. La service role non deve raggiungere il browser.

4. Pubblica la funzione con `npx supabase functions deploy whatsapp-images`.
   La configurazione `verify_jwt = false` è necessaria perché Meta non invia JWT
   Supabase: il webhook controlla invece la firma HMAC di ogni POST.
5. In Meta configura il callback
   `https://<project-ref>.supabase.co/functions/v1/whatsapp-images`,
   inserisci lo stesso verify token e sottoscrivi gli eventi `messages` del
   WhatsApp Business Account.
6. Pubblica il sito ed esegui il collaudo seguente.

## Collaudo prima dell’uso

- Invia due immagini da un numero autorizzato e controlla che compaiano soltanto
  nell’area riservata. Testi, notifiche di consegna e numeri non autorizzati vengono ignorati.
- Associale a una bozza e verifica ordine, copertina, rimozione dall’archivio e
  normale eliminazione dalla scheda auto.
- Ripeti la consegna dello stesso evento: non deve comparire una nuova foto,
  neppure dopo l’associazione o l’eliminazione dell’auto.
- Apri la stessa foto in due sessioni staff: soltanto una può associarla.
- Verifica che utenti anonimi o staff disattivati non possano leggere archivio
  e file privati. Esegui gli advisor Supabase dopo l’applicazione della migrazione.

I file accettati sono JPG, PNG e WebP fino a 10 MB. Per ora le foto devono essere
inviate come **immagini**, non come allegati documento. Prima dell’associazione
vengono applicati gli stessi ridimensionamento e miniature del caricamento attuale.

## Conservazione e recupero errori

Il record ricevuta rimane nel database con `attached_at` valorizzato per impedire
duplicati ai successivi tentativi di consegna Meta. La foto originale privata viene
rimossa dopo l’associazione; le foto pubbliche restano nel bucket `car-image`.
Se questa pulizia fallisce, la foto rimane comunque esclusa dall’archivio: si possono
ripulire i file privati dei record con `attached_at is not null` in un secondo momento.

In caso di risposta di rete ambigua durante l’associazione si conservano i nuovi
file, perché la transazione potrebbe essere già riuscita. Prima di eliminare
eventuali file orfani, verificare che nessun record `car_images` li referenzi.
Non eliminare le ricevute se si vuole mantenere la deduplicazione.

Riferimenti: [media nella raccolta ufficiale Meta](https://www.postman.com/meta/whatsapp-business-platform/request/ptjyi84/retrieve-media-url),
[esempio Meta di verifica delle firme](https://github.com/fbsamples/whatsapp-api-examples/blob/main/signature-validation-with-webhooks-payloads/app.py),
[permessi Storage Supabase](https://supabase.com/docs/guides/storage/security/access-control).
