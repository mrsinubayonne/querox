
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LandingNavigation from '../components/landing/LandingNavigation';
import SalesFunnelHero from '../components/landing/SalesFunnelHero';
import ProblemSolution from '../components/landing/ProblemSolution';
import SocialProof from '../components/landing/SocialProof';
import VideoDemo from '../components/landing/VideoDemo';
import HowItWorks from '../components/landing/HowItWorks';
import LandingFeatures from '../components/landing/LandingFeatures';
import LandingPricing from '../components/landing/LandingPricing';
import FAQ from '../components/landing/FAQ';
import FinalCTA from '../components/landing/FinalCTA';
import LandingFooter from '../components/landing/LandingFooter';
import { useUserProfiles } from '@/hooks/useUserProfiles';
import { useOutlets } from '@/hooks/useOutlets';

const Index: React.FC = () => {
  const { user, loading } = useAuth();
  const { selectedProfileId } = useUserProfiles();
  const { selectedOutletId } = useOutlets();
  const navigate = useNavigate();

  // Rediriger automatiquement les utilisateurs authentifiés vers leur flux
  useEffect(() => {
    if (!loading && user) {
      if (!selectedProfileId) {
        navigate('/select-profile', { replace: true });
      } else if (!selectedOutletId) {
        navigate('/select-outlet', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [loading, user, selectedProfileId, selectedOutletId, navigate]);

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

  // Afficher la landing page pour tous les utilisateurs
  return (
    <div className="min-h-screen w-full bg-white">
      <LandingNavigation />
      <main className="pt-16 lg:pt-20">
        <SalesFunnelHero />
        <ProblemSolution />
      <SocialProof />
      <VideoDemo />
      <HowItWorks />
      <LandingFeatures />
        <LandingPricing />
        <FAQ />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
};

export default Index;
