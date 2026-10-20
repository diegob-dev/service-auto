# Consegna SERVICE SRL

## Configurazione del sito

Hosting previsto: Cloudflare Pages, build `npm run build`, cartella di pubblicazione `dist`.
Dominio comunicato dal titolare: `https://servicevigevano.store`.
Ramo collegato a Cloudflare indicato come frontend; nel repository è `front-end`.
Il rilascio viene pubblicato dal checkout `02-auto-usate` al ramo remoto `front-end`.
Verificare sempre il deploy effettivo sul dominio dopo il push.
Usare Node compatibile con le dipendenze del progetto e installare con `npm ci` dal lockfile.

Il progetto usa `wrangler.toml` come configurazione Cloudflare. Le due impostazioni
pubbliche di Supabase sono definite nella sezione `[vars]` per essere disponibili
durante la build; le sole impostazioni del pannello non erano sufficienti.
Non inserire credenziali SMTP, chiavi Resend o chiavi Supabase private nel file.
Le variabili di riferimento sono descritte in `.env.example`:

- `VITE_SUPABASE_URL`: URL del progetto destinato al cliente.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: chiave pubblicabile; mai la service role.
- `VITE_SITE_URL`: dominio HTTPS definitivo, già impostato in `.env.production`.
- `VITE_SITE_INDEXABLE`: impostare `false` per forzare l'esclusione dall'indicizzazione.

Senza `VITE_SITE_URL`, oppure con `VITE_SITE_INDEXABLE=false`, la build genera
`noindex, nofollow` e un robots che blocca la scansione. Sulle build Cloudflare
il controllo `CF_PAGES_BRANCH` abilita l'indicizzazione solo per `front-end` o
`frontend`; gli altri rami restano esclusi anche nel codice eseguito dal browser.
La build di sviluppo resta esclusa. `npm run build` genera HTML completo per
le otto pagine pubbliche e per ogni auto pubblicata, con titoli, descrizioni,
canonical e anteprime specifiche già nell'HTML. Le schede includono dati
strutturati Car e, quando il prezzo è presente, Offer. La sitemap comprende
anche le auto pubblicate e la loro data di aggiornamento. Bozze e auto vendute
non vengono esportate. La generazione usa solo la chiave pubblicabile e le
letture pubbliche esistenti; se il catalogo non è raggiungibile, la build fallisce
per evitare di distribuire pagine o sitemap incomplete.

Il browser verifica subito i dati correnti delle auto dopo aver caricato l'HTML.
HTML iniziale, anteprime dei social e sitemap sono invece una fotografia del
catalogo al momento della build: dopo creazioni, modifiche, vendite o rimozioni
di annunci occorre eseguire un nuovo deploy Cloudflare Pages. Senza questo
passaggio i motori e i social possono leggere informazioni superate. Non è
configurato un trigger automatico dall'area amministrativa.

Cloudflare serve gli URL delle pagine senza estensione dai rispettivi `.html`,
compresa l'area amministrativa (`admin.html`, esclusa dall'indicizzazione).
Non si usa un file `_redirects`: Cloudflare trasformerebbe le riscritture verso
file `.html` in redirect all'URL senza estensione, e l'app mostrerebbe 404.
Gli URL senza pagina statica ricevono `404.html`, esclusa dall'indicizzazione:
per un indirizzo inesistente l'app mostra "Pagina non trovata", mentre un'auto
pubblicata dopo l'ultima build viene comunque caricata e mostrata dall'app
(con stato HTTP 404 finché un nuovo deploy non genera la sua pagina).

## Attivazione e verifica SEO

1. Pubblicare la build e verificare sul dominio `/robots.txt`, `/sitemap.xml`,
   `/officina` e una scheda auto, controllando che l'HTML contenga testo e
   metadati specifici senza eseguire JavaScript.
