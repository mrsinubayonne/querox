import React, { useState } from 'react';
import PageWithSidebar from '@/components/PageWithSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Mail, UserPlus, Trash2, Shield, Copy, Key } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/EmptyState';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSubscription } from '@/hooks/useSubscription';
import SubscriptionPopup from '@/components/SubscriptionPopup';
import { useToast } from '@/hooks/use-toast';

const ROLES = [
  { value: 'manager', label: 'Manager', description: 'Gestion complète sauf équipe' },
  { value: 'serveur', label: 'Serveur', description: 'Commandes, réservations, clients' },
  { value: 'caissier', label: 'Caissier', description: 'Commandes, paiements, factures' },
  { value: 'cuisinier', label: 'Cuisinier', description: 'Consultation commandes et menu' },
  { value: 'livreur', label: 'Livreur', description: 'Consultation commandes et clients' }
];

const Equipe: React.FC = () => {
  const { teamMembers, loading, inviteMember, removeMember, toggleMemberStatus, canAddMoreMembers, getTeamLimit } = useTeamMembers();
  const { subscription } = useSubscription();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState('serveur');
  const [open, setOpen] = useState(false);

  const handleInvite = async () => {
    if (email) {
      await inviteMember(email, selectedRole, fullName, phone);
      setEmail('');
      setFullName('');
      setPhone('');
      setSelectedRole('serveur');
      setOpen(false);
    }
  };

  const copyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copié",
      description: "Le code d'accès a été copié dans le presse-papier"
    });
  };

  const getStatusBadge = (status: string) => {
    return <Badge className="bg-emerald-500">Actif</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const teamLimit = getTeamLimit();
  const canAdd = canAddMoreMembers();

  return (
    <SubscriptionGuard feature="la gestion d'équipe">
      <PageWithSidebar>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestion d'équipe</h1>
                <p className="text-gray-600">
                  {teamMembers.length} / {teamLimit} membres · Plan {subscription?.subscription_tier || 'starter'}
                </p>
              </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={!canAdd}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Ajouter un membre
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un membre d'équipe</DialogTitle>
                  <DialogDescription>
                    Un code d'accès unique sera généré pour ce membre. Il pourra se connecter sur la page de connexion principale avec son email et ce code.
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
                    <Label htmlFor="email">Adresse email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                    <Label htmlFor="role">Rôle</Label>
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
                    onClick={handleInvite} 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={!email}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Générer le code d'accès
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Limite info */}
          {!canAdd && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-900">
                      Limite de membres atteinte
                    </p>
                    <p className="text-sm text-orange-700">
                      Passez à un plan supérieur pour ajouter plus de membres (Pro: 5 membres, Entreprise: 10 membres)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team Members List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : teamMembers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Aucun membre d'équipe"
              description="Invitez des membres pour collaborer avec votre équipe"
            />
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold">{member.full_name || member.member_email}</h3>
                            {getStatusBadge(member.status)}
                            {!member.is_active && <Badge variant="secondary">Désactivé</Badge>}
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{member.member_email} {member.phone && `• ${member.phone}`}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <span className="flex items-center gap-1">
                              <Shield className="w-4 h-4" />
                              {ROLES.find(r => r.value === member.role)?.label || member.role}
                            </span>
                            <span>Ajouté le {formatDate(member.invited_at)}</span>
                            {member.last_login_at && <span>• Dernière connexion: {formatDate(member.last_login_at)}</span>}
                            <span>• {member.actions_count} actions</span>
                          </div>
                           {(member as any).access_code && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-blue-900 flex items-center gap-1">
                                  <Key className="w-3 h-3" />
                                  Code d'accès à partager
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyAccessCode((member as any).access_code)}
                                  className="h-6 px-2"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                              <code className="block px-3 py-2 bg-white text-blue-700 rounded font-mono text-base font-bold text-center border border-blue-300">
                                {(member as any).access_code}
                              </code>
                              <p className="text-xs text-blue-600 mt-2">
                                Le membre doit se connecter sur <strong>/team-login</strong> avec son email et ce code
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={member.is_active ? "outline" : "default"}
                          onClick={() => toggleMemberStatus(member.id, member.is_active)}
                        >
                          {member.is_active ? "Désactiver" : "Activer"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeMember(member.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        <SubscriptionPopup />
      </PageWithSidebar>
    </SubscriptionGuard>
  );
};

export default Equipe;
