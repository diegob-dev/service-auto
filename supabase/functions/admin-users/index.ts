import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Metodo non supportato" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = request.headers.get("Authorization");
  const accessToken = authorization?.replace(/^Bearer\s+/i, "");
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "Configurazione server mancante" }, 500);
  if (!accessToken) return json({ error: "Sessione mancante" }, 401);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await admin.auth.getUser(accessToken);
  if (authError || !authData.user) return json({ error: "Sessione non valida" }, 401);

  const { data: caller } = await admin
    .from("admin_profiles")
    .select("role, active")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (caller?.role !== "admin" || !caller.active) return json({ error: "Accesso non autorizzato" }, 403);

  try {
    const body = await request.json();
    const action = String(body.action ?? "");

    if (action === "list") {
      const { data: profiles, error } = await admin
        .from("admin_profiles")
        .select("id, email, role, active, created_at, updated_at")
        .eq("role", "admin")
        .order("email");
      return error ? json({ error: error.message }, 400) : json(profiles ?? []);
    }

    const input = body.user as {
      id?: string;
      email?: string;
      password?: string;
      active?: boolean;
    };
    const email = String(input?.email ?? "").trim().toLowerCase();
    if (!email) return json({ error: "Email obbligatoria" }, 400);
    if (input.password !== undefined && input.password.length < 12) {
      return json({ error: "La password deve contenere almeno 12 caratteri" }, 400);
    }

    if (action === "create") {
      if (!input.password) return json({ error: "Password obbligatoria" }, 400);
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: input.password,
        email_confirm: true,
      });
      if (error || !data.user) return json({ error: error?.message ?? "Utente non creato" }, 400);

      const { data: profile, error: profileError } = await admin
        .from("admin_profiles")
        .upsert({ id: data.user.id, email, role: "admin", active: input.active !== false })
        .select()
        .single();
      if (profileError) {
        await admin.auth.admin.deleteUser(data.user.id);
        return json({ error: profileError.message }, 400);
      }
      return json(profile, 201);
    }

    if (action === "update" && input.id) {
      if (input.active === false) {
        const { count } = await admin
          .from("admin_profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "admin")
          .eq("active", true);
        if ((count ?? 0) <= 1) return json({ error: "Non puoi disattivare l'ultimo amministratore" }, 400);
      }

      const { error: authUpdateError } = await admin.auth.admin.updateUserById(input.id, {
        ...(input.password ? { password: input.password } : {}),
        ban_duration: input.active === false ? "876000h" : "none",
      });
      if (authUpdateError) return json({ error: authUpdateError.message }, 400);
      const { data: profile, error } = await admin
        .from("admin_profiles")
        .update({ active: input.active !== false, updated_at: new Date().toISOString() })
        .eq("id", input.id)
        .select()
        .single();
      return error ? json({ error: error.message }, 400) : json(profile);
    }

    return json({ error: "Operazione non valida" }, 400);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Richiesta non valida" }, 400);
  }
});
