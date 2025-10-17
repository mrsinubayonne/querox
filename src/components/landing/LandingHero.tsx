
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

const LandingHero: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      // Redirect to pricing section
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewDemo = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Hero Principal */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-muted/30 overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary))_0.05,transparent)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary))_0.05,transparent)] pointer-events-none"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          {/* Badge de rating */}
          <div className="inline-flex items-center space-x-2 bg-card/80 backdrop-blur-xl border border-border rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 shadow-lg">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">4.9/5 • Plus de 1000+ restaurants</span>
          </div>

          {/* Titre principal */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground mb-6 sm:mb-8 leading-[1.1]">
            <span className="block mb-2">Révolutionnez</span>
            <span className="block bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent mb-2">
              votre restaurant
            </span>
            <span className="block text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-muted-foreground">
              avec QUEROX
            </span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-base sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-12 font-light leading-relaxed px-4">
            La plateforme de gestion tout-en-un pour restaurants modernes : menus digitaux, 
            commandes, inventaire, comptabilité et marketing. Transformez votre façon de travailler.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12 sm:mb-16 px-4">
            <Button 
              size="lg" 
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 h-12 sm:h-14 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 shadow-xl shadow-primary/25 border-0 rounded-full font-semibold"
              onClick={handleGetStarted}
            >
              {user ? 'Accéder au dashboard' : 'Commencer maintenant'}
              <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 h-12 sm:h-14 border-2 border-border hover:border-border/60 bg-card/50 backdrop-blur-sm rounded-full font-semibold"
              onClick={handleViewDemo}
            >
              <Play className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
              Voir la démo
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 h-12 sm:h-14 border-2 border-orange-500 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 hover:text-orange-700 rounded-full font-semibold"
              onClick={() => navigate('/partner-signup')}
            >
              PARTENAIRE
            </Button>
          </div>
          
          {/* Garanties */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground px-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Configuration en 5 minutes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Support client inclus</span>
            </div>
            <div className="flex items-center space-x-2 hidden sm:flex">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Paiement sécurisé</span>
            </div>
          </div>
        </div>

        {/* Video/Mockup Section - Hidden on small screens */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-24 sm:translate-y-32 w-full max-w-5xl px-4 hidden md:block">
          <div className="relative">
            <div className="bg-card/10 backdrop-blur-xl border border-border rounded-2xl sm:rounded-3xl p-1 sm:p-2 shadow-2xl">
              <div className="bg-gradient-to-br from-card via-muted to-card rounded-xl sm:rounded-2xl overflow-hidden">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src="https://player.vimeo.com/video/1128155718"
                    title="Présentation QUEROX"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer pour l'image - Only on larger screens */}
      <div className="h-32 sm:h-48 md:h-64 bg-gradient-to-b from-background to-muted/30"></div>
    </>
  );
};

export default LandingHero;
