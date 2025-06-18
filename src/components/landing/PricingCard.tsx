
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
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
  const { createPayment, loading } = useSubscription();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

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
      console.log('🔄 Appel de createPayment...');
      const paymentData = await createPayment(plan.tier, 1000);
      console.log('📋 Données de paiement reçues:', paymentData);
      
      if (paymentData?.payment_url) {
        console.log('✅ URL de paiement trouvée:', paymentData.payment_url);
        console.log('🌐 Redirection vers Lygos...');
        window.location.href = paymentData.payment_url;
      } else {
        console.log('❌ Aucune URL de paiement dans la réponse');
        console.log('📄 Réponse complète:', JSON.stringify(paymentData, null, 2));
        toast({
          title: "Erreur",
          description: "Impossible de créer le lien de paiement",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('💥 Erreur lors du paiement:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du paiement",
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
        
        <div className="mt-3">
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
            Mode Test - 1000 FCFA
          </span>
        </div>
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
          disabled={loading || processing}
          variant={plan.popular ? "default" : "outline"}
        >
          {processing ? 'Redirection...' : `${plan.cta} - Test 1000 FCFA`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PricingCard;