2. In Google Search Console, verificare la proprietà del dominio con l'account
   del titolare e inviare `https://servicevigevano.store/sitemap.xml`.
3. Usare Controllo URL per home, officina, servizi, catalogo e una scheda auto;
   verificare canonical, indicizzabilità e HTML della pagina scansionata.
4. Nel Profilo dell'attività su Google, verificare con il titolare nome,
   categoria, indirizzo, telefono, sito e orari; completare servizi e foto.
   I dati devono corrispondere a quelli pubblicati sul sito.
5. Dopo l'indicizzazione, monitorare ricerche, impressioni e clic in Search
   Console. La presenza dei metadati non garantisce un posizionamento specifico.

Search Console e il Profilo dell'attività richiedono l'accesso dell'account
Google autorizzato; non vengono configurati dalla build del sito.

Il file `public/_headers` configura gli header di base su Cloudflare Pages.
L'area `/admin` riceve anche `X-Robots-Tag: noindex, nofollow`.
Verificare sul dominio effettivo che siano applicati.

## Database e account

Il 10 ottobre 2026 il catalogo risultava irraggiungibile perché il progetto
Supabase `service-auto` era nello stato `INACTIVE`. Il progetto è stato
riattivato e il catalogo è stato verificato nel browser locale. Prima della consegna definire
la gestione della disponibilità: i progetti Free possono essere sospesi per
scarsa attività nell'arco di sette giorni. Riferimento:
[Project Pausing](https://supabase.com/docs/guides/platform/free-project-pausing).

Confrontare le migrazioni locali con quelle applicate al progetto remoto,
in particolare le operazioni atomiche del 30 settembre, le policy targhe
per venditori del 1 ottobre 2026 e `20261015120000_preserve_license_plate`
del 15 ottobre 2026, che modifica la targa solo quando la richiesta contiene
il campo `license_plate`. La migrazione `20261020100000_car_image_thumbnails`
aggiunge le miniature delle foto: va applicata **prima** di pubblicare il nuovo
frontend, perché il catalogo pubblico legge la colonna `thumbnail_path`
(altrimenti la build fallisce durante il prerender). Le nuove foto ricevono la
miniatura al caricamento; quelle già presenti la ottengono in automatico, in
background, la prima volta che qualcuno dello staff apre l'area admin dopo il
deploy. Finché manca, il sito usa la foto completa.
Distribuire la versione corrente di `admin-users`
seguendo il README. Non considerare una build del frontend come conferma
dell'aggiornamento del database o della funzione.

Verificare con un account amministratore e uno venditore che:

- un visitatore possa leggere solo gli annunci pubblicati e non le targhe;
- un venditore possa gestire auto, foto e targhe, ma non gli utenti;
- un account disattivato non possa leggere dati riservati o modificare annunci,
  anche usando una sessione già aperta;
- nessun utente possa rimuovere il proprio accesso amministratore;
- creazione e disattivazione utenti funzionino sul backend remoto;
- salvare un'auto senza modificare la targa non la cancelli;
- un tentativo di registrazione pubblica venga rifiutato.

Ogni utente può cambiare la propria password e richiedere un link di recupero
dal login. Il frontend e la funzione server richiedono email reali per i nuovi
account. Gli username legacy continuano a funzionare per il login, ma non
possono ricevere mail finché non viene associato un indirizzo reale.
Non convertire account senza avere verificato il titolare della nuova email.

Sul progetto remoto, verificare:

- Site URL `https://servicevigevano.store`;
- registrazioni pubbliche disattivate: gli account si creano solo dall'area admin;
- lunghezza minima della password di 10 caratteri;
- redirect consentito `https://servicevigevano.store/admin`;
- servizio di invio SMTP e template contenente il link di conferma;
- recapito a una casella reale, apertura del link, aggiornamento password,
  nuova autenticazione e comportamento di link scaduti o già usati.

È stato scelto Resend come servizio separato per le email di recupero.
La configurazione e il template sono descritti in [EMAIL.md](EMAIL.md).
L'attivazione richiede ancora accesso a Resend, verifica DNS su Cloudflare e
configurazione SMTP sul progetto Supabase.
La configurazione locale non cambia le impostazioni del progetto remoto.
Conservare almeno un account amministratore di emergenza sotto il controllo
del titolare e documentare chi può intervenire dalla dashboard Supabase.

## Dati e contenuti da confermare con il cliente

- Dati inseriti: SERVICE SRL, P. IVA 00173600180, Corso Brodolini 32,
  27029 Vigevano (PV), info@servicevigevano.it.
- REA proposto: PV 95585. Non mostrato sul sito finché non è verificato su visura.
- Informative presenti in `/privacy` e `/cookie`, basate su Cloudflare, Supabase,
  contatti diretti e mappa Google su richiesta. Confermare configurazione di log,
  conservazione, regione del database e garanzie dei fornitori; aggiornare i testi
  se si abilitano analytics, strumenti pubblicitari o altri servizi.
- Telefono, indirizzo operativo, orari, foto e testi sui servizi e sulle garanzie.
- Prezzi, chilometraggi, optional, disponibilità e copertine delle auto pubblicate.
- Proprietà degli account di hosting, dominio e Supabase; costi e assistenza.

La mappa Google non viene caricata automaticamente: si attiva su richiesta.
Questa modifica non sostituisce la revisione delle informative e dei servizi
esterni. Le foto caricate nel bucket sono pubbliche: coprire le targhe e non
caricare documenti o altri contenuti riservati, comprese le foto delle bozze.

## Verifiche prima del lancio

L'11 ottobre 2026 sono stati applicati gli aggiornamenti compatibili delle
dipendenze. Restano sette segnalazioni high nella catena di strumenti CLI di
shadcn (braces/fast-glob/ts-morph). Il sito importa da shadcn soltanto il CSS;
questa catena non viene eseguita dal sito statico e dal 15 ottobre 2026
`shadcn` è tra le `devDependencies`, non tra le dipendenze di produzione. Non è stato applicato il
downgrade incompatibile suggerito da `npm audit fix --force`. Riesaminare la
catena prima di usare il CLI su contenuti o percorsi non attendibili.

1. Eseguire build, lint, test e controllo delle vulnerabilità delle dipendenze.
2. Verificare HTTPS, dominio principale e variabili della build pubblicata.
3. Aprire direttamente e ricaricare `/contatti`, `/auto-usate` e una scheda auto.
4. Controllare le pagine su telefono e computer, con navigazione da tastiera.
5. Creare una bozza di prova, caricare una foto, cambiare copertina, pubblicarla,
   controllarla come visitatore e segnarla come venduta; rimuovere i dati di prova.
6. Verificare foto non valide, file oltre 10 MB, errori di rete e credenziali errate.
   Provare anche il recupero password su una casella reale dopo la configurazione SMTP.
7. Controllare favicon, condivisione link, robots e sitemap sul dominio definitivo.
8. Salvare una versione di rilascio identificabile e documentare il ripristino.

## Backup e manutenzione

Definire frequenza, conservazione e responsabile dei backup. Il backup del
database non va considerato una copia dei file fotografici: prevedere anche
una copia separata dello Storage. Provare il ripristino prima della consegna.
Attivare un controllo di disponibilità del sito e definire chi riceve gli avvisi.

## Guida rapida per il cliente

Accedere a `/admin` con il proprio account. Usare **Nuova auto** per compilare
i dati e caricare le fotografie; selezionare una copertina. Mantenere l'annuncio
in bozza finché i contenuti non sono completi. Pubblicarlo per mostrarlo nel
catalogo; impostarlo come venduto quando non è più disponibile.
Usare **Cambia password** per aggiornare la propria password.
Gli amministratori gestiscono gli altri account dalla sezione **Utenti**.
