import { Link } from "react-router-dom";
import { Section } from "@/app/layouts/Section";
import { PageHero } from "@/components/PageHero";
import { COMPANY } from "@/lib/company";

export function PrivacyPage() {
  return <>
    <PageHero eyebrow={COMPANY.name} title="Informativa privacy" description="Come vengono trattati i dati personali durante l'utilizzo di questo sito e i contatti con la nostra attività." />
    <Section height="md">
      <article className="mx-auto max-w-3xl space-y-8 text-base leading-7 text-muted-foreground [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_a]:underline">
        <p>Ultimo aggiornamento: 10 ottobre 2026. Informativa resa ai sensi dell’articolo 13 del Regolamento (UE) 2016/679.</p>
        <section><h2>1. Titolare del trattamento</h2><p>{COMPANY.name}, P. IVA {COMPANY.vatNumber}, con sede legale in {COMPANY.address}. Per informazioni e per esercitare i tuoi diritti puoi scrivere a <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.</p></section>
        <section><h2>2. Dati trattati e finalità</h2>
          <p>Durante la navigazione vengono trattati i dati tecnici necessari a erogare e proteggere il sito, quali indirizzo IP, richieste alle pagine e informazioni sul browser. La finalità è assicurare il funzionamento del servizio e prevenire abusi; la base giuridica è il legittimo interesse del titolare alla sicurezza e alla disponibilità del sito.</p>
          <p className="mt-3">Se ci contatti per telefono o email, trattiamo i recapiti e le informazioni che ci fornisci per rispondere alla tua richiesta, fornire informazioni sulle auto o concordare un intervento. La base giuridica è l’esecuzione di misure precontrattuali richieste da te o del relativo contratto. Gli eventuali adempimenti previsti dalla legge si basano sugli obblighi legali applicabili.</p>
          <p className="mt-3">Per gli utenti autorizzati dell’area riservata trattiamo identificativo, email o username, ruolo, stato dell’account e dati di autenticazione per consentire l’accesso e la gestione del catalogo. Le finalità sono la gestione degli accessi di lavoro e la sicurezza, sulla base del legittimo interesse del titolare e degli accordi che regolano l’accesso. Il recupero password usa l’email associata all’account.</p>
        </section>
        <section><h2>3. Conferimento dei dati</h2><p>I dati tecnici sono necessari per utilizzare il sito. Comunicare i propri recapiti è facoltativo, ma senza le informazioni necessarie potremmo non riuscire a rispondere o a fornire il servizio richiesto. I dati dell’account sono necessari per accedere all’area riservata. Non esiste una registrazione pubblica dal sito.</p></section>
        <section><h2>4. Fornitori e servizi esterni</h2><p>Il sito utilizza Cloudflare per l’hosting e la distribuzione dei contenuti e Supabase per il catalogo, le fotografie e l’autenticazione dell’area riservata. I dati necessari al funzionamento possono essere trattati da questi fornitori e dai soggetti autorizzati dal titolare. Possono inoltre essere comunicati a soggetti cui la comunicazione sia dovuta per legge.</p>
          <p className="mt-3">La mappa Google Maps si carica solo quando scegli di mostrarla. In quel caso il browser si collega a Google e trasmette dati tecnici, tra cui l’indirizzo IP; il servizio può usare cookie o strumenti propri. Puoi consultare la <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">privacy policy di Google</a> oppure utilizzare il collegamento alle indicazioni senza incorporare la mappa.</p>
          <p className="mt-3">I servizi di hosting e quelli esterni possono coinvolgere trattamenti fuori dallo Spazio economico europeo. Le condizioni e le garanzie applicabili dipendono dal servizio e dalla sua configurazione; per informazioni sui trattamenti relativi al sito puoi contattare il titolare.</p>
        </section>
        <section><h2>5. Conservazione</h2><p>Le richieste e la corrispondenza vengono conservate per il tempo necessario a gestirle e, quando si instaura un rapporto contrattuale, per gli ulteriori periodi richiesti dagli obblighi di legge o dalla tutela dei diritti. Gli account sono conservati per la durata dell’autorizzazione e per le eventuali esigenze di sicurezza e tutela dei diritti. I tempi dei dati tecnici e dei log dipendono dalle impostazioni dei servizi utilizzati. Puoi chiedere al titolare informazioni sui tempi applicabili al tuo caso.</p></section>
        <section><h2>6. I tuoi diritti</h2><p>Nei casi previsti dal Regolamento puoi chiedere accesso, rettifica, cancellazione, limitazione e portabilità dei dati, e opporti ai trattamenti basati sul legittimo interesse. Se un trattamento si basa sul consenso, puoi revocarlo senza pregiudicare il trattamento precedente. Scrivi a <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. Puoi proporre reclamo al <a href="https://www.garanteprivacy.it/" target="_blank" rel="noopener noreferrer">Garante per la protezione dei dati personali</a>.</p></section>
        <section><h2>7. Cookie e archiviazione nel browser</h2><p>Per i dettagli sui dati memorizzati nel browser e sulla mappa consulta l’<Link to="/cookie">informativa cookie</Link>. Il codice attuale del sito non include sistemi di profilazione, pubblicità personalizzata o analisi delle visite.</p></section>
      </article>
    </Section>
  </>;
}
