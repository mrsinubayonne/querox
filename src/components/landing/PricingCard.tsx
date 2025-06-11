
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Plan } from './pricingData';
import { useAuth } from '@/contexts/AuthContext';

interface PricingCardProps {
  plan: Plan;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/menus');
    } else {
      navigate('/auth');
    }
  };

  const getPlacesBadgeColor = (places: number) => {
    if (places <= 10) return "bg-gradient-to-r from-red-500 to-pink-500 text-white border-0";
    if (places <= 30) return "bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0";
    return "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0";
  };

  return (
    <Card 
      className={`relative ${plan.badge ? 'border-primary shadow-lg scale-105' : 'border-gray-200'} hover:shadow-xl transition-all duration-300`}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-white px-4 py-1">
            {plan.badge}
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-gray-900">
          {plan.name}
        </CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-extrabold text-gray-900">
            {plan.price}
          </span>
          <span className="text-lg text-gray-600 ml-1">
            {plan.period}
          </span>
        </div>
        
        <p className="mt-2 text-gray-600">
          {plan.description}
        </p>
        
        {/* Places disponibles avec couleurs attractives */}
        <div className="mt-3">
          <Badge 
            className={getPlacesBadgeColor(plan.availablePlaces)}
          >
            {plan.availablePlaces} places disponibles
          </Badge>
          {plan.closingSoon && (
            <div className="mt-2">
              <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white text-xs animate-pulse">
                URGENT
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ul className="space-y-3 mb-8">
          {plan.features.map((feature, featureIndex) => (
            <li key={featureIndex} className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          className={`w-full ${plan.badge ? 'bg-primary hover:bg-primary/90' : ''}`}
          variant={plan.badge ? 'default' : 'outline'}
          size="lg"
          onClick={handleGetStarted}
        >
          {user ? 'Accéder au dashboard' : 'Commencer maintenant'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PricingCard;
