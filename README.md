# Service Auto

Sito vetrina e catalogo auto con area riservata, sviluppato con React, TypeScript,
Vite e Supabase. La preparazione della consegna è descritta in [PRODUZIONE.md](PRODUZIONE.md).

## Sviluppo e verifiche

Copia `.env.example` in `.env` e configura le chiavi pubbliche del progetto.

```sh
npm ci
npm run dev
npm run build
npm run lint
npm test
npm run test:seo # dopo la build, verifica HTML e sitemap senza JavaScript
```


## Configurazione Supabase

Le migrazioni creano le tabelle delle auto, le immagini, il bucket `car-image` e le policy RLS collegate a Supabase Auth. Non viene creato alcun account amministratore con credenziali predefinite.

Dopo aver applicato le migrazioni:

1. Crea il primo utente da **Supabase Dashboard → Authentication → Users**.
2. Promuovilo ad amministratore dal SQL editor, sostituendo l'indirizzo email:

```sql
update public.admin_profiles
set role = 'admin', active = true, updated_at = now()
where email = 'admin@example.com';
```

La funzione Edge `admin-users` usa la service role esclusivamente lato server per creare, disattivare e aggiornare gli altri account Supabase Auth:

```sh
npx supabase functions deploy admin-users
```

Login, rinnovo e persistenza della sessione sono gestiti dal client Supabase Auth. Auto e immagini vengono modificate direttamente dal browser, ma soltanto quando il JWT appartiene a un profilo amministratore attivo secondo le policy RLS.

Il login continua ad accettare username per gli account esistenti oppure email.
Gli username legacy vengono convertiti in indirizzi tecnici nel dominio riservato
`admin.service.invalid`. I nuovi account richiedono un'email reale, verificata
anche dalla funzione server, per consentire il recupero password. Ogni utente
autenticato può cambiare esclusivamente la propria password dall'area riservata;
gli amministratori non possono impostare la password degli altri account.
Distribuire nuovamente `admin-users` per applicare il requisito anche sul server.

Dal login, **Password dimenticata?** invia un link all'email dell'account. Il link
torna a `/admin`, dove l'utente sceglie e conferma la nuova password. Al termine
la sessione viene chiusa. Configurare sul progetto Supabase remoto il Site URL
`https://servicevigevano.store` e il redirect consentito
`https://servicevigevano.store/admin`. I redirect di anteprima vanno autorizzati
singolarmente quando servono per il collaudo.
Configurare e verificare il servizio SMTP nella dashboard Supabase prima di
considerare collaudato l'invio. `supabase/config.toml` modifica solo l'ambiente locale.
Gli account legacy con username non hanno una casella e richiedono prima
l'associazione di un indirizzo reale, mantenendo invariati ID, ruolo e stato.
Non associare email a utenti senza aver verificato chi ne è il proprietario.

L'app non impone lunghezze minime o regole di complessità alle password; rimane
richiesta una password non vuota. Supabase Auth applica separatamente la policy
del progetto remoto. `supabase/config.toml` configura soltanto l'istanza locale,
con il minimo di 6 caratteri: rimuovere i controlli nell'app non modifica la policy
remota e non garantisce che Supabase accetti password di quattro caratteri.

## Importazione delle foto

`scripts/archivio/import-photo-drafts.py` importa il lotto locale descritto da
`import-auto/2026-09-06/auto-da-completare.json`. Verifica gli hash, usa identificativi
stabili e crea soltanto bozze; interrompe l'importazione se trova un annuncio già
pubblicato. Richiede la CLI Supabase autenticata e Python 3. L'archivio fotografico,
i manifest e i backup rimangono locali e sono esclusi da Git.

## Copertura delle targhe

`scripts/archivio/cover-photo-plates.py` applica coperture blu con la scritta SERVICE VIGEVANO
alle coordinate revisionate del lotto. Richiede Python 3, Pillow, NumPy e il font
DejaVu Sans Bold. Legge gli originali senza modificarli e produce PNG senza perdita
in `import-auto/2026-09-06/foto-targhe-python/`, verificando che ogni pixel esterno
alle maschere rimanga identico. Le coordinate sono specifiche di queste foto:
nuove immagini richiedono una nuova revisione, comprese le targhe sullo sfondo.

Dopo il controllo visivo, `scripts/archivio/publish-covered-photos.py` carica i PNG,
verifica i file scaricati, aggiorna i riferimenti agli annunci e rimuove le vecchie
copie dal bucket pubblico. Conserva backup e ricevute locali e controlla che
numero delle immagini, ordine e copertine rimangano invariati. I nuovi URL evitano
le precedenti copie nella cache; le chiavi Supabase restano solo in memoria.
