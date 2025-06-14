
import React, { useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Website } from "@/hooks/useWebsites";
import { Textarea } from "./ui/textarea";
import LogoUpload from "./LogoUpload";
import SimpleImageUploader from "./SimpleImageUploader";
import { debounce } from "lodash";

interface WebsiteConfigPanelProps {
  tab: string;
  onTabChange: (tab: string) => void;
  website: Website | null;
  onUpdate: (id: string, updates: Partial<Website>) => Promise<any>;
}

const WebsiteConfigPanel: React.FC<WebsiteConfigPanelProps> = ({
  tab,
  onTabChange,
  website,
  onUpdate,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [secondaryColor, setSecondaryColor] = useState("#EF4444");
  
  // Hero section
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState<string | undefined>(undefined);
  const [heroBtnPrimary, setHeroBtnPrimary] = useState("Voir le Menu");
  const [heroBtnSecondary, setHeroBtnSecondary] = useState("Découvrir l'histoire");
  
  // Stats section
  const [statsExperience, setStatsExperience] = useState("15+");
  const [statsClients, setStatsClients] = useState("10k+");
  const [statsDishes, setStatsDishes] = useState("50+");
  const [statsRating, setStatsRating] = useState("4.8★");
  
  // Specialities section
  const [specialitiesTitle, setSpecialitiesTitle] = useState("Découvrez nos spécialités");
  const [specialitiesSubtitle, setSpecialitiesSubtitle] = useState("Chaque plat est préparé avec des ingrédients frais et de qualité");
  
  // Dishes
  const [dish1Name, setDish1Name] = useState("Hamburger Royal");
  const [dish1Price, setDish1Price] = useState("14.50 €");
  const [dish1Rating, setDish1Rating] = useState("4.8");
  const [dish1ImageUrl, setDish1ImageUrl] = useState<string | undefined>(undefined);
  
  const [dish2Name, setDish2Name] = useState("Salade Fraîche");
  const [dish2Price, setDish2Price] = useState("12.90 €");
  const [dish2Rating, setDish2Rating] = useState("4.7");
  const [dish2ImageUrl, setDish2ImageUrl] = useState<string | undefined>(undefined);
  
  const [dish3Name, setDish3Name] = useState("Pasta al Pomodoro");
  const [dish3Price, setDish3Price] = useState("16.20 €");
  const [dish3Rating, setDish3Rating] = useState("4.9");
  const [dish3ImageUrl, setDish3ImageUrl] = useState<string | undefined>(undefined);
  
  // Contact section
  const [contactTitle, setContactTitle] = useState("Venez nous rendre visite");
  const [contactSubtitle, setContactSubtitle] = useState("Nous sommes ouverts du lundi au dimanche");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const debouncedUpdate = useCallback(debounce((id, updates) => onUpdate(id, updates), 500), [onUpdate]);

  useEffect(() => {
    if (website) {
      setName(website.name || "");
      setDescription(website.description || "");
      setLogoUrl(website.logo_url);
      setPrimaryColor(website.primary_color || "#3B82F6");
      setSecondaryColor(website.secondary_color || "#EF4444");
      
      setHeroTitle(website.hero_title || website.name || "");
      setHeroSubtitle(website.hero_subtitle || website.description || "Une expérience culinaire unique vous attend");
      setHeroImageUrl(website.hero_image_url);
      setHeroBtnPrimary(website.hero_button_primary || "Voir le Menu");
      setHeroBtnSecondary(website.hero_button_secondary || "Découvrir l'histoire");
      
      setStatsExperience(website.stats_experience || "15+");
      setStatsClients(website.stats_clients || "10k+");
      setStatsDishes(website.stats_dishes || "50+");
      setStatsRating(website.stats_rating || "4.8★");
      
      setSpecialitiesTitle(website.specialities_title || "Découvrez nos spécialités");
      setSpecialitiesSubtitle(website.specialities_subtitle || "Chaque plat est préparé avec des ingrédients frais et de qualité");
      
      setDish1Name(website.dish1_name || "Hamburger Royal");
      setDish1Price(website.dish1_price || "14.50 €");
      setDish1Rating(website.dish1_rating || "4.8");
      setDish1ImageUrl(website.dish1_image_url);
      
      setDish2Name(website.dish2_name || "Salade Fraîche");
      setDish2Price(website.dish2_price || "12.90 €");
      setDish2Rating(website.dish2_rating || "4.7");
      setDish2ImageUrl(website.dish2_image_url);
      
      setDish3Name(website.dish3_name || "Pasta al Pomodoro");
      setDish3Price(website.dish3_price || "16.20 €");
      setDish3Rating(website.dish3_rating || "4.9");
      setDish3ImageUrl(website.dish3_image_url);
      
      setContactTitle(website.contact_title || "Venez nous rendre visite");
      setContactSubtitle(website.contact_subtitle || "Nous sommes ouverts du lundi au dimanche");
      setAddress(website.address || "");
      setPhone(website.phone || "");
      setEmail(website.email || "");
    }
  }, [website]);

  const handleUpdate = (updates: Partial<Website>) => {
    if (website) {
      debouncedUpdate(website.id, updates);
    }
  };
  
  const handleLogoChange = (newLogoUrl: string | undefined) => {
    setLogoUrl(newLogoUrl);
    if (website) {
      onUpdate(website.id, { logo_url: newLogoUrl });
    }
  };

  return (
    <Tabs value={tab} onValueChange={onTabChange} className="w-full">
      <TabsList>
        <TabsTrigger value="general">Général</TabsTrigger>
        <TabsTrigger value="hero">Hero</TabsTrigger>
        <TabsTrigger value="content">Contenu</TabsTrigger>
        <TabsTrigger value="design">Design</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
      </TabsList>
      <div className="pt-6">
        <TabsContent value="general">
          <div className="space-y-6">
            <div>
              <label className="block mb-2 font-medium text-sm">Nom du restaurant</label>
              <Input
                placeholder="Mon Restaurant"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  handleUpdate({ name: e.target.value });
                }}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-sm">Description</label>
              <Textarea
                placeholder="Découvrez notre cuisine authentique et savoureuse dans un cadre chaleureux."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  handleUpdate({ description: e.target.value });
                }}
                className="h-24"
              />
            </div>
            <LogoUpload currentLogo={logoUrl} onLogoChange={handleLogoChange} />
          </div>
        </TabsContent>
        
        <TabsContent value="hero">
          <div className="space-y-6">
            <div>
              <label className="block mb-2 font-medium text-sm">Titre principal</label>
              <Input
                value={heroTitle}
                onChange={(e) => {
                  setHeroTitle(e.target.value);
                  handleUpdate({ hero_title: e.target.value });
                }}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-sm">Sous-titre</label>
              <Textarea
                value={heroSubtitle}
                onChange={(e) => {
                  setHeroSubtitle(e.target.value);
                  handleUpdate({ hero_subtitle: e.target.value });
                }}
                className="h-20"
              />
            </div>
            <SimpleImageUploader 
              label="Image d'arrière-plan" 
              imageUrl={heroImageUrl} 
              onImageChange={(url) => {
                setHeroImageUrl(url);
                handleUpdate({ hero_image_url: url });
              }} 
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium text-sm">Bouton primaire</label>
                <Input
                  value={heroBtnPrimary}
                  onChange={(e) => {
                    setHeroBtnPrimary(e.target.value);
                    handleUpdate({ hero_button_primary: e.target.value });
                  }}
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-sm">Bouton secondaire</label>
                <Input
                  value={heroBtnSecondary}
                  onChange={(e) => {
                    setHeroBtnSecondary(e.target.value);
                    handleUpdate({ hero_button_secondary: e.target.value });
                  }}
                />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="content">
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium text-sm">Années d'expérience</label>
                  <Input
                    value={statsExperience}
                    onChange={(e) => {
                      setStatsExperience(e.target.value);
                      handleUpdate({ stats_experience: e.target.value });
                    }}
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-sm">Clients satisfaits</label>
                  <Input
                    value={statsClients}
                    onChange={(e) => {
                      setStatsClients(e.target.value);
                      handleUpdate({ stats_clients: e.target.value });
                    }}
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-sm">Plats au menu</label>
                  <Input
                    value={statsDishes}
                    onChange={(e) => {
                      setStatsDishes(e.target.value);
                      handleUpdate({ stats_dishes: e.target.value });
                    }}
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-sm">Note moyenne</label>
                  <Input
                    value={statsRating}
                    onChange={(e) => {
                      setStatsRating(e.target.value);
                      handleUpdate({ stats_rating: e.target.value });
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Section Spécialités</h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium text-sm">Titre de la section</label>
                  <Input
                    value={specialitiesTitle}
                    onChange={(e) => {
                      setSpecialitiesTitle(e.target.value);
                      handleUpdate({ specialities_title: e.target.value });
                    }}
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-sm">Sous-titre de la section</label>
                  <Textarea
                    value={specialitiesSubtitle}
                    onChange={(e) => {
                      setSpecialitiesSubtitle(e.target.value);
                      handleUpdate({ specialities_subtitle: e.target.value });
                    }}
                    className="h-20"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Plats</h3>
              <div className="space-y-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Plat 1</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-sm">Nom</label>
                        <Input
                          value={dish1Name}
                          onChange={(e) => {
                            setDish1Name(e.target.value);
                            handleUpdate({ dish1_name: e.target.value });
                          }}
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm">Prix</label>
                        <Input
                          value={dish1Price}
                          onChange={(e) => {
                            setDish1Price(e.target.value);
                            handleUpdate({ dish1_price: e.target.value });
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm">Note</label>
                      <Input
                        value={dish1Rating}
                        onChange={(e) => {
                          setDish1Rating(e.target.value);
                          handleUpdate({ dish1_rating: e.target.value });
                        }}
                      />
                    </div>
                    <SimpleImageUploader 
                      label="Image du plat" 
                      imageUrl={dish1ImageUrl} 
                      onImageChange={(url) => {
                        setDish1ImageUrl(url);
                        handleUpdate({ dish1_image_url: url });
                      }} 
                    />
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Plat 2</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-sm">Nom</label>
                        <Input
                          value={dish2Name}
                          onChange={(e) => {
                            setDish2Name(e.target.value);
                            handleUpdate({ dish2_name: e.target.value });
                          }}
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm">Prix</label>
                        <Input
                          value={dish2Price}
                          onChange={(e) => {
                            setDish2Price(e.target.value);
                            handleUpdate({ dish2_price: e.target.value });
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm">Note</label>
                      <Input
                        value={dish2Rating}
                        onChange={(e) => {
                          setDish2Rating(e.target.value);
                          handleUpdate({ dish2_rating: e.target.value });
                        }}
                      />
                    </div>
                    <SimpleImageUploader 
                      label="Image du plat" 
                      imageUrl={dish2ImageUrl} 
                      onImageChange={(url) => {
                        setDish2ImageUrl(url);
                        handleUpdate({ dish2_image_url: url });
                      }} 
                    />
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Plat 3</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-sm">Nom</label>
                        <Input
                          value={dish3Name}
                          onChange={(e) => {
                            setDish3Name(e.target.value);
                            handleUpdate({ dish3_name: e.target.value });
                          }}
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm">Prix</label>
                        <Input
                          value={dish3Price}
                          onChange={(e) => {
                            setDish3Price(e.target.value);
                            handleUpdate({ dish3_price: e.target.value });
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm">Note</label>
                      <Input
                        value={dish3Rating}
                        onChange={(e) => {
                          setDish3Rating(e.target.value);
                          handleUpdate({ dish3_rating: e.target.value });
                        }}
                      />
                    </div>
                    <SimpleImageUploader 
                      label="Image du plat" 
                      imageUrl={dish3ImageUrl} 
                      onImageChange={(url) => {
                        setDish3ImageUrl(url);
                        handleUpdate({ dish3_image_url: url });
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="design">
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Couleur principale</label>
              <Input
                type="color"
                value={primaryColor}
                onChange={(e) => {
                  setPrimaryColor(e.target.value);
                  handleUpdate({ primary_color: e.target.value });
                }}
                className="w-20 h-10 p-1"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Couleur secondaire</label>
              <Input
                type="color"
                value={secondaryColor}
                onChange={(e) => {
                  setSecondaryColor(e.target.value);
                  handleUpdate({ secondary_color: e.target.value });
                }}
                className="w-20 h-10 p-1" />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="contact">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Section Contact</h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium text-sm">Titre de la section</label>
                  <Input
                    value={contactTitle}
                    onChange={(e) => {
                      setContactTitle(e.target.value);
                      handleUpdate({ contact_title: e.target.value });
                    }}
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-sm">Sous-titre de la section</label>
                  <Input
                    value={contactSubtitle}
                    onChange={(e) => {
                      setContactSubtitle(e.target.value);
                      handleUpdate({ contact_subtitle: e.target.value });
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Informations de contact</h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Adresse</label>
                  <Input 
                    placeholder="123 Rue de la Gastronomie, 75001 Paris" 
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      handleUpdate({ address: e.target.value });
                    }}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Téléphone</label>
                  <Input 
                    placeholder="01 23 45 67 89" 
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      handleUpdate({ phone: e.target.value });
                    }}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Email</label>
                  <Input 
                    placeholder="contact@monrestaurant.fr" 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      handleUpdate({ email: e.target.value });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default WebsiteConfigPanel;
