# Email di recupero con Resend

## Configurazione preparata

- Servizio: Resend, tramite SMTP di Supabase Auth.
- Dominio da verificare: `auth.servicevigevano.store`.
- Nome mittente: `SERVICE SRL`.
- Indirizzo mittente: `noreply@auth.servicevigevano.store`.
- Server SMTP: `smtp.resend.com`.
- Porta: `465`, con TLS.
- Utente: `resend`.
- Password SMTP: una chiave API Resend dedicata al progetto e al dominio.
- Oggetto del recupero: `Reimposta la password — SERVICE SRL`.
- Template: `supabase/templates/recovery.html`.
- Site URL: `https://servicevigevano.store`.
- Redirect produzione: `https://servicevigevano.store/admin`.
- Redirect per il collaudo locale: `http://127.0.0.1:5173/admin`.

Il mittente serve all'invio delle notifiche e non richiede una nuova casella
di posta. L'assistenza rimane raggiungibile su `info@servicevigevano.it`.
Il servizio di invio è separato dalla posta aziendale esistente.

## Attivazione

1. Accedere o creare un account Resend intestato al soggetto che gestirà il sito.
   Iniziare dal piano Free; non attivare piani o componenti a pagamento.
2. Aggiungere `auth.servicevigevano.store` come dominio di invio, scegliendo una
   regione europea disponibile. Lasciare disabilitata la ricezione della posta.
3. Inserire su Cloudflare esclusivamente i record di invio richiesti da Resend,
   copiando i valori effettivamente generati per il dominio. Verificare SPF e
   DKIM, senza sostituire i record della posta aziendale o quelli del sito.
4. Disabilitare tracciamento di aperture e link sul dominio Resend, in particolare
   per evitare riscritture dei link di recupero.
5. Creare una chiave dedicata all'invio con i permessi minimi disponibili per
   questo dominio. Conservarla solo nella configurazione server di Supabase.
6. Abilitare il custom SMTP nella dashboard Supabase e applicare i valori sopra.
   Impostare URL e redirect autorizzati; applicare il template al tipo Reset Password.
7. Testare invio, ricezione, apertura del link, aggiornamento della password,
   nuovo accesso e rifiuto di un link già utilizzato. Il test su una casella reale
   richiede che il destinatario sia indicato e autorizzato.
8. Aggiornare l'informativa privacy con Resend come fornitore dell'invio email
   quando il servizio viene effettivamente attivato, verificando le condizioni
   di trattamento e conservazione dell'account.

La chiave Resend non va inserita in variabili `VITE_`, nel browser, nei file
versionati o nei log. La configurazione di `supabase/config.toml` vale per il
solo ambiente locale: non configura automaticamente il progetto remoto.

## Stato

Template e valori di configurazione preparati. La chiave fornita è stata
verificata: ha permessi di solo invio e non consente di elencare, creare o
verificare domini. Non è salvata nel codice o in file del progetto.
Su Supabase sono stati aggiornati e verificati il Site URL e i redirect
di produzione e del collaudo locale. SMTP resta non configurato.
Il piano gratuito con il provider email predefinito non consente di applicare
il template personalizzato: verrà applicato insieme al custom SMTP.

La verifica del dominio mittente richiede ancora accesso al pannello Resend
e ai DNS Cloudflare. Entrambi i pannelli mostrano il login. Non sono stati
creati nuovi account, chiavi API o record DNS; l'invio non è attivo.

`scripts/configure-email.mjs` accetta la chiave solo dall'input del processo,
senza mostrarla o conservarla, e usa l'accesso Supabase locale già autenticato.
Le operazioni di gestione domini richiedono una credenziale con tali permessi;
la chiave di solo invio è quella da usare per SMTP in produzione.

## Riferimenti

- [Resend SMTP](https://resend.com/docs/send-with-smtp)
- [Verifica DNS su Cloudflare](https://resend.com/docs/guides/dns/cloudflare)
- [Supabase custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Template Supabase](https://supabase.com/docs/guides/auth/auth-email-templates)
