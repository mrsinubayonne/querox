import React, { useState } from 'react';
import PageWithSidebar from '@/components/PageWithSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useOutlets } from '@/hooks/useOutlets';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Mail, UserPlus, Trash2, Shield, Copy, Key, Share2 } from 'lucide-react';
import { InvitationShareOptions } from '@/components/team/InvitationShareOptions';
import { PermissionSelector } from '@/components/team/PermissionSelector';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/EmptyState';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Equipe: React.FC = () => {
  const { teamMembers, loading, inviteMember, removeMember, toggleMemberStatus, canAddMoreMembers, getTeamLimit } = useTeamMembers();
  const { subscription } = useSubscription();
  const { outlets, loading: outletsLoading } = useOutlets();
  const { permissions, loading: permissionsLoading } = usePermissions();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState<{show: boolean, member: any} | null>(null);

  const handleInvite = async () => {
    // Validation
    if (!fullName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez entrer le nom complet du membre",
        variant: "destructive"
      });
      return;
    }

    if (!email.trim()) {
      toast({
        title: "Email requis",
        description: "Veuillez entrer l'adresse email du membre",
        variant: "destructive"
      });
      return;
    }

    if (selectedOutlets.length === 0) {
      toast({
        title: "PDV requis",
        description: "Veuillez sélectionner au moins un point de vente",
        variant: "destructive"
      });
      return;
    }

    if (selectedPermissions.length === 0) {
      toast({
        title: "Permissions requises",
        description: "Veuillez sélectionner au moins une permission",
        variant: "destructive"
      });
      return;
    }

    await inviteMember(email, 'membre', fullName, phone, selectedOutlets, selectedPermissions);
    
    // Small delay then fetch the newly created member
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { data: updatedMembers } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (updatedMembers && updatedMembers.length > 0) {
      setShowShareOptions({ show: true, member: updatedMembers[0] });
    }
    
    setEmail('');
    setFullName('');
    setPhone('');
    setSelectedPermissions([]);
    setSelectedOutlets([]);
    setOpen(false);
  };
  
  const toggleOutletSelection = (outletId: string) => {
    setSelectedOutlets(prev => 
      prev.includes(outletId) 
        ? prev.filter(id => id !== outletId)
        : [...prev, outletId]
    );
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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion d'équipe</h1>
              <p className="text-gray-600">
                Invitez et gérez vos membres d'équipe
              </p>
            </div>
          </div>

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
                    <Label htmlFor="email">Adresse email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      L'email est requis. Le membre se connectera avec cet email et son code d'accès.
                    </p>
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
                    <Label>Permissions *</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Sélectionnez les accès que ce membre aura
                    </p>
                    <PermissionSelector
                      permissions={permissions}
                      selectedPermissions={selectedPermissions}
                      onChange={setSelectedPermissions}
                      loading={permissionsLoading}
                    />
                  </div>

                  <div>
                    <Label>Points de vente assignés *</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Sélectionnez les PDV auxquels ce membre aura accès
                    </p>
                    {outletsLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                      </div>
                    ) : outlets.length === 0 ? (
                      <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                        Aucun point de vente disponible. Créez d'abord un PDV.
                      </div>
                    ) : (
                      <div className="space-y-2 border rounded-md p-3 max-h-32 overflow-y-auto">
                        {outlets.map((outlet) => (
                          <label 
                            key={outlet.id} 
                            className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedOutlets.includes(outlet.id)}
                              onChange={() => toggleOutletSelection(outlet.id)}
                              className="w-4 h-4 text-purple-600 rounded"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{outlet.name}</div>
                              {outlet.address && (
                                <div className="text-xs text-muted-foreground">{outlet.address}</div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                    {selectedOutlets.length > 0 && (
                      <p className="text-xs text-purple-600 mt-2">
                        {selectedOutlets.length} PDV sélectionné{selectedOutlets.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    onClick={handleInvite} 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={selectedOutlets.length === 0 || selectedPermissions.length === 0}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Créer l'invitation
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
                            <span>Ajouté le {formatDate(member.invited_at)}</span>
                            {member.last_login_at && <span>• Dernière connexion: {formatDate(member.last_login_at)}</span>}
                            <span>• {member.actions_count} actions</span>
                          </div>
                          {/* Afficher les PDV assignés */}
                          {member.outlets && member.outlets.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap mt-2">
                              <span className="text-xs text-muted-foreground">PDV:</span>
                              {member.outlets.map((outlet) => (
                                <Badge key={outlet.outlet_id} variant="outline" className="text-xs">
                                  {outlet.outlet_name}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {(member as any).access_code && (
                            <div className="mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowShareOptions({ show: true, member })}
                                className="w-full"
                              >
                                <Share2 className="w-4 h-4 mr-2" />
                                Afficher les options de partage
                              </Button>
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

          {/* Share Options Modal */}
          <Dialog open={showShareOptions?.show || false} onOpenChange={(open) => !open && setShowShareOptions(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Options de partage d'invitation</DialogTitle>
                <DialogDescription>
                  Partagez cette invitation avec {showShareOptions?.member?.full_name || showShareOptions?.member?.member_email}
                </DialogDescription>
              </DialogHeader>
              {showShareOptions?.member && (
                <InvitationShareOptions
                  accessCode={showShareOptions.member.access_code}
                  invitationToken={showShareOptions.member.access_code}
                  memberName={showShareOptions.member.full_name}
                  memberEmail={showShareOptions.member.member_email}
                />
              )}
            </DialogContent>
          </Dialog>
              </div>
        </div>
      </PageWithSidebar>
    </SubscriptionGuard>
  );
};

export default Equipe;
