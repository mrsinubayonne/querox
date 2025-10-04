import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Users, CheckCircle2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const ReservationSection: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '2'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Demande reçue !",
      description: "Nous vous contacterons très bientôt pour confirmer votre réservation.",
    });
    setFormData({
      name: '',
      email: '',
      phone: '',
      date: '',
      time: '',
      guests: '2'
    });
  };

  return (
    <section id="reservation" className="py-16 sm:py-24 bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary))_0.05,transparent)]"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-primary">Réservation simplifiée</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-black text-foreground">
              Essayez notre système de réservation
            </h2>
            
            <p className="text-lg sm:text-xl text-muted-foreground">
              Testez gratuitement notre module de réservation en ligne. Simple, rapide et efficace pour gérer les réservations de vos clients.
            </p>

            <div className="space-y-4">
              {[
                'Confirmation instantanée par email',
                'Gestion intelligente des tables',
                'Rappels automatiques aux clients',
                'Statistiques de fréquentation'
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <span className="text-base text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Form */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Demander une démonstration
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Jean Dupont"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jean@exemple.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+241 XX XX XX XX"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date souhaitée
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Heure
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guests" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Nombre de personnes
                </Label>
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 h-12 text-base font-semibold">
                Demander une démonstration
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReservationSection;
