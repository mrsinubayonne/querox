
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Play, CheckCircle } from "lucide-react";
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
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            {/* Badge */}
            <div className="flex items-center justify-center lg:justify-start mb-8">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full px-4 py-2 text-sm font-semibold shadow-sm">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span>4.9/5 • +1000 restaurants</span>
              </div>
            </div>
            
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 leading-tight mb-8">
              <span className="block">Votre restaurant</span>
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                100% digital
              </span>
              <span className="block text-4xl lg:text-5xl xl:text-6xl">en 7 jours</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
              La plateforme tout-en-un qui transforme votre restaurant : 
              <span className="font-semibold text-gray-900"> menus digitaux, site web, commandes en ligne, gestion complète.</span>
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {[
                "Menu QR Code en 5 min",
                "Site web en 1-3 jours",
                "Commandes automatisées",
                "Support 24/7 inclus"
              ].map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{benefit}</span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                onClick={handleGetStarted}
              >
                {user ? 'Accéder au dashboard' : 'Démarrer gratuitement'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-4 border-2 hover:bg-gray-50 group" 
                onClick={handleViewDemo}
              >
                <Play className="mr-2 h-5 w-5 group-hover:text-primary transition-colors" />
                Voir la démo
              </Button>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-center text-center">
                <div className="space-y-1">
                  <p className="text-green-800 font-bold text-lg">🎉 Offre de lancement limitée</p>
                  <p className="text-green-700 text-sm">
                    <span className="font-semibold">7 jours gratuits</span> • Aucun engagement • 
                    <span className="font-semibold"> Setup inclus</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 lg:mt-0 lg:col-span-6">
            <div className="relative">
              {/* Main Image */}
              <div className="relative mx-auto w-full max-w-lg">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white">
                  <img
                    className="w-full h-80 object-cover"
                    src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                    alt="Interface QUEROX moderne"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-white font-bold text-lg mb-1">Interface moderne & intuitive</p>
                    <p className="text-white/80 text-sm">Gérez tout depuis un tableau de bord unifié</p>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 animate-float">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Setup rapide</p>
                    <p className="text-xs text-gray-600">5 min chrono</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 animate-float" style={{animationDelay: '1s'}}>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-white fill-current" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">+1000 clients</p>
                    <p className="text-xs text-gray-600">Satisfaction 4.9/5</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .bg-grid-pattern {
          background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </section>
  );
};

export default LandingHero;
