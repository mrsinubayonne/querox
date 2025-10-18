import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, ArrowRight, TrendingUp, Users, Zap } from 'lucide-react';

const SalesFunnelHero: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      const pricingSection = document.querySelector('#pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,hsl(var(--primary)/0.1),transparent_50%)]"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-full px-4 py-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Plus de 500+ restaurants nous font confiance
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground leading-tight">
              Doublez votre chiffre d'affaires en{' '}
              <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                moins de 90 jours
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              La seule plateforme tout-en-un dont vous avez besoin pour gérer, automatiser 
              et développer votre restaurant. <span className="font-semibold text-foreground">Sans compétences techniques.</span>
            </p>

            {/* Benefits Checklist */}
            <div className="space-y-3">
              {[
                'Gagnez 4h par jour sur les tâches administratives',
                'Réduisez vos pertes de stocks de 40%',
                'Augmentez vos réservations de 65%'
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-base text-foreground font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg"
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:opacity-90 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-2xl hover:shadow-primary/50 transition-all duration-300 group"
              >
                Démarrer maintenant
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 font-semibold text-lg px-8 py-6 rounded-xl"
              >
                Voir comment ça marche
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 border-2 border-background"></div>
                  ))}
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  <span className="text-foreground font-bold">500+</span> restaurateurs satisfaits
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-muted-foreground">
                  <span className="text-foreground font-bold">+156%</span> de croissance moyenne
                </span>
              </div>
            </div>
          </div>

          {/* Right Content - Stats Cards */}
          <div className="hidden lg:grid grid-cols-2 gap-4 animate-fade-in">
            <div className="col-span-2 bg-gradient-to-br from-primary/10 to-purple-500/10 backdrop-blur-sm border border-primary/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-black text-foreground">+87%</p>
                  <p className="text-sm text-muted-foreground">Revenus moyens</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Augmentation en 6 mois</p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
              <Users className="h-8 w-8 text-primary mb-3" />
              <p className="text-2xl font-black text-foreground mb-1">15min</p>
              <p className="text-sm text-muted-foreground">Configuration complète</p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
              <Zap className="h-8 w-8 text-yellow-500 mb-3" />
              <p className="text-2xl font-black text-foreground mb-1">24/7</p>
              <p className="text-sm text-muted-foreground">Support expert</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SalesFunnelHero;
