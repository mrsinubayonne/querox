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
    const { restaurantCode, pseudo, pin } = await req.json();

    if (!restaurantCode || !pseudo || !pin) {
      return new Response(
        JSON.stringify({ success: false, error: "Code restaurant, pseudo et PIN requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1) Resolve owner from restaurant code
    const { data: ownerId, error: ownerError } = await admin.rpc(
      "resolve_owner_by_restaurant_code",
      { _code: String(restaurantCode).trim().toUpperCase() }
    );

    if (ownerError || !ownerId) {
      return new Response(
        JSON.stringify({ success: false, error: "Code restaurant introuvable" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2) Verify pseudo + PIN
    const { data: verifyData, error: verifyError } = await admin.rpc(
      "verify_team_access_pin",
      { _owner_id: ownerId, _pseudo: String(pseudo).trim(), _pin: String(pin).trim() }
    );

    if (verifyError) {
      console.error("verify_team_access_pin error:", verifyError);
      return new Response(
        JSON.stringify({ success: false, error: "Erreur de vérification" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const member = Array.isArray(verifyData) ? verifyData[0] : verifyData;
    if (!member) {
      return new Response(
        JSON.stringify({ success: false, error: "Pseudo ou PIN incorrect" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3) Sync auth user. We use a synthetic email so we can issue a Supabase
    //    auth session for this team member without collision risk.
    const syntheticEmail = `pin-${member.member_id}@team.querox.local`;
    const syntheticPassword = `${member.member_id}::${String(pin).trim()}`;

    let authUserId: string | null = null;
    try {
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const found = list?.users?.find((u: any) => (u.email || "").toLowerCase() === syntheticEmail);
      if (found?.id) authUserId = found.id;
    } catch (_) { /* fallback below */ }

    if (!authUserId) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: syntheticEmail,
        password: syntheticPassword,
        email_confirm: true,
        user_metadata: {
          is_team_member: true,
          role: member.role,
          owner_id: member.owner_id,
          login_mode: "pin",
        },
      });
      if (createErr) {
        console.error("createUser error:", createErr);
        return new Response(
          JSON.stringify({ success: false, error: "Impossible de créer le compte" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      authUserId = created.user?.id ?? null;
    } else {
      // Keep password aligned with current PIN
      await admin.auth.admin.updateUserById(authUserId, {
        password: syntheticPassword,
        email_confirm: true,
      });
    }

    // 4) Link member_user_id and bump last_login
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

    // 5) Outlets
    const { data: assignedOutlets } = await admin.rpc("get_team_member_outlets", {
      _member_id: member.member_id,
    });
    const outletIds = Array.isArray(assignedOutlets)
      ? assignedOutlets.map((o: any) => o.outlet_id).filter(Boolean)
      : [];
    const primaryOutletId = member.outlet_id || outletIds[0] || null;

    return new Response(
      JSON.stringify({
        success: true,
        member: {
          member_id: member.member_id,
          owner_id: member.owner_id,
          member_role: member.role,
          status: member.status,
          full_name: member.full_name,
          outlet_id: primaryOutletId,
          outlet_ids: outletIds,
          auth_user_id: authUserId,
          // Synthetic credentials for signInWithPassword on the client
          synthetic_email: syntheticEmail,
          synthetic_password: syntheticPassword,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("team-member-pin-auth fatal:", e);
    return new Response(
      JSON.stringify({ success: false, error: e?.message || "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
