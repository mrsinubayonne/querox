
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Clock, Users, Star } from 'lucide-react';

const GuaranteesTestimonials: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
      <Card className="border-0 shadow-lg bg-white/95">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-black text-center">Nos Garanties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Award className="h-7 w-7 text-white" />
            </div>
            <div>
              <h4 className="font-black text-green-800 text-lg">Excellence Garantie</h4>
              <p className="text-gray-600">Services de qualité supérieure</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="h-7 w-7 text-white" />
            </div>
            <div>
              <h4 className="font-black text-blue-800 text-lg">Disponibilité 24/7</h4>
              <p className="text-gray-600">Support continu selon vos besoins</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h4 className="font-black text-purple-800 text-lg">Équipe Dédiée</h4>
              <p className="text-gray-600">Professionnels expérimentés</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/95">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-black text-center">Témoignages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-black">
                PM
              </div>
              <div className="ml-4">
                <h4 className="font-black">Patrice Mobutu</h4>
                <p className="text-gray-600 text-sm">Restaurant Le Gourmet</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-700 italic">"Le service d'appel a révolutionné notre gestion des réservations !"</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-black">
                FB
              </div>
              <div className="ml-4">
                <h4 className="font-black">Fatima Benali</h4>
                <p className="text-gray-600 text-sm">Bistrot moderne</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-700 italic">"Le consulting nous a aidés à optimiser nos coûts de 25% !"</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuaranteesTestimonials;
