
import { Website } from "@/hooks/useWebsites";

// Renvoie le bloc <style> complet utilisé dans la preview HTML
export function getWebsitePreviewCss(website: Website): string {
  return `
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { position: fixed; top: 0; left: 0; right: 0; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); padding: 1rem 2rem; z-index: 1000; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .nav { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; }
    .logo { display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; font-weight: bold; color: ${website.primary_color || '#2563eb'}; }
    .logo img { width: 40px; height: 40px; border-radius: 50%; }
    .nav-links { display: flex; gap: 2rem; list-style: none; }
    .nav-links a { text-decoration: none; color: #333; font-weight: 500; transition: color 0.3s; }
    .nav-links a:hover { color: ${website.primary_color || '#2563eb'}; }
    .cta-button { background: ${website.primary_color || '#2563eb'}; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 25px; font-weight: 500; cursor: pointer; transition: all 0.3s; }
    .cta-button:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(37,99,235,0.3); }
    .hero { height: 100vh; background: linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), url('${website.hero_image_url ||
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
    }'); background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; text-align: center; color: white; }
    .hero-content h1 { font-size: 3.5rem; margin-bottom: 1rem; font-weight: 700; }
    .hero-content p { font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9; }
    .hero-buttons { display: flex; gap: 1rem; justify-content: center; }
    .btn-primary { background: ${website.primary_color || '#2563eb'}; color: white; padding: 1rem 2rem; border: none; border-radius: 30px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
    .btn-secondary { background: transparent; color: white; padding: 1rem 2rem; border: 2px solid white; border-radius: 30px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
    .btn-secondary:hover { background: white; color: #333; }
    .stats { background: white; padding: 4rem 2rem; }
    .stats-container { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 3rem; text-align: center; }
    .stat-item { padding: 2rem; }
    .stat-icon { width: 60px; height: 60px; background: ${website.primary_color || '#2563eb'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: white; font-size: 1.5rem; font-weight: bold; }
    .stat-number { font-size: 2rem; font-weight: bold; color: ${website.primary_color || '#2563eb'}; margin-bottom: 0.5rem; }
    .stat-label { color: #666; font-weight: 500; }
    .specialities { background: #f8fafc; padding: 4rem 2rem; }
    .section-title { text-align: center; margin-bottom: 3rem; }
    .section-title h2 { font-size: 2.5rem; margin-bottom: 1rem; color: #333; }
    .section-title p { color: #666; font-size: 1.1rem; }
    .specialities-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
    .speciality-card { background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); transition: transform 0.3s; }
    .speciality-card:hover { transform: translateY(-5px); }
    .speciality-image { width:100%; height:200px; background:linear-gradient(45deg, ${website.primary_color ||
    '#2563eb'
    }, ${website.secondary_color || '#ef4444'}); display:flex; align-items:center; justify-content:center; color:white; font-size:1.5rem; font-weight:bold; background-size:cover; background-position:center; }
    .speciality-content { padding: 1.5rem; }
    .speciality-title { font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem; color: #333; }
    .speciality-price { color: ${website.primary_color || '#2563eb'}; font-size: 1.1rem; font-weight: bold; margin-bottom: 1rem; }
    .speciality-rating { display: flex; align-items: center; gap: 0.5rem; color: #fbbf24; }
    .contact { background: #1f2937; color: white; padding: 4rem 2rem; }
    .contact-container { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
    .contact-title { font-size: 2.5rem; margin-bottom: 1rem; }
    .contact-subtitle { color: #9ca3af; margin-bottom: 2rem; }
    .contact-info { display: flex; flex-direction: column; gap: 1rem; }
    .contact-item { display: flex; align-items: center; gap: 1rem; }
    .contact-icon { width: 40px; height: 40px; background: ${website.primary_color || '#2563eb'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .map-placeholder { background: #374151; border-radius: 15px; height: 300px; display: flex; align-items: center; justify-content: center; color: #9ca3af; }
    @media (max-width:768px){
      .nav-links { display: none; }
      .hero-content h1{ font-size:2.5rem;}
      .contact-container{ grid-template-columns:1fr;}
      .hero-buttons{ flex-direction:column; align-items:center;}
    }
  </style>
  `;
}
