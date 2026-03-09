import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Checkout URLs for each plan
const CHECKOUT_URLS: Record<string, Record<string, string>> = {
  monthly: {
    starter: "https://querox.maketou.com/products/plan-starter-querox/checkout",
    pro: "https://querox.maketou.com/products/plan-starter-querox-6/checkout",
    enterprise: "https://querox.maketou.com/products/plan-starter-querox-6-1/checkout",
  },
  annual: {
    starter: "https://querox.mymaketou.store/products/plan-starter-querox-6-1-2-6-4/checkout",
    pro: "https://querox.mymaketou.store/fr/products/plan-starter-querox-6-1-2-6/checkout",
    enterprise: "https://querox.mymaketou.store/fr/products/plan-starter-querox-6-1-2/checkout",
  },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { tier, period } = await req.json();

    if (!tier || !period) {
      return new Response(JSON.stringify({ error: "tier et period requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const billingKey = period === "annual" ? "annual" : "monthly";
    const baseUrl = CHECKOUT_URLS[billingKey]?.[tier];

    if (!baseUrl) {
      return new Response(
        JSON.stringify({ error: `Plan inconnu: ${tier} / ${period}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build checkout URL with user context
    const separator = baseUrl.includes("?") ? "&" : "?";
    const checkoutUrl =
      `${baseUrl}${separator}` +
      `customer_email=${encodeURIComponent(user.email || "")}` +
      `&user_id=${encodeURIComponent(user.id)}` +
      `&plan_tier=${encodeURIComponent(tier)}`;

    return new Response(
      JSON.stringify({ checkout_url: checkoutUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[create-maketou-checkout] Error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
