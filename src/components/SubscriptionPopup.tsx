import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Crown, Calendar, TrendingUp } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

const SubscriptionPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { subscription, daysRemaining, isSubscriptionActive } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    // Ne pas afficher le popup si:
    // - L'utilisateur l'a déjà fermé aujourd'hui
    // - L'abonnement n'est pas actif
    // - L'utilisateur a un plan Licence
    // - Il reste plus de 5 jours
    if (isDismissed || !isSubscriptionActive || subscription?.subscription_tier === 'licence') {
      return;
    }

    // Vérifier si on a déjà affiché le popup aujourd'hui
    const lastShown = localStorage.getItem('subscription_popup_last_shown');
    const today = new Date().toDateString();
    
    if (lastShown === today) {
      return;
    }

    // Afficher uniquement si 5 jours ou moins
    if (daysRemaining !== null && daysRemaining <= 5 && daysRemaining > 0) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        localStorage.setItem('subscription_popup_last_shown', today);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isDismissed, isSubscriptionActive, subscription?.subscription_tier, daysRemaining]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  const handleUpgrade = () => {
    navigate('/abonnement');
    setIsVisible(false);
    setIsDismissed(true);
  };

  const getUpgradeInfo = () => {
    const tier = subscription?.subscription_tier;
    
    switch (tier) {
      case 'trial':
      case 'starter':
        return {
          currentPlan: tier === 'trial' ? 'Essai gratuit' : 'Starter',
          targetPlan: 'Professionnel',
          benefits: [
            'Catégories illimitées',
            'Gestion des stocks',
            'Site web personnalisé',
            'Support prioritaire'
          ],
          color: 'from-blue-600 to-purple-600'
        };
      case 'premium':
        return {
          currentPlan: 'Professionnel',
          targetPlan: 'Entreprise',
          benefits: [
            'Multi-établissements',
            'API personnalisée',
            'Formations personnalisées',
            'Support dédié 24/7'
          ],
          color: 'from-purple-600 to-pink-600'
        };
      case 'pro':
        return {
          currentPlan: 'Entreprise',
          targetPlan: 'Licence QUEROX',
          benefits: [
            'Licence perpétuelle',
            'Installation sur vos serveurs',
            'Personnalisation complète',
            'Pas d\'abonnement mensuel'
          ],
          color: 'from-yellow-600 to-orange-600'
        };
      default:
        return null;
    }
  };

  const upgradeInfo = getUpgradeInfo();

  if (!isVisible || !upgradeInfo || !subscription) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-bottom-4 duration-500">
      <Card className="w-80 p-4 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 bg-gradient-to-r ${upgradeInfo.color} rounded-lg`}>
            <Crown className="h-5 w-5 text-white" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-6 w-6 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900">
              Passez au plan {upgradeInfo.targetPlan}
            </h3>
            <p className="text-sm text-gray-600">
              Plan actuel : {upgradeInfo.currentPlan}
            </p>
          </div>

          {daysRemaining !== null && daysRemaining > 0 && (
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-gray-600">
                {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} restant{daysRemaining > 1 ? 's' : ''}
              </span>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Débloquez ces fonctionnalités :
            </p>
            <ul className="space-y-1">
              {upgradeInfo.benefits.slice(0, 2).map((benefit, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            onClick={handleUpgrade}
            className={`w-full bg-gradient-to-r ${upgradeInfo.color} hover:opacity-90 transition-opacity`}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Mettre à niveau
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Annulation à tout moment
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SubscriptionPopup;