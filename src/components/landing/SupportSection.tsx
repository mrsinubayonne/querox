import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MessageSquare, Headphones, Clock, MapPin } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const SupportSection: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message envoyé !",
      description: "Notre équipe vous répondra dans les plus brefs délais.",
    });
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      description: 'contact@querox.me',
      action: 'Envoyer un email'
    },
    {
      icon: Phone,
      title: 'Téléphone',
      description: '+241 XX XX XX XX',
      action: 'Appeler maintenant'
    },
    {
      icon: MessageSquare,
      title: 'Chat en direct',
      description: 'Disponible 24/7',
      action: 'Démarrer le chat'
    }
  ];

  return (
    <section id="support" className="py-16 sm:py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--primary))_0.05,transparent)]"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Headphones className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Support client</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-black text-foreground mb-4">
            Nous sommes là pour vous aider
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Notre équipe d'experts est disponible pour répondre à toutes vos questions et vous accompagner dans votre réussite.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left - Contact Methods */}
          <div className="space-y-8">
            <div className="grid gap-6">
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <div key={index} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground mb-1">
                          {method.title}
                        </h3>
                        <p className="text-muted-foreground mb-3">
                          {method.description}
                        </p>
                        <Button variant="outline" size="sm">
                          {method.action}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Additional Info */}
            <div className="bg-gradient-to-br from-primary/5 to-purple-600/5 border border-primary/20 rounded-xl p-6 space-y-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Horaires d'ouverture</p>
                  <p className="text-sm text-muted-foreground">Lundi - Vendredi: 8h00 - 18h00</p>
                  <p className="text-sm text-muted-foreground">Samedi: 9h00 - 15h00</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Adresse</p>
                  <p className="text-sm text-muted-foreground">Libreville, Gabon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Contact Form */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Envoyez-nous un message
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="support-name">Nom complet *</Label>
                <Input
                  id="support-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Votre nom"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-email">Email *</Label>
                <Input
                  id="support-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-subject">Sujet *</Label>
                <Input
                  id="support-subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Comment pouvons-nous vous aider ?"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-message">Message *</Label>
                <Textarea
                  id="support-message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Décrivez votre demande en détail..."
                  rows={6}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 h-12 text-base font-semibold">
                Envoyer le message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportSection;
