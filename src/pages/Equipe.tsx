import React, { useState } from 'react';
import PageWithSidebar from '@/components/PageWithSidebar';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useOutlets } from '@/hooks/useOutlets';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Trash2, Shield, Share2, KeyRound } from 'lucide-react';
import { InvitationShareOptions } from '@/components/team/InvitationShareOptions';
import { AddMemberWizard } from '@/components/team/AddMemberWizard';
import { SetTeamMemberPinDialog } from '@/components/team/SetTeamMemberPinDialog';
import { RestaurantCodeCard } from '@/components/team/RestaurantCodeCard';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/EmptyState';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';

const Equipe: React.FC = () => {
  const { teamMembers, loading, inviteMember, removeMember, toggleMemberStatus, canAddMoreMembers, getTeamLimit } = useTeamMembers();
  const { subscription } = useSubscription();
  const { outlets, loading: outletsLoading } = useOutlets();
  const { permissions, loading: permissionsLoading } = usePermissions();
  const [open, setOpen] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState<{show: boolean, member: any} | null>(null);
  const [pinDialogMember, setPinDialogMember] = useState<any | null>(null);

  const handleInvite = async (data: {
    fullName: string;
    email: string;
    selectedPermissions: string[];
    selectedOutlets: string[];
  }) => {
    await inviteMember(data.email, 'membre', data.fullName, '', data.selectedOutlets, data.selectedPermissions);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { data: updatedMembers } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (updatedMembers && updatedMembers.length > 0) {
      setShowShareOptions({ show: true, member: updatedMembers[0] });
    }
    
    setOpen(false);
  };

  const getStatusBadge = (status: string) => {
    return <Badge className="bg-emerald-500 text-emerald-50">Actif</Badge>;
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
                <h1 className="text-2xl font-bold text-foreground">Gestion d'équipe</h1>
                <p className="text-muted-foreground">
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
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Ajouter un membre d'équipe</DialogTitle>
                  <DialogDescription>
                    Un code d'accès unique sera généré pour ce membre.
                  </DialogDescription>
                </DialogHeader>
                <AddMemberWizard
                  permissions={permissions}
                  permissionsLoading={permissionsLoading}
                  outlets={outlets}
                  outletsLoading={outletsLoading}
                  onSubmit={handleInvite}
                />
              </DialogContent>
            </Dialog>
          </div>
          {/* Code restaurant pour connexion équipe (mode PIN) */}
          <RestaurantCodeCard />

          {/* Limite info */}
          {!canAdd && (
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-900 dark:text-orange-200">
                      Limite de membres atteinte
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-400">
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
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shrink-0">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-lg font-semibold text-foreground">{member.full_name || member.member_email}</h3>
                            {getStatusBadge(member.status)}
                            {!member.is_active && <Badge variant="secondary">Désactivé</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 truncate">{member.member_email} {member.phone && `• ${member.phone}`}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2 flex-wrap">
                            <span>Ajouté le {formatDate(member.invited_at)}</span>
                            {member.last_login_at && <span>• Dernière connexion: {formatDate(member.last_login_at)}</span>}
                            <span>• {member.actions_count} actions</span>
                          </div>
                          {/* PDV assignés */}
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
                                className="w-full md:w-auto"
                              >
                                <Share2 className="w-4 h-4 mr-2" />
                                Options de partage
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPinDialogMember(member)}
                          title="Définir un pseudo et un PIN pour ce membre"
                        >
                          <KeyRound className="w-4 h-4 mr-1" />
                          PIN
                        </Button>
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

          {/* Set PIN Dialog */}
          {pinDialogMember && (
            <SetTeamMemberPinDialog
              open={!!pinDialogMember}
              onOpenChange={(o) => !o && setPinDialogMember(null)}
              memberId={pinDialogMember.id}
              memberName={pinDialogMember.full_name || pinDialogMember.member_email}
              currentPseudo={(pinDialogMember as any).pseudo || ''}
            />
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
      </PageWithSidebar>
    </SubscriptionGuard>
  );
};

export default Equipe;
