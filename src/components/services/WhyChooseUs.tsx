
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, UserCheck, TrendingUp } from 'lucide-react';

const WhyChooseUs: React.FC = () => {
  return (
    <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm mb-8">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-black text-gray-900 mb-3">Pourquoi nos services ?</h3>
          <p className="text-lg text-gray-600">Des solutions adaptées aux besoins des restaurants</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Phone className="h-10 w-10 text-white" />
            </div>
            <h4 className="text-xl font-black mb-3">Service d'appel</h4>
            <p className="text-gray-600">Gestion professionnelle de vos appels et réservations</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <UserCheck className="h-10 w-10 text-white" />
            </div>
            <h4 className="text-xl font-black mb-3">Consulting</h4>
            <p className="text-gray-600">Conseils stratégiques pour optimiser votre restaurant</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <TrendingUp className="h-10 w-10 text-white" />
            </div>
            <h4 className="text-xl font-black mb-3">Résultats</h4>
            <p className="text-gray-600">Amélioration mesurable de vos performances</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhyChooseUs;
