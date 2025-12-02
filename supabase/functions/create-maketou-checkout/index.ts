import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productDocumentId, tier, billingPeriod } = await req.json();

    console.log('🛒 Creating Maketou checkout:', { productDocumentId, tier, billingPeriod });

    const maketouApiKey = Deno.env.get('QUEROX_MAKETOU');
    if (!maketouApiKey) {
      throw new Error('QUEROX_MAKETOU API key not configured');
    }

    // Create checkout session via Maketou API
    const response = await fetch('https://api.maketou.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${maketouApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productDocumentId: productDocumentId,
        successUrl: 'https://querox.me/payment-success',
        cancelUrl: 'https://querox.me/payment-failure',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Maketou API error:', errorText);
      throw new Error(`Maketou API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Maketou checkout created:', data);

    return new Response(
      JSON.stringify({ 
        checkoutUrl: data.checkoutUrl || data.url,
        checkoutId: data.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('💥 Error creating Maketou checkout:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create checkout session' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
