
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, CheckCircle, Zap } from "lucide-react";
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
    <section className="bg-gradient-to-br from-primary/10 via-white to-secondary/10 py-20 lg:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            
            {/* Badge d'essai gratuit */}
            <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-full text-green-700 text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Essai gratuit 3 jours - Sans engagement
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600 font-medium">4.9/5 - Plus de 1,500+ restaurants conquis</span>
            </div>
            
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl leading-tight">
              <span className="block">Transformez votre</span>
              <span className="block text-primary">restaurant</span>
              <span className="block">en machine à succès</span>
            </h1>
            
            <p className="mt-6 text-lg text-gray-600 sm:text-xl lg:text-lg xl:text-xl leading-relaxed">
              Découvrez pourquoi <strong>plus de 1,500 restaurateurs</strong> font confiance à QUEROX pour révolutionner leur business. 
              Menus QR, commandes en ligne, gestion intelligente - <em>tout en un</em>.
            </p>

            {/* Points de valeur clés */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-1">
              <div className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-sm font-medium">Configuration en moins de 5 minutes</span>
              </div>
              <div className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-sm font-medium">Support client 24/7 en français</span>
              </div>
              <div className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-sm font-medium">Augmentez vos ventes de 35% en moyenne</span>
              </div>
              <div className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-sm font-medium">Aucune commission sur vos ventes</span>
              </div>
            </div>
            
            <div className="mt-10 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="text-base px-8 py-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold shadow-lg transform hover:scale-105 transition-all duration-200" 
                  onClick={handleGetStarted}
                >
                  {user ? 'Accéder au dashboard' : '🚀 Commencer mon essai gratuit'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-base px-8 py-4 border-2 border-gray-300 hover:border-primary hover:text-primary transition-colors" 
                  onClick={handleViewDemo}
                >
                  Voir la démo
                </Button>
              </div>
              <div className="mt-4 text-center lg:text-left">
                <p className="text-sm text-gray-500 font-medium">
                  ✅ 3 jours gratuits • ✅ Aucune carte bancaire requise • ✅ Annulation à tout moment
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Rejoignez les restaurateurs qui ont déjà augmenté leur CA
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            {/* Testimonial card overlay */}
            <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-xs">
              <div className="flex items-center mb-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-700 font-medium">
                "QUEROX a révolutionné notre restaurant. +40% de commandes en 2 mois !"
              </p>
              <p className="text-xs text-gray-500 mt-1">- Marie L., Restaurant Le Bistrot</p>
            </div>

            <div className="relative mx-auto w-full rounded-lg shadow-2xl lg:max-w-md transform hover:scale-105 transition-transform duration-300">
              <div className="relative block w-full bg-white rounded-lg overflow-hidden border">
                <img
                  className="w-full h-80 object-cover"
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Interface moderne QUEROX"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-gray-800 font-bold text-lg">Interface moderne et intuitive</p>
                    <p className="text-gray-600 text-sm mt-1">Gérez tout depuis un seul endroit</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats card */}
            <div className="absolute bottom-4 right-4 z-10 bg-primary text-white rounded-lg shadow-lg p-4 max-w-xs">
              <div className="text-2xl font-bold">+35%</div>
              <p className="text-sm opacity-90">Augmentation moyenne du CA</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
