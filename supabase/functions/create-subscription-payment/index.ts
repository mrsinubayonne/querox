
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🚀 Edge function appelée:', req.method);

  if (req.method === 'OPTIONS') {
    console.log('✅ Requête OPTIONS - retour CORS headers');
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔧 Initialisation du client Supabase...');
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

    // Client pour les opérations base de données avec service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('🔑 Vérification de l\'autorisation...');
    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      console.log('❌ Aucun header Authorization');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authorization.replace('Bearer ', '')
    console.log('👤 Vérification du token utilisateur...');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      console.log('❌ Token invalide:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Utilisateur authentifié:', user.id);

    console.log('📦 Récupération des données de la requête...');
    const { tier, amount } = await req.json()
    console.log('📝 Données reçues:', { tier, amount });

    // Générer un order_id unique
    const orderId = `querox_${user.id}_${Date.now()}`
    console.log('🆔 Order ID généré:', orderId);

    // Préparer la requête vers l'API Lygos
    const lygosPayload = {
      amount: amount || 1000,
      shop_name: "QUEROX",
      message: `Abonnement ${tier} - QUEROX`,
      success_url: `${req.headers.get('origin')}/payment-success?order_id=${orderId}`,
      failure_url: `${req.headers.get('origin')}/payment-failure?order_id=${orderId}`,
      order_id: orderId
    }
    console.log('🌐 Payload Lygos:', lygosPayload);

    console.log('📡 Appel à l\'API Lygos...');
    const lygosResponse = await fetch('https://api.lygosapp.com/v1/gateway', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': Deno.env.get('LYGOS_API_KEY') ?? ''
      },
      body: JSON.stringify(lygosPayload)
    })

    console.log('📨 Réponse Lygos status:', lygosResponse.status);

    if (!lygosResponse.ok) {
      console.log('❌ Erreur API Lygos:', lygosResponse.status);
      const errorText = await lygosResponse.text();
      console.log('❌ Détails erreur Lygos:', errorText);
      throw new Error(`Lygos API error: ${lygosResponse.status} - ${errorText}`)
    }

    const lygosData = await lygosResponse.json()
    console.log('✅ Réponse Lygos successful:', lygosData);

    // Enregistrer la transaction en attente dans la base avec service role
    console.log('💾 Enregistrement dans la base de données...');
    const { error: insertError } = await supabaseAdmin
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
      console.error('❌ Erreur base de données:', insertError)
      // Ne pas faire échouer la requête pour cette erreur
    } else {
      console.log('✅ Données enregistrées en base');
    }

    // Construire l'URL de paiement - vérifier plusieurs formats possibles
    let paymentUrl = null;
    
    // Vérifier toutes les propriétés possibles pour l'URL
    console.log('🔍 Recherche de l\'URL de paiement dans la réponse...');
    console.log('📄 Propriétés disponibles:', Object.keys(lygosData));
    
    if (lygosData.link) {
      console.log('🔗 Propriété "link" trouvée:', lygosData.link);
      // Si l'URL ne commence pas par http, ajouter https://
      if (lygosData.link.startsWith('http://') || lygosData.link.startsWith('https://')) {
        paymentUrl = lygosData.link;
      } else {
        paymentUrl = `https://${lygosData.link}`;
      }
    } else if (lygosData.payment_url) {
      console.log('🔗 Propriété "payment_url" trouvée:', lygosData.payment_url);
      paymentUrl = lygosData.payment_url;
    } else if (lygosData.url) {
      console.log('🔗 Propriété "url" trouvée:', lygosData.url);
      paymentUrl = lygosData.url;
    } else if (lygosData.checkout_url) {
      console.log('🔗 Propriété "checkout_url" trouvée:', lygosData.checkout_url);
      paymentUrl = lygosData.checkout_url;
    }

    console.log('🔗 URL de paiement construite:', paymentUrl);

    // Validation plus flexible de l'URL - on accepte toute URL qui semble être une URL de paiement
    if (!paymentUrl) {
      console.log('❌ Aucune URL de paiement trouvée dans la réponse');
      console.log('📄 Réponse Lygos complète:', JSON.stringify(lygosData, null, 2));
      
      return new Response(
        JSON.stringify({ 
          error: 'Aucune URL de paiement trouvée dans la réponse de Lygos',
          debug: lygosData
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validation basique pour s'assurer que c'est une URL valide
    try {
      new URL(paymentUrl);
      console.log('✅ URL de paiement valide confirmée');
    } catch (urlError) {
      console.log('❌ URL de paiement malformée:', paymentUrl);
      console.log('❌ Erreur URL:', urlError);
      
      return new Response(
        JSON.stringify({ 
          error: 'URL de paiement malformée reçue de Lygos',
          payment_url: paymentUrl,
          debug: lygosData
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const responseData = {
      success: true,
      payment_url: paymentUrl,
      order_id: orderId
    };

    console.log('📤 Réponse finale:', responseData);

    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('💥 Erreur dans la fonction edge:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
