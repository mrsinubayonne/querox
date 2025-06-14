
import { Website } from "@/hooks/useWebsites";

export interface PreviewMenuItem {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
}

export function getDisplayMenuItems(
  website: Website,
  menuItems: PreviewMenuItem[]
): PreviewMenuItem[] {
  if (menuItems.length > 0) return menuItems;

  return [
    {
      id: "1",
      name: website.dish1_name || "Hamburger Royal",
      price:
        parseFloat(
          (website.dish1_price || "14.50 €")
            .replace(/[^\d.,]/g, "")
            .replace(",", ".")
        ) || 14.5,
      image_url: website.dish1_image_url,
      description: "Délicieux hamburger préparé avec des ingrédients frais",
    },
    {
      id: "2",
      name: website.dish2_name || "Salade Fraîche",
      price:
        parseFloat(
          (website.dish2_price || "12.90 €")
            .replace(/[^\d.,]/g, "")
            .replace(",", ".")
        ) || 12.9,
      image_url: website.dish2_image_url,
      description: "Salade fraîche avec des légumes de saison",
    },
    {
      id: "3",
      name: website.dish3_name || "Pasta al Pomodoro",
      price:
        parseFloat(
          (website.dish3_price || "16.20 €")
            .replace(/[^\d.,]/g, "")
            .replace(",", ".")
        ) || 16.2,
      image_url: website.dish3_image_url,
      description: "Pâtes fraîches avec sauce tomate maison",
    },
  ];
}

// Pas de décimales, espace comme séparateur de milliers pour le FCFA
export function formatPriceFCFA(price: number) {
  return `${Math.round(price).toLocaleString("fr-FR")} FCFA`;
}
