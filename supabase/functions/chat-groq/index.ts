
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    // Fixed: Use the correct environment variable name that matches the Supabase secret
    const groqApiKey = Deno.env.get('querox_api_groq');
    
    if (!groqApiKey) {
      console.error('Groq API key not found. Available env vars:', Object.keys(Deno.env.toObject()));
      throw new Error('Clé API Groq non configurée');
    }

    console.log('Sending request to Groq API with', messages.length, 'messages');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Fixed: Use a supported Groq model
        model: 'llama-3.1-70b-versatile',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.95,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      
      // Improved error handling with more specific messages
      if (response.status === 401) {
        throw new Error('Clé API Groq invalide ou expirée');
      } else if (response.status === 429) {
        throw new Error('Limite de requêtes atteinte. Veuillez réessayer plus tard.');
      } else if (response.status === 500) {
        throw new Error('Erreur serveur Groq. Veuillez réessayer.');
      } else {
        throw new Error(`Erreur API Groq: ${response.status} - ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('Groq API response received successfully');
    
    const content = data.choices?.[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.';

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-groq function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Impossible de contacter Tonton Rox. Veuillez réessayer.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
