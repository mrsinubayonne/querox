
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon, Clock, Euro } from 'lucide-react';
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
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group overflow-hidden">
      <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>
      <CardContent className={`p-4 sm:p-6 lg:p-8 ${isMobile ? 'space-y-4' : ''}`}>
        <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-start space-x-6'}`}>
          <div className={`${isMobile ? 'self-center' : ''} p-3 sm:p-4 bg-gradient-to-br ${service.color} rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className={`text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-purple-700 transition-colors ${isMobile ? 'text-center' : ''}`}>
              {service.title}
            </h3>
            <p className={`text-gray-600 text-sm mb-4 sm:mb-6 leading-relaxed ${isMobile ? 'text-center' : ''}`}>
              {service.description}
            </p>
            
            <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'justify-between items-center'} mb-4 sm:mb-6`}>
              <div className={`flex ${isMobile ? 'justify-center space-x-2' : 'items-center space-x-4'}`}>
                <div className="flex items-center space-x-2 bg-green-50 px-2 sm:px-3 py-1 sm:py-2 rounded-full">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                  <span className="text-xs sm:text-sm font-medium text-green-800">{service.deliveryTime}</span>
                </div>
                <div className="flex items-center space-x-2 bg-blue-50 px-2 sm:px-3 py-1 sm:py-2 rounded-full">
                  <Euro className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                  <span className="text-xs sm:text-sm font-medium text-blue-800">{service.price}</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={onSelect}
              className={`w-full bg-gradient-to-r ${service.color} hover:opacity-90 transition-all duration-300 font-semibold py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl text-sm sm:text-base`}
            >
              Commander ce service
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketingServiceCard;
