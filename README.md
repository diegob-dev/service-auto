# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
# Service Auto

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
