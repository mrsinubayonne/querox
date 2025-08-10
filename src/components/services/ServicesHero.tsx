
import React from 'react';
import { Star } from 'lucide-react';

const ServicesHero: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-green-600 via-purple-600 to-indigo-600 rounded-3xl p-8 lg:p-12 text-white shadow-2xl mb-8">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Star className="h-5 w-5 text-yellow-300" />
            <span className="text-lg font-semibold">Services Premium</span>
          </div>
          <h2 className="text-4xl font-black mb-4">Solutions professionnelles sur mesure</h2>
          <p className="text-xl opacity-90 mb-6">
            Optimisez votre restaurant avec nos services experts
          </p>
        </div>
        <div className="hidden lg:flex space-x-8">
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="text-3xl font-black text-yellow-300">24/7</div>
            <div className="text-sm opacity-90">Disponible</div>
          </div>
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="text-3xl font-black text-green-300">+30%</div>
            <div className="text-sm opacity-90">Efficacité</div>
          </div>
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="text-3xl font-black text-blue-300">Expert</div>
            <div className="text-sm opacity-90">Conseil</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesHero;
