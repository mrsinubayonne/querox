import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const OnboardingTour: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [hasSeenTour, setHasSeenTour] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;

      // Only run on dashboard or protected routes, NOT on landing page
      if (location.pathname === '/' || location.pathname === '/auth' || location.pathname.startsWith('/team')) {
        return;
      }

      // Vérifier si l'utilisateur a déjà vu le tour
      const seenTour = localStorage.getItem(`querox_onboarding_${user.id}`);
      
      if (!seenTour && location.pathname === '/dashboard') {
        setHasSeenTour(false);
        setTimeout(() => startTour(), 1500); // Démarrer après 1.5 secondes
      }
    };

    checkOnboardingStatus();
  }, [user, location.pathname]);

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: 'Suivant →',
      prevBtnText: '← Précédent',
      doneBtnText: '✓ Terminer',
      progressText: '{{current}} / {{total}}',
      popoverClass: 'querox-tour-popover',
      overlayColor: 'rgba(0, 0, 0, 0.85)',
      smoothScroll: true,
      onDestroyStarted: () => {
        // Marquer le tour comme terminé
        if (user) {
          localStorage.setItem(`querox_onboarding_${user.id}`, 'true');
        }
        driverObj.destroy();
      },
      steps: [
        {
          popover: {
            title: '🎉 Bienvenue sur QUEROX !',
            description: 'Votre solution complète de gestion de restaurant. Découvrons ensemble toutes les fonctionnalités qui vont transformer votre business ! 🚀',
          }
        },
        {
          element: '[data-tour="dashboard"]',
          popover: {
            title: '📊 Tableau de Bord',
            description: 'Visualisez vos statistiques de vente, revenus et commandes en temps réel. Toutes vos données importantes au même endroit !',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="menus"]',
          popover: {
            title: '🍽️ Gestion des Menus',
            description: 'Créez et gérez vos menus, catégories et plats. Ajoutez des images, des descriptions et des prix facilement. Tout pour séduire vos clients !',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="orders"]',
          popover: {
            title: '📦 Commandes',
            description: 'Gérez toutes vos commandes en un seul endroit. Suivez leur statut et progression en temps réel, de la commande à la livraison !',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="inventory"]',
          popover: {
            title: '📦 Inventaire',
            description: 'Gérez votre stock intelligemment, suivez les approvisionnements et évitez les ruptures avec des alertes automatiques. Tout sous contrôle !',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="invoices"]',
          popover: {
            title: '🧾 Factures',
            description: 'Créez et gérez vos factures professionnelles. Suivez les paiements et exportez en PDF en un clic. L\'inventaire se met à jour automatiquement !',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="team"]',
          popover: {
            title: '👥 Gestion d\'Équipe',
            description: 'Invitez des membres d\'équipe par email avec différents rôles : manager, serveur, caissier, cuisinier. Collaborez efficacement !',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="accounting"]',
          popover: {
            title: '💼 Comptabilité',
            description: 'Gérez vos transactions, générez des rapports financiers détaillés et suivez votre trésorerie. La santé financière de votre restaurant en temps réel !',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="settings"]',
          popover: {
            title: '⚙️ Paramètres',
            description: 'Personnalisez votre profil, gérez vos points de vente et configurez toutes vos préférences. Adaptez QUEROX à vos besoins !',
            side: 'right',
            align: 'start'
          }
        },
        {
          popover: {
            title: '🚀 Vous êtes prêt !',
            description: 'Explorez QUEROX à votre rythme et découvrez toute sa puissance. Vous pouvez relancer ce tour à tout moment depuis les paramètres. Bonne gestion ! 💪',
          }
        }
      ]
    });

    driverObj.drive();
  };

  // Fonction pour relancer le tour manuellement
  const restartTour = () => {
    startTour();
  };

  // Exposer la fonction globalement pour pouvoir la déclencher depuis les paramètres
  useEffect(() => {
    (window as any).startQueroxTour = startTour;
    return () => {
      delete (window as any).startQueroxTour;
    };
  }, [user]);

  return null;
};

export default OnboardingTour;
