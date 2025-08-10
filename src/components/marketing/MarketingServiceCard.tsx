
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon, Clock, Euro, Star } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MarketingService {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  deliveryTime: string;
  price: string;
}

interface MarketingServiceCardProps {
  service: MarketingService;
  onSelect: () => void;
}

const MarketingServiceCard: React.FC<MarketingServiceCardProps> = ({ service, onSelect }) => {
  const IconComponent = service.icon;
  const isMobile = useIsMobile();

  return (
    <Card className="border-0 shadow-2xl shadow-gray-500/10 bg-white/95 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02] group overflow-hidden">
      <div className={`h-1 bg-gradient-to-r ${service.color}`}></div>
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2">
          <Star className="h-4 w-4 text-white" />
        </div>
      </div>
      <CardContent className={`p-6 sm:p-8 lg:p-10 relative ${isMobile ? 'space-y-6' : ''}`}>
        <div className={`flex ${isMobile ? 'flex-col space-y-6' : 'items-start space-x-8'}`}>
          <div className={`${isMobile ? 'self-center' : ''} relative`}>
            <div className={`p-4 sm:p-5 bg-gradient-to-br ${service.color} rounded-2xl sm:rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
              <IconComponent className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
          </div>
          <div className="flex-1">
            <h3 className={`text-xl sm:text-2xl font-black text-gray-900 mb-3 sm:mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:${service.color} transition-all duration-300 ${isMobile ? 'text-center' : ''}`}>
              {service.title}
            </h3>
            <p className={`text-gray-600 text-base mb-6 sm:mb-8 leading-relaxed ${isMobile ? 'text-center' : ''}`}>
              {service.description}
            </p>
            
            <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'justify-between items-center'} mb-6 sm:mb-8`}>
              <div className={`flex ${isMobile ? 'justify-center space-x-3' : 'items-center space-x-6'}`}>
                <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 px-3 sm:px-4 py-2 sm:py-3 rounded-full shadow-md">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  <span className="text-sm sm:text-base font-bold text-green-800">{service.deliveryTime}</span>
                </div>
                <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 px-3 sm:px-4 py-2 sm:py-3 rounded-full shadow-md">
                  <Euro className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <span className="text-sm sm:text-base font-bold text-blue-800">{service.price}</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={onSelect}
              className={`w-full bg-gradient-to-r ${service.color} hover:opacity-90 hover:scale-105 transition-all duration-300 font-black py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-3xl text-base sm:text-lg border-0 relative overflow-hidden group/button`}
            >
              <span className="relative z-10">Commander ce service</span>
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover/button:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketingServiceCard;
