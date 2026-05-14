import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  let payload: any = {};
  let actorUserId: string | null = null;
  let teamMemberId: string | null = null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authHeader = req.headers.get("Authorization") || "";

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const writeAudit = async (stage: string, success: boolean, error?: any, details: Record<string, unknown> = {}) => {
    try {
      await admin.from("session_creation_audit_logs").insert({
        request_id: requestId,
        actor_user_id: actorUserId,
        owner_id: payload?._owner_id ?? null,
        outlet_id: payload?._outlet_id ?? null,
        team_member_id: teamMemberId,
        table_number: payload?._table_number ?? null,
        stage,
        success,
        error_code: error?.code ?? error?.name ?? null,
        error_message: error?.message ?? error?.error_description ?? null,
        details: {
          ...details,
          duration_ms: Date.now() - startedAt,
        },
      });
    } catch (auditError) {
      console.error("[session-create-edge] audit insert failed", { requestId, auditError });
    }
  };

  try {
    payload = await req.json();

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      console.error("[session-create-edge] auth failed", { requestId, userError });
      await writeAudit("auth_failed", false, userError || new Error("No auth user"));
      return new Response(JSON.stringify({ success: false, error: "Non authentifié", requestId }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    actorUserId = userData.user.id;
    const actorEmail = (userData.user.email || "").toLowerCase();

    if (payload?._owner_id && actorEmail) {
      const { data: member } = await admin
        .from("team_members")
        .select("id")
        .eq("owner_id", payload._owner_id)
        .eq("is_active", true)
        .or(`member_user_id.eq.${actorUserId},member_email.eq.${actorEmail}`)
        .maybeSingle();
      teamMemberId = member?.id ?? null;
    }

    console.log("[session-create-edge] start", {
      requestId,
      actorUserId,
      ownerId: payload?._owner_id,
      outletId: payload?._outlet_id,
      tableNumber: payload?._table_number,
      teamMemberId,
    });

    await writeAudit("received", false, undefined, {
      actor_email: actorEmail || null,
      items_count: Array.isArray(payload?._items) ? payload._items.length : null,
    });

    const { data, error } = await userClient.rpc("create_table_session_with_order", payload);
    if (error) {
      console.error("[session-create-edge] rpc failed", { requestId, error });
      await writeAudit("rpc_failed", false, error, {
        hint: error.hint ?? null,
        details: error.details ?? null,
      });
      return new Response(JSON.stringify({ success: false, error: error.message, requestId }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[session-create-edge] completed", { requestId, sessionId: data?.id });
    await writeAudit("completed", true, undefined, { session_id: data?.id ?? null });

    return new Response(JSON.stringify({ success: true, session: data, requestId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[session-create-edge] fatal", { requestId, error });
    await writeAudit("fatal", false, error);
    return new Response(JSON.stringify({ success: false, error: error?.message || "Erreur serveur", requestId }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});