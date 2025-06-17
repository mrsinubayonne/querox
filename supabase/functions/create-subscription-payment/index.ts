
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authorization.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { tier, amount } = await req.json()

    // Générer un order_id unique
    const orderId = `querox_${user.id}_${Date.now()}`

    // Préparer la requête vers l'API Lygos
    const lygosPayload = {
      amount: amount || 1000, // Prix par défaut 1000 FCFA
      shop_name: "QUEROX",
      message: `Abonnement ${tier} - QUEROX`,
      success_url: `${req.headers.get('origin')}/payment-success?order_id=${orderId}`,
      failure_url: `${req.headers.get('origin')}/payment-failure?order_id=${orderId}`,
      order_id: orderId
    }

    // Appel à l'API Lygos
    const lygosResponse = await fetch('https://api.lygosapp.com/v1/gateway', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': Deno.env.get('LYGOS_API_KEY') ?? ''
      },
      body: JSON.stringify(lygosPayload)
    })

    if (!lygosResponse.ok) {
      throw new Error(`Lygos API error: ${lygosResponse.status}`)
    }

    const lygosData = await lygosResponse.json()

    // Enregistrer la transaction en attente dans la base
    const { error: insertError } = await supabaseClient
      .from('subscribers')
      .upsert({
        user_id: user.id,
        email: user.email,
        subscription_tier: tier,
        subscribed: false, // En attente du paiement
        stripe_customer_id: orderId, // On utilise ce champ pour stocker l'order_id
        updated_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Database error:', insertError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: lygosData.payment_url || lygosData.url,
        order_id: orderId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
