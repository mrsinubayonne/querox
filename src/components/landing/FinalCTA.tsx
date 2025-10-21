import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Clock, Zap } from 'lucide-react';

const FinalCTA: React.FC = () => {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-primary via-purple-600 to-pink-600 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Urgency Badge */}
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
          <Clock className="h-4 w-4 animate-pulse" />
          <span className="text-sm font-semibold">
            Seulement 7 places disponibles ce mois-ci
          </span>
        </div>

        {/* Main Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-6 leading-tight">
          Prêt à transformer votre restaurant ?
        </h2>
        
        <p className="text-xl sm:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
          Rejoignez les 500+ restaurateurs qui ont déjà multiplié leurs revenus avec QUEROX
        </p>

        {/* Benefits List */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
          {[
            "Accès immédiat",
            "Paiement sécurisé",
            "Configuration en 15min"
          ].map((benefit, index) => (
            <div key={index} className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">{benefit}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Button 
            size="lg"
            onClick={() => document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-10 py-7 rounded-xl shadow-2xl group"
          >
            <Zap className="mr-2 h-5 w-5" />
            Commencer maintenant
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <p className="text-sm opacity-75">
          ⚡ Activation instantanée • 🔒 Paiement sécurisé • 🎁 Bonus exclusifs inclus
        </p>

        {/* Social Proof */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full bg-white/20 border-2 border-white backdrop-blur-sm"></div>
            ))}
          </div>
          <div className="text-left sm:text-left">
            <p className="font-bold text-lg">500+ restaurateurs</p>
            <p className="text-sm opacity-75">ont rejoint cette année</p>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="mt-16 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 max-w-2xl mx-auto">
          <p className="text-lg font-bold mb-2">💰 Garantie satisfait ou remboursé 30 jours</p>
          <p className="text-sm opacity-90">
            Si vous n'êtes pas satisfait, nous vous remboursons intégralement. Sans questions posées.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
