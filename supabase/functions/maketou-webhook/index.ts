import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map Maketou product names/IDs to Querox tiers
const TIER_MAP: Record<string, { tier: string; months: number }> = {
  // Monthly plans
  "plan-starter-querox": { tier: "starter", months: 1 },
  "plan-starter-querox-6": { tier: "pro", months: 1 },
  "plan-starter-querox-6-1": { tier: "enterprise", months: 1 },
  // Annual plans
  "plan-starter-querox-6-1-2-6-4": { tier: "starter", months: 12 },
  "plan-starter-querox-6-1-2-6": { tier: "pro", months: 12 },
  "plan-starter-querox-6-1-2": { tier: "enterprise", months: 12 },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MAKETOU_API_KEY = Deno.env.get("MAKETOU_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();

    // Maketou webhook payload fields (adapt based on actual Maketou docs)
    const {
      event,
      customer_email,
      customer_id,
      product_slug,
      product_id,
      status,
      amount,
      currency,
      transaction_id,
      user_id, // Custom field passed via checkout URL
      plan_tier, // Custom field passed via checkout URL
    } = body;

    console.log("[Maketou Webhook] Received:", { event, customer_email, product_slug, status, user_id, plan_tier });

    // Verify this is a successful payment
    const isPaymentSuccess =
      event === "payment.success" ||
      event === "order.completed" ||
      event === "subscription.created" ||
      status === "paid" ||
      status === "completed" ||
      status === "success";

    if (!isPaymentSuccess) {
      console.log("[Maketou Webhook] Non-payment event, ignoring:", event || status);
      return new Response(JSON.stringify({ ok: true, message: "Event ignored" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine the tier and duration
    let tierInfo = plan_tier
      ? TIER_MAP[plan_tier] || null
      : product_slug
      ? TIER_MAP[product_slug] || null
      : null;

    // Fallback: try to match product_id or partial slug
    if (!tierInfo && product_slug) {
      for (const [key, value] of Object.entries(TIER_MAP)) {
        if (product_slug.includes(key)) {
          tierInfo = value;
          break;
        }
      }
    }

    if (!tierInfo) {
      console.error("[Maketou Webhook] Unknown product:", product_slug || product_id);
      tierInfo = { tier: "starter", months: 1 }; // Safe fallback
    }

    // Find the user — by user_id (custom param) or email
    const email = customer_email?.toLowerCase()?.trim();
    let targetUserId = user_id || null;

    if (!targetUserId && email) {
      // Look up user by email in subscribers or profiles
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .limit(1);

      if (profileData && profileData.length > 0) {
        targetUserId = profileData[0].id;
      }
    }

    if (!targetUserId && !email) {
      console.error("[Maketou Webhook] No user_id or email found");
      return new Response(
        JSON.stringify({ ok: false, error: "No user identifier" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate subscription dates
    const now = new Date();
    const subscriptionEnd = new Date(now);
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + tierInfo.months);

    // Upsert subscriber record
    const subscriberData = {
      email: email || "",
      user_id: targetUserId,
      subscribed: true,
      subscription_tier: tierInfo.tier,
      subscription_status: "active",
      subscription_start: now.toISOString(),
      subscription_end: subscriptionEnd.toISOString(),
      last_payment_date: now.toISOString(),
      monthly_revenue: amount || 0,
      updated_at: now.toISOString(),
    };

    // Try upsert by user_id first
    if (targetUserId) {
      const { data: existing } = await supabase
        .from("subscribers")
        .select("id")
        .eq("user_id", targetUserId)
        .limit(1);

      if (existing && existing.length > 0) {
        const { error } = await supabase
          .from("subscribers")
          .update(subscriberData)
          .eq("user_id", targetUserId);

        if (error) {
          console.error("[Maketou Webhook] Update error:", error);
          throw error;
        }
        console.log("[Maketou Webhook] Subscription updated for user:", targetUserId);
      } else {
        const { error } = await supabase.from("subscribers").insert(subscriberData);
        if (error) {
          console.error("[Maketou Webhook] Insert error:", error);
          throw error;
        }
        console.log("[Maketou Webhook] Subscription created for user:", targetUserId);
      }
    } else if (email) {
      // Upsert by email
      const { data: existing } = await supabase
        .from("subscribers")
        .select("id")
        .eq("email", email)
        .limit(1);

      if (existing && existing.length > 0) {
        const { error } = await supabase
          .from("subscribers")
          .update(subscriberData)
          .eq("email", email);

        if (error) throw error;
        console.log("[Maketou Webhook] Subscription updated for email:", email);
      } else {
        const { error } = await supabase.from("subscribers").insert(subscriberData);
        if (error) throw error;
        console.log("[Maketou Webhook] Subscription created for email:", email);
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        tier: tierInfo.tier,
        months: tierInfo.months,
        subscription_end: subscriptionEnd.toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[Maketou Webhook] Error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
