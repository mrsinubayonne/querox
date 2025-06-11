
import React from 'react';
import LandingNavigation from '../components/landing/LandingNavigation';
import LandingHero from '../components/landing/LandingHero';
import LandingFeatures from '../components/landing/LandingFeatures';
import LandingPricing from '../components/landing/LandingPricing';
import LandingFooter from '../components/landing/LandingFooter';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-white">
      <LandingNavigation />
      <LandingHero />
      <LandingFeatures />
      <LandingPricing />
      <LandingFooter />
    </div>
  );
};

export default Index;
