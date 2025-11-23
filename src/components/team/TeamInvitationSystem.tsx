import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Mail, Send, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

const ROLES = [
  { value: 'manager', label: 'Manager', description: 'Gestion complète sauf équipe' },
  { value: 'serveur', label: 'Serveur', description: 'Commandes, réservations, clients' },
  { value: 'caissier', label: 'Caissier', description: 'Commandes, paiements, factures' },
  { value: 'cuisinier', label: 'Cuisinier', description: 'Consultation commandes et menu' },
  { value: 'livreur', label: 'Livreur', description: 'Consultation commandes et clients' }
];

interface TeamInvitation {
  id: string;
  member_email: string;
  full_name?: string;
  role: string;
  status: string;
  invited_at: string;
  access_code?: string;
}

export const TeamInvitationSystem: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState('serveur');
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(false);

  const sendInvitation = async () => {
    if (!user || !email) return;

    if (!profile?.selected_outlet_id) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un point de vente avant d'inviter des membres",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Générer un token d'invitation unique
      const invitationToken = crypto.randomUUID();
      const invitationLink = `${window.location.origin}/team-join?token=${invitationToken}`;

      // Insérer l'invitation dans la base de données
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          owner_id: user.id,
          member_email: email,
          full_name: fullName || null,
          phone: phone || null,
          role: selectedRole,
          status: 'pending',
          access_code: invitationToken,
          outlet_id: profile.selected_outlet_id,
          needs_password_setup: true,
          is_active: false
        })
        .select()
        .single();

      if (error) throw error;

      // Envoyer l'email d'invitation (via edge function)
      const { error: emailError } = await supabase.functions.invoke('send-team-invitation', {
        body: {
          to: email,
          full_name: fullName,
          role: selectedRole,
          invitation_link: invitationLink,
          owner_email: user.email
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
        toast({
          title: "Invitation créée",
          description: `Invitation créée mais l'email n'a pas pu être envoyé. Lien: ${invitationLink}`,
          variant: "default"
        });
      } else {
        toast({
          title: "Invitation envoyée ! 📧",
          description: `Un email d'invitation a été envoyé à ${email}`,
        });
      }

      // Réinitialiser le formulaire
      setEmail('');
      setFullName('');
      setPhone('');
      setSelectedRole('serveur');
      setOpen(false);

      // Rafraîchir la liste des invitations
      fetchInvitations();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer l'invitation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('owner_id', user.id)
        .order('invited_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const resendInvitation = async (invitation: TeamInvitation) => {
    try {
      const invitationLink = `${window.location.origin}/team-join?token=${invitation.access_code}`;
      
      await supabase.functions.invoke('send-team-invitation', {
        body: {
          to: invitation.member_email,
          full_name: invitation.full_name,
          role: invitation.role,
          invitation_link: invitationLink,
          owner_email: user?.email
        }
      });

      toast({
        title: "Invitation renvoyée",
        description: `Un nouvel email a été envoyé à ${invitation.member_email}`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de renvoyer l'invitation",
        variant: "destructive"
      });
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Invitation annulée",
        description: "L'invitation a été supprimée",
      });

      fetchInvitations();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler l'invitation",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'accepted':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Acceptée</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Refusée</Badge>;
      default:
        return null;
    }
  };

  React.useEffect(() => {
    fetchInvitations();
  }, [user]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Invitations par email
              </CardTitle>
              <CardDescription>
                Invitez des membres d'équipe directement par email. Ils recevront un lien pour rejoindre votre équipe.
              </CardDescription>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Inviter par email
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Inviter un membre d'équipe</DialogTitle>
                  <DialogDescription>
                    La personne recevra un email avec un lien d'invitation pour rejoindre votre équipe.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="fullName">Nom complet</Label>
                    <Input
                      id="fullName"
                      placeholder="Jean Dupont"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Adresse email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+33 6 12 34 56 78"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="role">Rôle *</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div>
                              <div className="font-medium">{role.label}</div>
                              <div className="text-xs text-gray-500">{role.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    onClick={sendInvitation} 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={!email || loading}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? 'Envoi en cours...' : 'Envoyer l\'invitation'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune invitation envoyée</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{invitation.full_name || invitation.member_email}</span>
                      {getStatusBadge(invitation.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {invitation.member_email} • {ROLES.find(r => r.value === invitation.role)?.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Invité le {new Date(invitation.invited_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {invitation.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resendInvitation(invitation)}
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Renvoyer
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => cancelInvitation(invitation.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
