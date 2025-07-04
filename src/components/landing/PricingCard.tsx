
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

interface PricingCardProps {
  plan: {
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    highlighted: boolean;
    trialText: string;
    cta: string;
    badge?: string;
  };
}

const PricingCard: React.FC<PricingCardProps> = ({ plan }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSelect = () => {
    if (plan.name === "LICENCE QUEROX") {
      // Contact pour licence
      window.location.href = "mailto:contact@querox.me?subject=Demande de licence QUEROX";
    } else if (plan.name === "Entreprise") {
      // Demo pour entreprise
      window.location.href = "mailto:contact@querox.me?subject=Demande de démo Entreprise";
    } else {
      // Essai gratuit pour les autres plans
      if (user) {
        navigate('/abonnement');
      } else {
        navigate('/auth');
      }
    }
  };

  return (
    <Card className={`relative ${plan.highlighted ? 'border-primary shadow-xl scale-105' : 'border-gray-200'} transition-all duration-300 hover:shadow-lg`}>
      {plan.badge && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-white px-4 py-1 font-semibold">
            {plan.badge}
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold text-primary">{plan.price}</span>
          {plan.period && <span className="text-gray-600 ml-1">{plan.period}</span>}
        </div>
        <CardDescription className="mt-2 text-sm">
          {plan.description}
        </CardDescription>
        
        {/* Badge d'essai gratuit */}
        <div className="mt-4">
          <div className="inline-flex items-center px-3 py-1 bg-green-50 border border-green-200 rounded-full text-green-700 text-xs font-medium">
            <Zap className="w-3 h-3 mr-1" />
            {plan.trialText}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          className={`w-full font-semibold ${
            plan.highlighted 
              ? 'bg-primary hover:bg-primary/90 text-white shadow-md' 
              : 'bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200'
          } transition-all duration-200 transform hover:scale-105`}
          onClick={handleSelect}
        >
          {plan.cta}
        </Button>
        
        {(plan.name === "Starter" || plan.name === "Professionnel") && (
          <p className="text-xs text-center text-gray-500 mt-3">
            Aucune carte bancaire requise pour l'essai
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PricingCard;
