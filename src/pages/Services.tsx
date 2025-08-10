
import React, { useState } from 'react';
import ModernSidebar from '../components/ModernSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { Headphones, CheckCircle } from 'lucide-react';
import ConsultingModal from '@/components/marketing/ConsultingModal';
import ServiceAppelModal from '@/components/marketing/ServiceAppelModal';
import SubscriptionPopup from '@/components/SubscriptionPopup';
import { useIsMobile } from '@/hooks/use-mobile';
import ServicesHero from '@/components/services/ServicesHero';
import WhyChooseUs from '@/components/services/WhyChooseUs';
import CallServiceSection from '@/components/services/CallServiceSection';
import ConsultingSection from '@/components/services/ConsultingSection';
import GuaranteesTestimonials from '@/components/services/GuaranteesTestimonials';

const Services: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const openModal = (serviceId: string) => {
    setActiveModal(serviceId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <SubscriptionGuard feature="les services professionnels">
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 px-8 py-6 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-6">
                <div className="p-3 bg-gradient-to-br from-green-600 via-purple-600 to-indigo-600 rounded-xl shadow-lg">
                  <Headphones className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-green-800 to-purple-800 bg-clip-text text-transparent">
                    Services Professionnels
                  </h1>
                  <p className="text-lg text-gray-600 font-medium">
                    Services d'appel et consulting pour restaurants
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-6 py-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-semibold text-green-800">Services Expert</span>
                </div>
              </div>
            </div>
          </header>

          <main className="p-8 space-y-8">
            <div className="max-w-7xl mx-auto">
              {/* Hero Section */}
              <ServicesHero />

              {/* Why Choose Us Section */}
              <WhyChooseUs />

              {/* Call Service Section */}
              <CallServiceSection onOpenModal={openModal} />

              {/* Consulting Section */}
              <ConsultingSection onOpenModal={openModal} />

              {/* Guarantees and Testimonials */}
              <GuaranteesTestimonials />
            </div>
          </main>
        </div>

        {/* Modals */}
        {activeModal === 'service-appel' && (
          <ServiceAppelModal onClose={closeModal} />
        )}
        {activeModal === 'consulting' && (
          <ConsultingModal onClose={closeModal} />
        )}

        <SubscriptionPopup />
      </div>
    </SubscriptionGuard>
  );
};

export default Services;
