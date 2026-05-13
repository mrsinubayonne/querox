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

    // 2) Ensure auth user exists with password = accessCode so client can signInWithPassword
    let authUserId: string | null = null;

    // Try to find existing user by email
    // listUsers does not filter by email server-side reliably; use getUserByEmail via admin
    try {
      const { data: existingUser } = await (admin.auth.admin as any).getUserByEmail?.(normalizedEmail) ?? { data: null };
      if (existingUser?.user?.id) authUserId = existingUser.user.id;
    } catch (_) { /* ignore */ }

    if (!authUserId) {
      // Fallback: paginate listUsers
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const found = list?.users?.find((u: any) => (u.email || "").toLowerCase() === normalizedEmail);
      if (found?.id) authUserId = found.id;
    }

    if (!authUserId) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: normalizedEmail,
        password: normalizedCode,
        email_confirm: true,
        user_metadata: { is_team_member: true, role: member.role, owner_id: member.owner_id },
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
      // Always sync password to current accessCode so signInWithPassword works
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
        .update({ member_user_id: authUserId, last_login_at: new Date().toISOString() })
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
