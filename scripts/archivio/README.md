# Script di import già eseguiti

Questi script sono serviti per l'import iniziale delle auto e delle foto
(lotti del 6 e del 9 settembre 2026, cartella `import-auto/`). Sono conservati
come documentazione di come sono stati preparati i dati.

**Non rilanciarli**: lavorano su lotti specifici, hanno l'ID del progetto
Supabase scritto nel codice e alcuni usano la chiave service role. Rieseguirli
potrebbe creare duplicati o sovrascrivere foto già pubblicate.

Si eseguono dalla radice del progetto, ad esempio
`python scripts/archivio/make-import-contact-sheets.py`.

Per caricare nuove auto usare l'area amministrativa `/admin`.
