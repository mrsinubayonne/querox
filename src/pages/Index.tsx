
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LandingNavigation from '../components/landing/LandingNavigation';
import LandingHero from '../components/landing/LandingHero';
import LandingFeatures from '../components/landing/LandingFeatures';
import LandingPricing from '../components/landing/LandingPricing';
import LandingFooter from '../components/landing/LandingFooter';

const Index: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si l'utilisateur est connecté et qu'on a fini de charger, rediriger vers le dashboard
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Afficher le loader pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Chargement...</h3>
            <p className="text-sm text-gray-600">Vérification de votre session</p>
          </div>
        </div>
      </div>
    );
  }

  // Afficher la landing page seulement si l'utilisateur n'est pas connecté
  if (!user) {
    return (
      <div className="min-h-screen w-full bg-white">
        <LandingNavigation />
        <main className="pt-16 lg:pt-20">
          <LandingHero />
          <LandingFeatures />
          <LandingPricing />
        </main>
        <LandingFooter />
      </div>
    );
  }

  // Ceci ne devrait pas arriver grâce au useEffect redirect, mais au cas où
  return null;
};

export default Index;
