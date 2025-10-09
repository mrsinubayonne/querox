import React, { useState } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import SubscriptionPopup from '@/components/SubscriptionPopup';
import { MessageSquare, Phone, Mail, Clock, Send, HelpCircle, Book, Video, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Support: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    priority: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Ticket créé",
      description: "Votre demande a été envoyée. Notre équipe vous répondra dans les plus brefs délais.",
    });
    setFormData({ subject: '', category: '', priority: '', message: '' });
  };

  const contactMethods = [
    {
      icon: MessageSquare,
      title: 'Chat en direct',
      description: 'Discutez avec notre équipe',
      action: 'Démarrer le chat',
      color: 'blue',
      available: 'Disponible maintenant'
    },
    {
      icon: Phone,
      title: 'Téléphone',
      description: '+33 1 23 45 67 89',
      action: 'Appeler',
      color: 'green',
      available: 'Lun-Ven 9h-18h'
    },
    {
      icon: Mail,
      title: 'Email',
      description: 'support@querox.com',
      action: 'Envoyer un email',
      color: 'purple',
      available: 'Réponse sous 24h'
    }
  ];

  const resources = [
    {
      icon: Book,
      title: 'Documentation',
      description: 'Guides et tutoriels complets',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Video,
      title: 'Vidéos tutorielles',
      description: 'Apprenez en vidéo',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: FileText,
      title: 'Base de connaissances',
      description: 'Réponses aux questions fréquentes',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const faqs = [
    {
      question: 'Comment créer un nouveau menu ?',
      answer: 'Allez dans la section "Menus" depuis le menu principal, puis cliquez sur "Créer un menu". Remplissez les informations de base comme le nom du menu, puis ajoutez vos catégories et articles.'
    },
    {
      question: 'Comment générer un QR code pour mon menu ?',
      answer: 'Dans la section "QR Codes", sélectionnez le menu pour lequel vous souhaitez créer un QR code, puis cliquez sur "Générer QR Code". Vous pourrez ensuite le télécharger et l\'imprimer.'
    },
    {
      question: 'Comment gérer les réservations ?',
      answer: 'Accédez à la section "Réservations" où vous pourrez voir toutes vos réservations, en créer de nouvelles, modifier les existantes et envoyer des confirmations aux clients.'
    },
    {
      question: 'Comment suivre mon inventaire ?',
      answer: 'La section "Inventaire" vous permet de gérer vos stocks, d\'ajouter des produits, de suivre les mouvements et de recevoir des alertes pour les stocks faibles.'
    },
    {
      question: 'Puis-je personnaliser mon site web ?',
      answer: 'Oui, dans la section "Site Web", vous pouvez personnaliser le design, les couleurs, ajouter vos images et modifier le contenu de votre site vitrine.'
    },
    {
      question: 'Comment contacter le support en urgence ?',
      answer: 'Pour les urgences, appelez directement notre ligne support au +33 1 23 45 67 89 (disponible 24/7 pour les abonnements Premium) ou utilisez le chat en direct.'
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
            {/* Contact Methods */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {contactMethods.map((method, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className={`p-4 rounded-full bg-${method.color}-100`}>
                        <method.icon className={`h-8 w-8 text-${method.color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{method.title}</h3>
                        <p className="text-sm text-gray-600 mb-1">{method.description}</p>
                        <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-3">
                          <Clock className="h-3 w-3" />
                          <span>{method.available}</span>
                        </div>
                      </div>
                      <Button className="w-full" variant="outline">
                        {method.action}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Support Ticket Form */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Créer un ticket de support</CardTitle>
                <CardDescription>Décrivez votre problème et nous vous répondrons rapidement</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Sujet</Label>
                      <Input
                        id="subject"
                        placeholder="Décrivez brièvement votre problème"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Catégorie</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technique">Problème technique</SelectItem>
                          <SelectItem value="facturation">Facturation</SelectItem>
                          <SelectItem value="fonctionnalite">Demande de fonctionnalité</SelectItem>
                          <SelectItem value="formation">Formation</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priorité</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une priorité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Basse - Peut attendre</SelectItem>
                        <SelectItem value="medium">Moyenne - Important</SelectItem>
                        <SelectItem value="high">Haute - Urgent</SelectItem>
                        <SelectItem value="critical">Critique - Bloquant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Description détaillée</Label>
                    <Textarea
                      id="message"
                      placeholder="Décrivez votre problème en détail..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer le ticket
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Resources */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ressources utiles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {resources.map((resource, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${resource.color}`}>
                          <resource.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                          <p className="text-sm text-gray-600">{resource.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
