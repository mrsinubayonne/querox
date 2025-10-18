import React, { useState } from 'react';
import PageWithSidebar from '@/components/PageWithSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const StaffRequest: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    restaurantName: '',
    contactPerson: '',
    phone: '',
    email: '',
    position: '',
    numberOfStaff: '1',
    startDate: '',
    requirements: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const message = `🍽️ *Demande de Personnel*\n\n` +
      `Restaurant: ${formData.restaurantName}\n` +
      `Contact: ${formData.contactPerson}\n` +
      `Téléphone: ${formData.phone}\n` +
      `Email: ${formData.email}\n` +
      `Poste: ${formData.position}\n` +
      `Nombre: ${formData.numberOfStaff}\n` +
      `Date de début: ${formData.startDate}\n` +
      `Exigences: ${formData.requirements}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/237656565656?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Redirection vers WhatsApp",
      description: "Votre demande va être envoyée via WhatsApp"
    });
  };

  return (
    <PageWithSidebar>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mise à disposition du personnel</h1>
            <p className="text-gray-600">Trouvez le personnel qualifié pour votre restaurant</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Demande de personnel</CardTitle>
            <CardDescription>
              Remplissez ce formulaire et nous vous contacterons via WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="restaurantName">Nom du restaurant *</Label>
                  <Input
                    id="restaurantName"
                    required
                    value={formData.restaurantName}
                    onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                    placeholder="Mon Restaurant"
                  />
                </div>

                <div>
                  <Label htmlFor="contactPerson">Personne de contact *</Label>
                  <Input
                    id="contactPerson"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Jean Dupont"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+237 6XX XXX XXX"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@restaurant.com"
                  />
                </div>

                <div>
                  <Label htmlFor="position">Poste recherché *</Label>
                  <Select 
                    value={formData.position} 
                    onValueChange={(value) => setFormData({ ...formData, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un poste" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serveur">Serveur</SelectItem>
                      <SelectItem value="cuisinier">Cuisinier</SelectItem>
                      <SelectItem value="chef">Chef de cuisine</SelectItem>
                      <SelectItem value="caissier">Caissier</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="plongeur">Plongeur</SelectItem>
                      <SelectItem value="barman">Barman</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="numberOfStaff">Nombre de personnes *</Label>
                  <Input
                    id="numberOfStaff"
                    type="number"
                    min="1"
                    required
                    value={formData.numberOfStaff}
                    onChange={(e) => setFormData({ ...formData, numberOfStaff: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="startDate">Date de début souhaitée *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="requirements">Exigences particulières</Label>
                <Textarea
                  id="requirements"
                  rows={4}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Expérience requise, horaires, compétences spécifiques..."
                />
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                <Send className="w-4 h-4 mr-2" />
                Envoyer via WhatsApp
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageWithSidebar>
  );
};

export default StaffRequest;
