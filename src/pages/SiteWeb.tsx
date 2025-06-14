
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Camera, LayoutDashboard, Users, Star } from "lucide-react";

const demoHero =
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=80";

const stats = [
  { label: "Sites créés", value: 27, icon: <Globe className="w-5 h-5" /> },
  { label: "Pages publiées", value: 93, icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Images en ligne", value: 164, icon: <Camera className="w-5 h-5" /> },
  { label: "Clients satisfaits", value: 402, icon: <Users className="w-5 h-5" /> },
];

const specialities = [
  { title: "Réservation en ligne", desc: "Recevez et gérez les réservations en temps réel.", icon: <Star className="w-5 h-5 text-primary" /> },
  { title: "Menus interactifs", desc: "Affichez vos plats et menus de façon élégante sur mobile et desktop.", icon: <LayoutDashboard className="w-5 h-5 text-primary" /> },
  { title: "Galerie photos", desc: "Faites saliver vos visiteurs grâce à une galerie moderne.", icon: <Camera className="w-5 h-5 text-primary" /> },
  { title: "Personnalisation facile", desc: "Changez couleurs, logo, infos depuis votre tableau de bord.", icon: <Globe className="w-5 h-5 text-primary" /> },
];

const SiteWeb: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 dark:from-background dark:to-background px-0 md:px-8 pb-8">
      {/* HERO */}
      <section className="w-full bg-white shadow md:rounded-b-3xl pb-10 mb-8">
        <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-10 px-4 pt-8">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-5 text-gray-900 dark:text-white leading-tight animate-fade-in">
              Créez un site web qui ouvre l’appétit 🥐
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-lg animate-fade-in">
              Présentez votre restaurant, vos menus et vos spécialités en quelques clics.
              Adoptez une présence en ligne moderne et élégante qui attire de nouveaux clients.
            </p>
            <div className="flex gap-3 items-center mt-5">
              <Button size="lg" className="animate-pulse">Démarrer la démo</Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 transition">Voir un exemple</Button>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <img
              src={demoHero}
              alt="Démo site restaurant"
              className="rounded-2xl shadow-lg max-w-full w-[370px] h-[320px] object-cover ring-2 ring-primary"
              style={{ animation: "fade-in 0.5s" }}
            />
          </div>
        </div>
      </section>

      {/* STATISTIQUES */}
      <section className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 animate-fade-in">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5 text-center flex flex-col items-center shadow hover-scale">
            <span className="mb-3">{stat.icon}</span>
            <span className="text-2xl font-bold text-primary">{stat.value}</span>
            <span className="text-gray-600 dark:text-gray-400 text-xs">{stat.label}</span>
          </Card>
        ))}
      </section>

      {/* SPÉCIALITÉS */}
      <section className="max-w-6xl mx-auto px-4 mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-5">
          Spécialités du site
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {specialities.map((item) => (
            <Card key={item.title} className="flex items-start gap-4 p-5 hover-scale shadow">
              {item.icon}
              <div>
                <div className="font-medium text-base mb-1">{item.title}</div>
                <div className="text-gray-600 text-sm">{item.desc}</div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* MODÈLES DE SITES */}
      <section className="max-w-5xl mx-auto px-4">
        <h3 className="text-xl font-semibold mb-3">Exemples de sites restaurant</h3>
        <div className="flex flex-wrap md:flex-nowrap gap-6">
          <Card className="p-4 flex-1 flex flex-col items-center justify-center">
            <img
              className="w-full h-48 object-cover mb-3 rounded-md border"
              src="https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=600&q=80"
              alt="Exemple menu"
            />
            <div className="font-semibold text-gray-700 mb-1">Moderne</div>
            <div className="text-xs text-gray-500 mb-2">Menu et visuels immersifs</div>
            <Badge variant="secondary">Populaire</Badge>
          </Card>
          <Card className="p-4 flex-1 flex flex-col items-center justify-center">
            <img
              className="w-full h-48 object-cover mb-3 rounded-md border"
              src="https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=600&q=80"
              alt="Exemple élégant"
            />
            <div className="font-semibold text-gray-700 mb-1">Élégant</div>
            <div className="text-xs text-gray-500 mb-2">Présentation raffinée</div>
            <Badge variant="default">Nouveau</Badge>
          </Card>
        </div>
      </section>

      <footer className="w-full pt-20 pb-4 text-center text-muted mt-12 text-xs opacity-70">
        Cette démo est une maquette. La gestion complète sera disponible après activation.
      </footer>
    </div>
  );
};

export default SiteWeb;
