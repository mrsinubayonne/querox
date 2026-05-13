// Edge function: génère une image de plat via Lovable AI Gateway (Nano Banana)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, description } = await req.json();

    if (!name || typeof name !== "string") {
      return new Response(
        JSON.stringify({ error: "Le nom du plat est requis" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY non configurée");
    }

    const prompt = `Photographie culinaire ultra-réaliste et fidèle du plat exact suivant: "${name}".${description ? ` Détails du plat: ${description}.` : ""} 

CONSIGNES STRICTES:
- Représenter EXACTEMENT le plat nommé "${name}", avec ses ingrédients réels et caractéristiques. Ne pas inventer un autre plat.
- Si le plat est africain/camerounais/sénégalais/ivoirien (ex: ndolè, eru, koki, achu, poulet DG, taro sauce jaune, mbongo tchobi, thieboudienne, attiéké, alloco, jollof rice, fufu, bobolo, miondo, soya, brochettes, sauce arachide, okok, kondre, etc.), respecter scrupuleusement la recette traditionnelle, les couleurs et la présentation typique de ce plat.
- Si c'est une boisson (jus, bissap, gingembre, foléré, bière, cocktail, soda), la servir dans le verre/bouteille approprié(e), pas dans une assiette.
- Photographie professionnelle, vue 3/4 ou de dessus, lumière naturelle, dressage authentique, fond neutre/bois/nappe, haute résolution, appétissant.
- Aucun texte, aucun logo, aucun filigrane sur l'image.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Trop de requêtes. Réessayez dans quelques instants.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error:
              "Crédits IA épuisés. Ajoutez des crédits dans Settings → Workspace → Usage.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl =
      data.choices?.[0]?.message?.images?.[0]?.image_url?.url ?? null;

    if (!imageUrl) {
      throw new Error("Aucune image générée");
    }

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-dish-image error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erreur inconnue",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
