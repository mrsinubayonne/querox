
import { Website } from "@/hooks/useWebsites";
import { getDisplayMenuItems, formatPriceFCFA } from "./menuPreviewUtils";
import { getWebsitePreviewCss } from "./websitePreviewCss";

export function generateWebsitePreviewHtml(
  website: Website,
  menuItems: any[]
) {
  const displayItems = getDisplayMenuItems(website, menuItems);

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${website.name}</title>
      ${getWebsitePreviewCss(website)}
    </head>
    <body>
      <header class="header">
        <nav class="nav">
          <div class="logo">
            ${
              website.logo_url
                ? `<img src="${website.logo_url}" alt="Logo">`
                : "🍽️"
            }
            <span>${website.name}</span>
          </div>
          <ul class="nav-links">
            <li><a href="#accueil">Accueil</a></li>
            <li><a href="#menu">Menu</a></li>
            <li><a href="#apropos">À propos</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          <button class="cta-button">Réserver</button>
        </nav>
      </header>

      <section class="hero" id="accueil">
        <div class="hero-content">
          <h1>${website.hero_title || website.name}</h1>
          <p>${
            website.hero_subtitle ||
            website.description ||
            "Une expérience culinaire unique vous attend"
          }</p>
          <div class="hero-buttons">
            <button class="btn-primary">${
              website.hero_button_primary || "Voir le Menu"
            }</button>
            <button class="btn-secondary">${
              website.hero_button_secondary || "Découvrir l'histoire"
            }</button>
          </div>
        </div>
      </section>

      <section class="stats">
        <div class="stats-container">
          <div class="stat-item">
            <div class="stat-icon">${
              (website.stats_experience || "15+").substring(0, 3)
            }</div>
            <div class="stat-number">${
              website.stats_experience || "15+"
            }</div>
            <div class="stat-label">Années d'expérience</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">${
              (website.stats_clients || "10k").substring(0, 3)
            }</div>
            <div class="stat-number">${
              website.stats_clients || "10k+"
            }</div>
            <div class="stat-label">Clients satisfaits</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">${
              (website.stats_dishes || "50+").substring(0, 3)
            }</div>
            <div class="stat-number">${website.stats_dishes || "50+"}</div>
            <div class="stat-label">Plats au menu</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">${
              (website.stats_rating || "4.8").substring(0, 3)
            }</div>
            <div class="stat-number">${
              website.stats_rating || "4.8★"
            }</div>
            <div class="stat-label">Note moyenne</div>
          </div>
        </div>
      </section>

      <section class="specialities" id="menu">
        <div class="section-title">
          <h2>${
            website.specialities_title || "Découvrez nos spécialités"
          }</h2>
          <p>${
            website.specialities_subtitle ||
            "Chaque plat est préparé avec des ingrédients frais et de qualité"
          }</p>
        </div>
        <div class="specialities-grid">
          ${displayItems
            .map(
              (item, index) => `
            <div class="speciality-card">
              <div class="speciality-image" ${
                item.image_url
                  ? `style="background-image: url('${item.image_url}');"`
                  : ""
              }>${!item.image_url ? item.name : ""}</div>
              <div class="speciality-content">
                <div class="speciality-title">${item.name}</div>
                <div class="speciality-price">${formatPriceFCFA(
                  item.price
                )}</div>
                <div class="speciality-rating">
                  <span>★★★★★</span>
                  <span>${
                    website[`dish${index + 1}_rating`] || "4.8"
                  }</span>
                </div>
                ${
                  item.description
                    ? `<p style="margin-top: 0.5rem; color: #666; font-size: 0.9rem;">${item.description}</p>`
                    : ""
                }
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </section>

      <section class="contact" id="contact">
        <div class="contact-container">
          <div>
            <h2 class="contact-title">${
              website.contact_title || "Venez nous rendre visite"
            }</h2>
            <p class="contact-subtitle">${
              website.contact_subtitle ||
              "Nous sommes ouverts du lundi au dimanche"
            }</p>
            <div class="contact-info">
              <div class="contact-item">
                <div class="contact-icon">📍</div>
                <div>
                  <strong>Adresse</strong><br>
                  ${
                    website.address ||
                    "123 Rue de la Gastronomie, 75001 Paris"
                  }
                </div>
              </div>
              <div class="contact-item">
                <div class="contact-icon">📞</div>
                <div>
                  <strong>Téléphone</strong><br>
                  ${website.phone || "01 23 45 67 89"}
                </div>
              </div>
              <div class="contact-item">
                <div class="contact-icon">✉️</div>
                <div>
                  <strong>Email</strong><br>
                  ${website.email || "contact@monrestaurant.fr"}
                </div>
              </div>
            </div>
          </div>
          <div class="map-placeholder">
            <div>🗺️ Carte interactive</div>
          </div>
        </div>
      </section>
    </body>
    </html>
  `;
}
