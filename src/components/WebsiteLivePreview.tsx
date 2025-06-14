import React from "react";
import { Website } from "@/hooks/useWebsites";
import { useMenuForWebsite } from "@/hooks/useMenuForWebsite";

interface WebsiteLivePreviewProps {
  website: Website | null;
}

const WebsiteLivePreview: React.FC<WebsiteLivePreviewProps> = ({ website }) => {
  const { menuItems, loading: menuLoading } = useMenuForWebsite();

  if (!website) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg min-h-[480px]">
        <div className="text-gray-400 text-center">Sélectionnez ou créez un site pour voir l'aperçu</div>
      </div>
    );
  }

  const getPreviewSrcDoc = () => {
    if (!website) return "";
    
    const heroImageUrl = website.hero_image_url || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80';
    
    // Utiliser les vrais plats du menu ou des plats par défaut
    const displayItems = menuItems.length > 0 ? menuItems : [
      {
        id: '1',
        name: website.dish1_name || 'Hamburger Royal',
        price: parseFloat((website.dish1_price || '14.50 €').replace(/[^\d.,]/g, '').replace(',', '.')) || 14.5,
        image_url: website.dish1_image_url,
        description: 'Délicieux hamburger préparé avec des ingrédients frais'
      },
      {
        id: '2',
        name: website.dish2_name || 'Salade Fraîche',
        price: parseFloat((website.dish2_price || '12.90 €').replace(/[^\d.,]/g, '').replace(',', '.')) || 12.9,
        image_url: website.dish2_image_url,
        description: 'Salade fraîche avec des légumes de saison'
      },
      {
        id: '3',
        name: website.dish3_name || 'Pasta al Pomodoro',
        price: parseFloat((website.dish3_price || '16.20 €').replace(/[^\d.,]/g, '').replace(',', '.')) || 16.2,
        image_url: website.dish3_image_url,
        description: 'Pâtes fraîches avec sauce tomate maison'
      }
    ];

    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${website.name}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          
          .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 1rem 2rem;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          
          .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .logo {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.5rem;
            font-weight: bold;
            color: ${website.primary_color || '#2563eb'};
          }
          
          .logo img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
          }
          
          .nav-links {
            display: flex;
            gap: 2rem;
            list-style: none;
          }
          
          .nav-links a {
            text-decoration: none;
            color: #333;
            font-weight: 500;
            transition: color 0.3s;
          }
          
          .nav-links a:hover {
            color: ${website.primary_color || '#2563eb'};
          }
          
          .cta-button {
            background: ${website.primary_color || '#2563eb'};
            color: white;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 25px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s;
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
          }
          
          .hero {
            height: 100vh;
            background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${heroImageUrl}');
            background-size: cover;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: white;
          }
          
          .hero-content h1 {
            font-size: 3.5rem;
            margin-bottom: 1rem;
            font-weight: 700;
          }
          
          .hero-content p {
            font-size: 1.25rem;
            margin-bottom: 2rem;
            opacity: 0.9;
          }
          
          .hero-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
          }
          
          .btn-primary {
            background: ${website.primary_color || '#2563eb'};
            color: white;
            padding: 1rem 2rem;
            border: none;
            border-radius: 30px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
          }
          
          .btn-secondary {
            background: transparent;
            color: white;
            padding: 1rem 2rem;
            border: 2px solid white;
            border-radius: 30px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
          }
          
          .btn-secondary:hover {
            background: white;
            color: #333;
          }
          
          .stats {
            background: white;
            padding: 4rem 2rem;
          }
          
          .stats-container {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 3rem;
            text-align: center;
          }
          
          .stat-item {
            padding: 2rem;
          }
          
          .stat-icon {
            width: 60px;
            height: 60px;
            background: ${website.primary_color || '#2563eb'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            color: white;
            font-size: 1.5rem;
            font-weight: bold;
          }
          
          .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: ${website.primary_color || '#2563eb'};
            margin-bottom: 0.5rem;
          }
          
          .stat-label {
            color: #666;
            font-weight: 500;
          }
          
          .specialities {
            background: #f8fafc;
            padding: 4rem 2rem;
          }
          
          .section-title {
            text-align: center;
            margin-bottom: 3rem;
          }
          
          .section-title h2 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            color: #333;
          }
          
          .section-title p {
            color: #666;
            font-size: 1.1rem;
          }
          
          .specialities-grid {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
          }
          
          .speciality-card {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            transition: transform 0.3s;
          }
          
          .speciality-card:hover {
            transform: translateY(-5px);
          }
          
          .speciality-image {
            width: 100%;
            height: 200px;
            background: linear-gradient(45deg, ${website.primary_color || '#2563eb'}, ${website.secondary_color || '#ef4444'});
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5rem;
            font-weight: bold;
            background-size: cover;
            background-position: center;
          }
          
          .speciality-content {
            padding: 1.5rem;
          }
          
          .speciality-title {
            font-size: 1.25rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
            color: #333;
          }
          
          .speciality-price {
            color: ${website.primary_color || '#2563eb'};
            font-size: 1.1rem;
            font-weight: bold;
            margin-bottom: 1rem;
          }
          
          .speciality-rating {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #fbbf24;
          }
          
          .contact {
            background: #1f2937;
            color: white;
            padding: 4rem 2rem;
          }
          
          .contact-container {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
          }
          
          .contact-title {
            font-size: 2.5rem;
            margin-bottom: 1rem;
          }
          
          .contact-subtitle {
            color: #9ca3af;
            margin-bottom: 2rem;
          }
          
          .contact-info {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          
          .contact-icon {
            width: 40px;
            height: 40px;
            background: ${website.primary_color || '#2563eb'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .map-placeholder {
            background: #374151;
            border-radius: 15px;
            height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #9ca3af;
          }
          
          @media (max-width: 768px) {
            .nav-links {
              display: none;
            }
            
            .hero-content h1 {
              font-size: 2.5rem;
            }
            
            .contact-container {
              grid-template-columns: 1fr;
            }
            
            .hero-buttons {
              flex-direction: column;
              align-items: center;
            }
          }
        </style>
      </head>
      <body>
        <header class="header">
          <nav class="nav">
            <div class="logo">
              ${website.logo_url ? `<img src="${website.logo_url}" alt="Logo">` : '🍽️'}
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
            <p>${website.hero_subtitle || website.description || 'Une expérience culinaire unique vous attend'}</p>
            <div class="hero-buttons">
              <button class="btn-primary">${website.hero_button_primary || 'Voir le Menu'}</button>
              <button class="btn-secondary">${website.hero_button_secondary || 'Découvrir l\'histoire'}</button>
            </div>
          </div>
        </section>

        <section class="stats">
          <div class="stats-container">
            <div class="stat-item">
              <div class="stat-icon">${(website.stats_experience || '15+').substring(0, 3)}</div>
              <div class="stat-number">${website.stats_experience || '15+'}</div>
              <div class="stat-label">Années d'expérience</div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">${(website.stats_clients || '10k').substring(0, 3)}</div>
              <div class="stat-number">${website.stats_clients || '10k+'}</div>
              <div class="stat-label">Clients satisfaits</div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">${(website.stats_dishes || '50+').substring(0, 3)}</div>
              <div class="stat-number">${website.stats_dishes || '50+'}</div>
              <div class="stat-label">Plats au menu</div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">${(website.stats_rating || '4.8').substring(0, 3)}</div>
              <div class="stat-number">${website.stats_rating || '4.8★'}</div>
              <div class="stat-label">Note moyenne</div>
            </div>
          </div>
        </section>

        <section class="specialities" id="menu">
          <div class="section-title">
            <h2>${website.specialities_title || 'Découvrez nos spécialités'}</h2>
            <p>${website.specialities_subtitle || 'Chaque plat est préparé avec des ingrédients frais et de qualité'}</p>
          </div>
          <div class="specialities-grid">
            ${displayItems.map((item, index) => `
              <div class="speciality-card">
                <div class="speciality-image" ${item.image_url ? `style="background-image: url('${item.image_url}');"` : ''}>${!item.image_url ? item.name : ''}</div>
                <div class="speciality-content">
                  <div class="speciality-title">${item.name}</div>
                  <div class="speciality-price">${item.price.toFixed(2)} €</div>
                  <div class="speciality-rating">
                    <span>★★★★★</span>
                    <span>${website[`dish${index + 1}_rating`] || '4.8'}</span>
                  </div>
                  ${item.description ? `<p style="margin-top: 0.5rem; color: #666; font-size: 0.9rem;">${item.description}</p>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="contact" id="contact">
          <div class="contact-container">
            <div>
              <h2 class="contact-title">${website.contact_title || 'Venez nous rendre visite'}</h2>
              <p class="contact-subtitle">${website.contact_subtitle || 'Nous sommes ouverts du lundi au dimanche'}</p>
              <div class="contact-info">
                <div class="contact-item">
                  <div class="contact-icon">📍</div>
                  <div>
                    <strong>Adresse</strong><br>
                    ${website.address || '123 Rue de la Gastronomie, 75001 Paris'}
                  </div>
                </div>
                <div class="contact-item">
                  <div class="contact-icon">📞</div>
                  <div>
                    <strong>Téléphone</strong><br>
                    ${website.phone || '01 23 45 67 89'}
                  </div>
                </div>
                <div class="contact-item">
                  <div class="contact-icon">✉️</div>
                  <div>
                    <strong>Email</strong><br>
                    ${website.email || 'contact@monrestaurant.fr'}
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
  };

  const src = website.domain ? `https://${website.domain}` : undefined;
  const srcDoc = !website.domain ? getPreviewSrcDoc() : undefined;

  return (
    <div className="relative w-full h-full">
      <iframe
        title={`Aperçu de ${website.name}`}
        src={src}
        srcDoc={srcDoc}
        className="w-full h-[70vh] border-0 bg-white rounded-lg"
        style={{ minHeight: 480 }}
      />
    </div>
  );
};

export default WebsiteLivePreview;
