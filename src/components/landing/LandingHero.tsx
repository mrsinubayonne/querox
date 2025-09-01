
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
      navigate('/auth');
    }
  };

  const handleViewDemo = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Hero Principal */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.05),transparent)] pointer-events-none"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge de rating */}
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-full px-6 py-3 mb-8 shadow-lg">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">4.9/5 • Plus de 1000+ restaurants</span>
          </div>

          {/* Titre principal */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 mb-8 leading-[1.1]">
            <span className="block mb-2">Gérez votre</span>
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              restaurant
            </span>
            <span className="block text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-600">
              en toute simplicité
            </span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-xl sm:text-2xl text-gray-600 mb-12 font-light leading-relaxed">
            QUEROX révolutionne la gestion de votre restaurant avec une plateforme tout-en-un : 
            menus, réservations, inventaire, comptabilité, marketing et bien plus.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <Button 
              size="lg" 
              className="text-lg px-10 py-4 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl shadow-blue-500/25 border-0 rounded-full font-semibold"
              onClick={handleGetStarted}
            >
              {user ? 'Accéder au dashboard' : 'Essai Gratuit 7 Jours'}
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-10 py-4 h-14 border-2 border-gray-300 hover:border-gray-400 bg-white/50 backdrop-blur-sm rounded-full font-semibold"
              onClick={handleViewDemo}
            >
              <Play className="mr-3 h-5 w-5" />
              Voir la démo
            </Button>
          </div>
          
          {/* Garanties */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>7 jours d'essai gratuit</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Aucune carte bancaire requise</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Annulation à tout moment</span>
            </div>
          </div>
        </div>

        {/* Image/Mockup Section */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-32 w-full max-w-5xl px-4">
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-2 shadow-2xl">
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden">
                <img
                  className="w-full h-[400px] sm:h-[500px] lg:h-[600px] object-cover opacity-90"
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                  alt="Interface QUEROX - Tableau de bord moderne"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer pour l'image */}
      <div className="h-64 bg-gradient-to-b from-slate-50 to-white"></div>
    </>
  );
};

export default LandingHero;
