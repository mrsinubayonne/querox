import React, { useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import SubscriptionPopup from '@/components/SubscriptionPopup';
import { MessageCircle, HelpCircle, Video } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Support: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/242064563021', '_blank');
  };

  const handleYouTubeClick = () => {
    window.open('https://www.youtube.com/@querox-restaurant', '_blank');
  };

  const faqs = [
    {
      question: 'Comment créer un nouveau menu ?',
      answer: 'Allez dans la section "Menus" depuis le menu principal, puis cliquez sur "Créer un menu". Remplissez les informations de base comme le nom du menu (ex: Menu du Jour, Menu Végétarien), puis ajoutez vos catégories (Entrées, Plats, Desserts) et les articles avec leurs prix, descriptions et photos.'
    },
    {
      question: 'Comment générer un QR code pour mon menu ?',
      answer: 'Rendez-vous dans la section "QR Codes" du menu principal. Sélectionnez le menu que vous souhaitez partager, puis cliquez sur "Générer QR Code". Le QR code sera créé instantanément. Vous pouvez le télécharger en haute résolution, l\'imprimer et le placer sur vos tables, vitrines ou supports marketing. Vos clients pourront scanner le code avec leur smartphone pour accéder directement à votre menu en ligne.'
    },
    {
      question: 'Comment suivre mon inventaire ?',
      answer: 'La section "Inventaire" vous offre une gestion complète de vos stocks. Vous pouvez ajouter des produits avec leurs quantités, unités et seuils d\'alerte, suivre les mouvements d\'entrée et sortie, recevoir des alertes automatiques lorsque les stocks sont faibles, générer des rapports d\'inventaire, et gérer vos fournisseurs. Le système met à jour automatiquement les quantités lors des ventes.'
    },
    {
      question: 'Comment contacter le support ?',
      answer: 'Pour toute question ou problème, contactez-nous directement via WhatsApp au +242 05 010 3710. Notre équipe est disponible pour vous répondre rapidement. Vous pouvez également consulter nos tutoriels vidéo sur YouTube pour apprendre à utiliser toutes les fonctionnalités de la plateforme.'
    }
  ];

  return (
    <SubscriptionGuard>
      <div className="flex h-screen bg-gray-50">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Support & Aide</h1>
              <p className="text-gray-600 mt-1">Nous sommes là pour vous aider</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-8">
            {/* Contact WhatsApp */}
            <div className="mb-8">
              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="p-6 rounded-full bg-green-500">
                      <MessageCircle className="h-12 w-12 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Contactez-nous sur WhatsApp</h2>
                      <p className="text-gray-600 mb-4">Notre équipe est disponible pour répondre à toutes vos questions</p>
                      <p className="text-xl font-semibold text-green-600">+242 05 010 3710</p>
                    </div>
                    <Button 
                      onClick={handleWhatsAppClick}
                      className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 text-lg"
                      size="lg"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Ouvrir WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* YouTube Tutorials */}
            <div className="mb-8">
              <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="p-6 rounded-full bg-red-500">
                      <Video className="h-12 w-12 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Tutoriels Vidéo</h2>
                      <p className="text-gray-600 mb-4">Apprenez à utiliser Querox avec nos tutoriels détaillés</p>
                    </div>
                    <Button 
                      onClick={handleYouTubeClick}
                      className="bg-red-500 hover:bg-red-600 text-white px-8 py-6 text-lg"
                      size="lg"
                    >
                      <Video className="mr-2 h-5 w-5" />
                      Voir les tutoriels YouTube
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-6 w-6 text-blue-600" />
                  <CardTitle>Questions fréquentes</CardTitle>
                </div>
                <CardDescription>Trouvez rapidement des réponses à vos questions</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <SubscriptionPopup />
    </SubscriptionGuard>
  );
};

export default Support;
