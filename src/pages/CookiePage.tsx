import { Link } from "react-router-dom";
import { Section } from "@/app/layouts/Section";
import { PageHero } from "@/components/PageHero";
import { COMPANY } from "@/lib/company";

export function CookiePage() {
  return <>
    <PageHero eyebrow={COMPANY.name} title="Informativa cookie" description="Cookie, sessioni di accesso e servizi esterni usati da questo sito." />
    <Section height="md">
      <article className="mx-auto max-w-3xl space-y-8 text-base leading-7 text-muted-foreground [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_a]:underline">
        <p>Ultimo aggiornamento: 10 ottobre 2026.</p>
        <section><h2>Cookie e altri strumenti</h2><p>I cookie sono piccoli file memorizzati dal browser. Esistono anche strumenti di archiviazione come localStorage e sessionStorage, che il sito può usare per ricordare dati necessari al suo funzionamento.</p></section>
        <section><h2>Accesso all’area riservata</h2><p>Supabase Auth conserva nel localStorage del browser la sessione di accesso dell’utente autorizzato, inclusi i token necessari ad autenticare le richieste. Il nome della voce dipende dal progetto Supabase e inizia con <code>sb-</code>. La sessione viene rinnovata dal servizio di autenticazione e rimossa quando esci. Durante il recupero password, il sessionStorage conserva temporaneamente l’identificativo dell’account per mantenere la schermata di recupero anche dopo un aggiornamento della pagina; viene rimosso al termine del recupero o all’uscita.</p><p className="mt-3">Questi strumenti servono alla funzione di accesso richiesta dall’utente e non vengono usati per analizzare le visite o per pubblicità.</p></section>
        <section><h2>Hosting e sicurezza</h2><p>Cloudflare eroga le pagine del sito. Le eventuali funzioni di protezione abilitate sul servizio possono impiegare cookie tecnici per gestire le verifiche di sicurezza. Il loro utilizzo dipende dalla configurazione dell’hosting; non sono aggiunti dal codice dell’applicazione.</p></section>
        <section><h2>Mappa Google Maps</h2><p>La mappa incorporata resta disattivata finché non premi “Mostra la mappa Google”. La scelta vale per la visualizzazione corrente e non viene memorizzata come preferenza permanente. Quando attivi la mappa, Google riceve i dati tecnici necessari alla connessione e può utilizzare cookie propri secondo le proprie impostazioni. Consulta le informazioni di Google su <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer">cookie</a> e <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">privacy</a>. Puoi navigare il resto del sito senza attivare la mappa.</p></section>
        <section><h2>Analisi delle visite e pubblicità</h2><p>Il codice attuale non integra Google Analytics, pixel pubblicitari o strumenti di profilazione. L’aggiunta di questi strumenti richiederà di aggiornare questa informativa e la gestione delle preferenze prima della loro attivazione.</p></section>
        <section><h2>Gestire i dati nel browser</h2><p>Puoi eliminare cookie e dati dei siti dalle impostazioni del browser. L’eliminazione della sessione comporta un nuovo accesso all’area riservata; il blocco dell’archiviazione può impedirne il funzionamento. Per disattivare la mappa dopo averla aperta usa il pulsante “Nascondi la mappa”, oppure lascia la pagina.</p></section>
        <section><h2>Contatti</h2><p>Il titolare è {COMPANY.name}, P. IVA {COMPANY.vatNumber}, sede legale {COMPANY.address}. Scrivi a <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. Ulteriori informazioni e diritti sono descritti nell’<Link to="/privacy">informativa privacy</Link>.</p></section>
      </article>
    </Section>
  </>;
}
