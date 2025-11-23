import React, { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const OnboardingTour: React.FC = () => {
  const { user } = useAuth();
  const [hasSeenTour, setHasSeenTour] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;

      // Vérifier si l'utilisateur a déjà vu le tour
      const seenTour = localStorage.getItem(`querox_onboarding_${user.id}`);
      
      if (!seenTour) {
        setHasSeenTour(false);
        setTimeout(() => startTour(), 1000); // Démarrer après 1 seconde
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: 'Suivant',
      prevBtnText: 'Précédent',
      doneBtnText: 'Terminer',
      progressText: '{{current}} sur {{total}}',
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
            title: 'Bienvenue sur QUEROX ! 🎉',
            description: 'Laissez-nous vous faire découvrir les fonctionnalités principales de votre plateforme de gestion restaurant.'
          }
        },
        {
          element: '[data-tour="dashboard"]',
          popover: {
            title: 'Tableau de bord 📊',
            description: 'Consultez vos statistiques de vente, revenus et performances en temps réel.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="menus"]',
          popover: {
            title: 'Gestion des menus 🍽️',
            description: 'Créez et gérez vos menus, catégories et plats. Ajoutez des photos et des descriptions.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="orders"]',
          popover: {
            title: 'Commandes 📝',
            description: 'Suivez toutes vos commandes en temps réel : en attente, en préparation, livrées.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="inventory"]',
          popover: {
            title: 'Inventaire 📦',
            description: 'Gérez votre stock, suivez les approvisionnements et recevez des alertes de réapprovisionnement.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="invoices"]',
          popover: {
            title: 'Factures 💰',
            description: 'Créez, gérez et suivez vos factures. Marquez-les comme payées pour mettre à jour automatiquement votre inventaire.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="team"]',
          popover: {
            title: 'Gestion d\'équipe 👥',
            description: 'Invitez des membres d\'équipe avec différents rôles : manager, serveur, caissier, cuisinier.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="accounting"]',
          popover: {
            title: 'Comptabilité 💼',
            description: 'Gérez vos transactions, générez des rapports financiers et suivez votre trésorerie.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="settings"]',
          popover: {
            title: 'Paramètres ⚙️',
            description: 'Personnalisez votre profil, gérez vos points de vente et configurez vos préférences.',
            side: 'right',
            align: 'start'
          }
        },
        {
          popover: {
            title: 'Vous êtes prêt ! 🚀',
            description: 'Explorez QUEROX à votre rythme. Vous pouvez relancer ce tour à tout moment depuis les paramètres.'
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
