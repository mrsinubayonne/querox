
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
  tier: string;
}

interface PricingCardProps {
  plan: PricingPlan;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const getPaymentUrl = (tier: string) => {
    const urls = {
      starter: 'https://querox.mychariow.com/prd_fbf5sx/checkout',
      premium: 'https://querox.mychariow.com/prd_aba7bf/checkout',
      pro: 'https://querox.mychariow.com/prd_idfv3d/checkout'
    };
    return urls[tier as keyof typeof urls];
  };

  const handleSubscribe = async () => {
    console.log('🚀 Bouton cliqué - Début du processus de paiement');
    console.log('👤 Utilisateur connecté:', !!user);
    console.log('📦 Plan sélectionné:', plan.tier);

    if (!user) {
      console.log('❌ Utilisateur non connecté - redirection vers auth');
      window.location.href = '/auth';
      return;
    }

    setProcessing(true);
    console.log('⏳ Processing activé');

    try {
      const paymentUrl = getPaymentUrl(plan.tier);
      
      if (paymentUrl) {
        console.log('✅ URL de paiement trouvée:', paymentUrl);
        console.log('🌐 Redirection vers:', paymentUrl);
        window.location.href = paymentUrl;
      } else {
        console.log('❌ Aucune URL de paiement trouvée pour le tier:', plan.tier);
        toast({
          title: "Erreur",
          description: "URL de paiement non configurée pour ce plan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('💥 Erreur lors du paiement:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la redirection",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      console.log('🏁 Processing désactivé');
    }
  };

  return (
    <Card className={`relative ${plan.popular ? 'border-2 border-blue-500 shadow-lg scale-105' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Le plus populaire
          </span>
        </div>
      )}
      
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">{plan.price}</span>
          <span className="text-gray-600 ml-2">{plan.period}</span>
        </div>
        <p className="text-gray-600 mt-2">{plan.description}</p>
      </CardHeader>
      
      <CardContent>
        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          className="w-full" 
          onClick={handleSubscribe}
          disabled={processing}
          variant={plan.popular ? "default" : "outline"}
        >
          {processing ? 'Redirection...' : plan.cta}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PricingCard;
