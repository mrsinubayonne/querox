
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
    // If user is authenticated and we're not loading, redirect to dashboard
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Only show landing page if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen w-full bg-white">
        <LandingNavigation />
        <LandingHero />
        <LandingFeatures />
        <LandingPricing />
        <LandingFooter />
      </div>
    );
  }

  // This shouldn't happen due to the useEffect redirect, but just in case
  return null;
};

export default Index;
