import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Settings, Rocket, TrendingUp, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: "Inscrivez-vous en 2 min",
    description: "Créez votre compte gratuitement. Aucune carte bancaire requise pour tester.",
    duration: "2 minutes",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Settings,
    title: "Configurez votre restaurant",
    description: "Ajoutez vos menus, votre équipe et vos préférences. Notre assistant intelligent vous guide pas à pas.",
    duration: "10 minutes",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Rocket,
    title: "Lancez-vous",
    description: "Commencez immédiatement à recevoir des commandes et gérer votre établissement.",
    duration: "Instantané",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: TrendingUp,
    title: "Développez votre business",
    description: "Suivez vos performances en temps réel et optimisez continuellement grâce à nos insights.",
    duration: "En continu",
    color: "from-green-500 to-emerald-500"
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent text-sm font-semibold mb-4">
            SIMPLE ET RAPIDE
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-6">
            Démarrez en moins de 15 minutes
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Pas besoin de formation compliquée. Notre système intuitif vous permet de démarrer immédiatement.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-purple-600 to-pink-600 -translate-y-1/2 opacity-20"></div>

          <div className="grid lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="border-border bg-card hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full">
                  <CardContent className="p-6 space-y-4">
                    {/* Step Number */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {step.duration}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}>
                      <step.icon className="h-8 w-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>

                    {/* Arrow for desktop */}
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-8 -translate-y-1/2 z-10">
                        <ArrowRight className="h-6 w-6 text-primary" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 text-center space-y-6">
          <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/20 max-w-3xl mx-auto">
            <CardContent className="p-8">
              <p className="text-2xl font-bold text-foreground mb-4">
                🎁 Offre spéciale : Essai gratuit de 14 jours
              </p>
              <p className="text-muted-foreground mb-6">
                Testez toutes les fonctionnalités premium sans engagement. 
                Aucune carte bancaire requise.
              </p>
              <a 
                href="#pricing"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity"
              >
                Commencer mon essai gratuit
                <ArrowRight className="h-5 w-5" />
              </a>
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground">
            ✓ Configuration en 15 minutes • ✓ Support en français • ✓ Annulation possible à tout moment
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
