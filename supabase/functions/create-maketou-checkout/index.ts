import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productDocumentId, userId } = await req.json();

    console.log('🛒 Creating Maketou checkout:', { productDocumentId, userId });

    const maketouApiKey = Deno.env.get('QUEROX_MAKETOU');
    if (!maketouApiKey) {
      throw new Error('QUEROX_MAKETOU API key not configured');
    }

    // Get user profile from Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('❌ Profile not found:', profileError);
      throw new Error('User profile not found');
    }

    // Parse full name into firstName and lastName
    const nameParts = (profile.full_name || 'Client Querox').split(' ');
    const firstName = nameParts[0] || 'Client';
    const lastName = nameParts.slice(1).join(' ') || 'Querox';

    console.log('👤 User info:', { email: profile.email, firstName, lastName });

    // Create checkout via Maketou API
    const response = await fetch('https://api.maketou.net/api/v1/stores/cart/checkout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${maketouApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productDocumentId: productDocumentId,
        email: profile.email,
        firstName: firstName,
        lastName: lastName,
        redirectURL: 'https://querox.me/payment-success',
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
        redirectUrl: data.redirectUrl,
        cartId: data.cart.id 
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
