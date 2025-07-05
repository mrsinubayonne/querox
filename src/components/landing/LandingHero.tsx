
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, CheckCircle, Zap, TrendingUp, Users, Clock } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

const LandingHero: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const handleViewDemo = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-600 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          {/* Badge de notification */}
          <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-medium mb-8">
            <Zap className="w-4 h-4 mr-2 text-yellow-400" />
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent font-bold">
              NOUVEAU:
            </span>
            <span className="ml-2">Essai gratuit 3 jours - Sans engagement</span>
          </div>

          {/* Titre principal */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
            <span className="block">Transformez votre</span>
            <span className="block bg-gradient-to-r from-pink-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
              RESTAURANT
            </span>
            <span className="block">en machine à €€€</span>
          </h1>

          {/* Sous-titre */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
            La solution #1 qui fait exploser le chiffre d'affaires des restaurants.
            <br className="hidden md:block" />
            <span className="font-bold text-yellow-400">+40% de CA en moyenne</span> avec nos menus QR intelligents.
          </p>

          {/* Stats impressionnantes */}
          <div className="flex flex-wrap justify-center items-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">2,500+</div>
              <div className="text-white/80 text-sm">Restaurants conquis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">+40%</div>
              <div className="text-white/80 text-sm">CA moyen</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">5 min</div>
              <div className="text-white/80 text-sm">Configuration</div>
            </div>
          </div>

          {/* Points clés avec icônes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-white font-bold mb-2">Boost immédiat du CA</h3>
              <p className="text-white/80 text-sm">+40% de revenus en moyenne dès le premier mois</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-white font-bold mb-2">Clients plus satisfaits</h3>
              <p className="text-white/80 text-sm">Commande facile via QR, moins d'attente</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Clock className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-white font-bold mb-2">3h économisées/jour</h3>
              <p className="text-white/80 text-sm">Gestion automatisée, plus de temps pour vos clients</p>
            </div>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center mb-10">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="ml-3 text-white/90 font-medium">4.9/5 • 2,500+ avis clients</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="text-lg px-10 py-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl border-2 border-white/20" 
              onClick={handleGetStarted}
            >
              🚀 COMMENCER L'ESSAI GRATUIT
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-10 py-6 border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm rounded-2xl font-bold transition-all duration-300" 
              onClick={handleViewDemo}
            >
              Voir la démo en action
            </Button>
          </div>

          {/* Garanties */}
          <div className="text-center">
            <div className="inline-flex flex-wrap justify-center items-center gap-6 text-white/90 text-sm font-medium">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                <span>3 jours gratuits</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                <span>Aucune carte bancaire</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                <span>Annulation à tout moment</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                <span>Support 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial flottant */}
      <div className="absolute bottom-10 right-10 bg-white rounded-2xl shadow-2xl p-6 max-w-sm hidden lg:block">
        <div className="flex items-center mb-3">
          <img 
            className="w-12 h-12 rounded-full mr-4"
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
            alt="Chef testimonial"
          />
          <div>
            <div className="font-bold text-gray-900">Marc Dubois</div>
            <div className="text-sm text-gray-600">Restaurant Le Gourmet</div>
          </div>
        </div>
        <div className="flex text-yellow-400 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-current" />
          ))}
        </div>
        <p className="text-gray-700 text-sm">
          "QUEROX a révolutionné mon restaurant ! +45% de CA en 2 mois. Mes clients adorent commander via QR code."
        </p>
      </div>
    </section>
  );
};

export default LandingHero;
