import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Image base64 is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Tu es un assistant spécialisé dans l'extraction de données de menus de restaurant. 
Ta tâche est d'analyser l'image ou le PDF d'un menu et d'extraire TOUS les plats avec leurs informations.

IMPORTANT:
- Extrais TOUS les plats visibles dans le document
- Si un prix n'est pas visible, mets 0
- Si une description n'est pas visible, laisse une chaîne vide
- Retourne les prix en format numérique (sans symbole monétaire)
- Organise les plats par catégorie si possible

Format de sortie attendu:
{
  "dishes": [
    {
      "name": "Nom du plat",
      "description": "Description du plat",
      "price": 12.50,
      "category": "Entrées"
    }
  ]
}`;

    const imageUrl = mimeType === 'application/pdf' 
      ? `data:application/pdf;base64,${imageBase64}`
      : `data:image/jpeg;base64,${imageBase64}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { 
            role: "system", 
            content: systemPrompt
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extrais tous les plats de ce document (image ou PDF) de menu et retourne-les au format JSON."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_dishes",
              description: "Extraire les plats d'un menu avec leurs informations",
              parameters: {
                type: "object",
                properties: {
                  dishes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Nom du plat" },
                        description: { type: "string", description: "Description du plat" },
                        price: { type: "number", description: "Prix du plat" },
                        category: { type: "string", description: "Catégorie du plat (Entrées, Plats, Desserts, etc.)" }
                      },
                      required: ["name", "price", "category"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["dishes"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_dishes" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes dépassée. Veuillez réessayer plus tard." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits insuffisants. Veuillez ajouter des crédits à votre compte Lovable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erreur lors de l'analyse de l'image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    
    // Extract tool call result
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(
        JSON.stringify({ error: "Aucun plat détecté dans l'image" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dishes = JSON.parse(toolCall.function.arguments);
    
    return new Response(
      JSON.stringify({ dishes: dishes.dishes }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in extract-menu-from-image:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
