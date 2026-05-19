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

  try {
    const { email, accessCode } = await req.json();

    if (!email || !accessCode) {
      return new Response(
        JSON.stringify({ success: false, error: "Email et code requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedCode = String(accessCode).trim().toUpperCase();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1) Verify access using the SQL function (handles bcrypt + plaintext + upper/lower)
    const { data: verifyData, error: verifyError } = await admin.rpc("verify_team_access", {
      _email: normalizedEmail,
      _access_code: normalizedCode,
    });

    if (verifyError) {
      console.error("verify_team_access error:", verifyError);
      return new Response(
        JSON.stringify({ success: false, error: "Erreur de vérification" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const member = Array.isArray(verifyData) ? verifyData[0] : verifyData;
    if (!member) {
      return new Response(
        JSON.stringify({ success: false, error: "Identifiants invalides" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: assignedOutlets } = await admin.rpc("get_team_member_outlets", {
      _member_id: member.member_id,
    });
    const outletIds = Array.isArray(assignedOutlets)
      ? assignedOutlets.map((outlet: any) => outlet.outlet_id).filter(Boolean)
      : [];
    const primaryOutletId = member.outlet_id || outletIds[0] || null;

    // Find existing auth user by email (perPage 1000 to cover scale)
    let authUserId: string | null = null;

    try {
      const { data: list, error: listError } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      if (!listError && list?.users) {
        const found = list.users.find((u: any) => (u.email || "").toLowerCase() === normalizedEmail);
        if (found?.id) authUserId = found.id;
      }
    } catch (_) {
      // continue to createUser fallback
    }

    if (!authUserId) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: normalizedEmail,
        password: normalizedCode,
        email_confirm: true,
        user_metadata: { is_team_member: true, role: member.role, owner_id: member.owner_id },
      });
      if (createErr && createErr.message?.includes("already been registered")) {
        console.error("User exists but not found in list:", createErr);
        return new Response(
          JSON.stringify({ success: false, error: "Compte existant non trouvé. Contactez l'administrateur." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (createErr) {
        console.error("createUser error:", createErr);
        return new Response(
          JSON.stringify({ success: false, error: "Impossible de créer le compte" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      authUserId = created.user?.id ?? null;
    } else {
      const { error: updErr } = await admin.auth.admin.updateUserById(authUserId, {
        password: normalizedCode,
        email_confirm: true,
      });
      if (updErr) console.error("updateUserById error:", updErr);
    }

    // 3) Link member_user_id on team_members so RLS works
    if (authUserId) {
      await admin
        .from("team_members")
        .update({
          member_user_id: authUserId,
          status: "accepted",
          accepted_at: new Date().toISOString(),
          needs_password_setup: false,
          last_login_at: new Date().toISOString(),
        })
        .eq("id", member.member_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        member: {
          member_id: member.member_id,
          owner_id: member.owner_id,
          member_role: member.role,
          status: member.status,
          outlet_id: primaryOutletId,
          outlet_ids: outletIds,
          auth_user_id: authUserId,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("team-member-auth fatal:", e);
    return new Response(
      JSON.stringify({ success: false, error: e?.message || "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
