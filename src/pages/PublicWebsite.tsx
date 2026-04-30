import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface PublicWebsiteData {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  hero_button_primary: string | null;
  hero_button_secondary: string | null;
  stats_experience: string | null;
  stats_clients: string | null;
  stats_dishes: string | null;
  stats_rating: string | null;
  specialities_title: string | null;
  specialities_subtitle: string | null;
  dish1_name: string | null;
  dish1_price: string | null;
  dish1_rating: string | null;
  dish1_image_url: string | null;
  dish2_name: string | null;
  dish2_price: string | null;
  dish2_rating: string | null;
  dish2_image_url: string | null;
  dish3_name: string | null;
  dish3_price: string | null;
  dish3_rating: string | null;
  dish3_image_url: string | null;
  contact_title: string | null;
  contact_subtitle: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  opening_hours: any;
  social_links: any;
}

const PublicWebsite: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [website, setWebsite] = useState<PublicWebsiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWebsite = async () => {
      if (!slug) {
        setError("Slug manquant");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("get_public_website_by_slug", {
          website_slug: slug,
        });

        if (error) throw error;

        if (!data || data.length === 0) {
          setError("Site web introuvable");
          setWebsite(null);
        } else {
          setWebsite(data[0]);
        }
      } catch (err: any) {
        console.error("Erreur lors du chargement du site:", err);
        setError(err.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchWebsite();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <p className="text-xl text-muted-foreground">{error || "Site web introuvable"}</p>
          <p className="text-sm text-muted-foreground">Le site web "{slug}" n'existe pas ou n'est pas publié</p>
        </div>
      </div>
    );
  }

  const primaryColor = website.primary_color || "#3B82F6";
  const secondaryColor = website.secondary_color || "#EF4444";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section
        className="relative min-h-[600px] flex items-center justify-center text-white"
        style={{
          backgroundImage: website.hero_image_url
            ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${website.hero_image_url})`
            : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-4 text-center space-y-6">
          {website.logo_url && <img src={website.logo_url} alt={website.name} className="h-20 mx-auto mb-4" />}
          <h1 className="text-5xl md:text-6xl font-bold">{website.hero_title || website.name}</h1>
          {website.hero_subtitle && <p className="text-xl md:text-2xl max-w-2xl mx-auto">{website.hero_subtitle}</p>}
          <div className="flex gap-4 justify-center flex-wrap">
            {website.hero_button_primary && (
              <button className="px-8 py-3 rounded-lg font-semibold text-lg" style={{ backgroundColor: primaryColor }}>
                {website.hero_button_primary}
              </button>
            )}
            {website.hero_button_secondary && (
              <button className="px-8 py-3 rounded-lg font-semibold text-lg border-2 border-white">
                {website.hero_button_secondary}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {(website.stats_experience || website.stats_clients || website.stats_dishes || website.stats_rating) && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {website.stats_experience && (
                <div>
                  <div className="text-4xl font-bold" style={{ color: primaryColor }}>
                    {website.stats_experience}
                  </div>
                  <div className="text-muted-foreground mt-2">Années d'expérience</div>
                </div>
              )}
              {website.stats_clients && (
                <div>
                  <div className="text-4xl font-bold" style={{ color: primaryColor }}>
                    {website.stats_clients}
                  </div>
                  <div className="text-muted-foreground mt-2">Clients satisfaits</div>
                </div>
              )}
              {website.stats_dishes && (
                <div>
                  <div className="text-4xl font-bold" style={{ color: primaryColor }}>
                    {website.stats_dishes}
                  </div>
                  <div className="text-muted-foreground mt-2">Plats au menu</div>
                </div>
              )}
              {website.stats_rating && (
                <div>
                  <div className="text-4xl font-bold" style={{ color: primaryColor }}>
                    {website.stats_rating}
                  </div>
                  <div className="text-muted-foreground mt-2">Note moyenne</div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Specialities Section */}
      {(website.dish1_name || website.dish2_name || website.dish3_name) && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">{website.specialities_title || "Nos Spécialités"}</h2>
              {website.specialities_subtitle && (
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{website.specialities_subtitle}</p>
              )}
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {website.dish1_name && (
                <div className="bg-card rounded-lg overflow-hidden shadow-lg">
                  {website.dish1_image_url && (
                    <img src={website.dish1_image_url} alt={website.dish1_name} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-2">{website.dish1_name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-semibold" style={{ color: primaryColor }}>
                        {website.dish1_price}
                      </span>
                      {website.dish1_rating && <span className="text-yellow-500">★ {website.dish1_rating}</span>}
                    </div>
                  </div>
                </div>
              )}
              {website.dish2_name && (
                <div className="bg-card rounded-lg overflow-hidden shadow-lg">
                  {website.dish2_image_url && (
                    <img src={website.dish2_image_url} alt={website.dish2_name} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-2">{website.dish2_name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-semibold" style={{ color: primaryColor }}>
                        {website.dish2_price}
                      </span>
                      {website.dish2_rating && <span className="text-yellow-500">★ {website.dish2_rating}</span>}
                    </div>
                  </div>
                </div>
              )}
              {website.dish3_name && (
                <div className="bg-card rounded-lg overflow-hidden shadow-lg">
                  {website.dish3_image_url && (
                    <img src={website.dish3_image_url} alt={website.dish3_name} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-2">{website.dish3_name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-semibold" style={{ color: primaryColor }}>
                        {website.dish3_price}
                      </span>
                      {website.dish3_rating && <span className="text-yellow-500">★ {website.dish3_rating}</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">{website.contact_title || "Contactez-nous"}</h2>
          {website.contact_subtitle && <p className="text-xl text-muted-foreground mb-8">{website.contact_subtitle}</p>}
          {website.description && <p className="text-muted-foreground max-w-2xl mx-auto">{website.description}</p>}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2026 {website.name}. Tous droits réservés.</p>
          <p className="text-sm mt-2">Propulsé par Querox</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicWebsite;
