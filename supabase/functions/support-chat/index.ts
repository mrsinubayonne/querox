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
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Tu es l'assistant support IA de QUEROX, un logiciel de gestion complète pour restaurants.

FONCTIONNALITÉS PRINCIPALES DE QUEROX :

1. **DASHBOARD**
   - Vue d'ensemble des ventes (jour/semaine/mois)
   - Nombre total de commandes et évolution
   - Taux de livraison réussie
   - Valeur moyenne du panier
   - Top 3 des produits les plus vendus
   - Alertes : stock faible, commandes en retard

2. **GESTION DES TABLES**
   - Ouvrir/fermer des sessions de table
   - Ajouter des commandes à une table
   - Tables renommables (clic sur le crayon)
   - Prévisualisation de facture en temps réel
   - Marquer une table comme payée
   - Imprimer les factures
   - Support multi-PDV (points de vente)

3. **MENU & PLATS**
   - Créer et gérer plusieurs menus
   - Organiser par catégories
   - Plats avec prix fixes ou **prix personnalisables** à la commande
   - Noms de plats modifiables à la commande
   - Upload d'images pour les plats
   - Import de menu par photo/PDF avec IA
   - Gestion de la disponibilité des plats
   - Partage de menus entre PDV

4. **COMMANDES**
   - Suivi en temps réel des commandes
   - Statuts : En attente, En préparation, Prêt, Livré
   - Commandes sur place, à emporter, livraison
   - QR codes pour commande en ligne
   - Notifications par email
   - Mode hors ligne disponible

5. **INVENTAIRE**
   - Gestion complète des stocks
   - Alertes de stock critique
   - Liaison ingrédients ↔ plats
   - Déduction automatique lors de ventes
   - Bons de commande fournisseurs
   - Suivi des pertes et mouvements
   - Rapports analytiques
   - Support multi-PDV

6. **FACTURES & B2B**
   - Génération automatique de factures
   - Factures A4 personnalisables
   - Support B2B avec paiement différé
   - Gestion des clients professionnels
   - Suivi des impayés
   - Conditions de paiement configurables
   - Export comptable

7. **COMPTABILITÉ**
   - Périodes comptables
   - Transactions revenus/dépenses
   - Rapports financiers détaillés
   - Export Excel/PDF
   - Budgets et prévisions
   - Suivi par PDV

8. **RÉSERVATIONS**
   - Système de réservation en ligne
   - Gestion du planning
   - Confirmation par email
   - Notes et demandes spéciales

9. **CLIENTS & CRM**
   - Base de données clients
   - Historique des visites
   - Fidélisation
   - Statistiques de consommation

10. **ÉQUIPE**
    - Gestion des membres
    - Rôles et permissions personnalisés
    - Codes d'accès par profil
    - Suivi de la performance
    - Logs d'activité

11. **RAPPORTS**
    - Rapports journaliers détaillés
    - Statistiques de ventes
    - Export PDF et Excel
    - Analyses par période

12. **PARAMÈTRES**
    - Configuration des PDV
    - Paramètres de facturation
    - Personnalisation du restaurant
    - Gestion des abonnements
    - Mode multi-PDV

13. **SITE WEB**
    - Création de site vitrine
    - Menu en ligne
    - Galerie photos
    - Informations de contact

14. **QR CODES**
    - Génération de QR codes
    - Menu en ligne accessible
    - Commandes directes

15. **ABONNEMENTS**
    - Starter : 1 PDV
    - Pro : 3 PDV
    - Entreprise : Illimité
    - Essai gratuit 14 jours

SUPPORT TECHNIQUE :
- Chat IA disponible 24/7
- Bouton "Contacter Support" pour escalade humaine
- Guide pas à pas
- Résolution d'erreurs

TON RÔLE :
✅ Répondre aux questions sur toutes les fonctionnalités
✅ Guider pas à pas dans l'utilisation
✅ Expliquer comment résoudre les erreurs
✅ Être patient, clair et pédagogue
✅ Donner des exemples concrets
✅ Proposer des solutions alternatives si nécessaire

❌ Ne pas inventer de fonctionnalités qui n'existent pas
❌ Ne pas donner de conseils financiers ou juridiques
❌ Si tu ne connais pas la réponse, suggère de contacter le support humain

Réponds toujours en français, de manière professionnelle mais amicale.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de taux atteinte. Veuillez réessayer dans quelques instants." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits insuffisants. Veuillez contacter l'administrateur." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erreur du service IA" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Support chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
